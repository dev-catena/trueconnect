<?php

namespace App\Http\Controllers;

use App\Models\ClausulaTipoContrato;
use App\Models\Contrato;
use App\Models\ContratoClausula;
use App\Models\ContratoLog;
use App\Models\ContratoUsuario;
use App\Models\ContratoUsuarioClausula;
use App\Models\ContratoUsuarioPergunta;
use App\Models\Pergunta;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Exceptions\HttpResponseException;

class ContratoController extends Controller
{
    public function index()
    {
        $contratos = Contrato::with(['tipo', 'contratante'])->orderByDesc('id')->get();
        return $this->ok('OK', $contratos);
    }

    private function logContratoAlteracoes(Contrato $contrato, array $alteracoes, string $tabela = 'contratos', string $colunaPrefix = '')
    {
        $usuarioId = auth()->id();

        foreach ($alteracoes as $campo => [$valorAntigo, $valorNovo]) {
            if ($valorAntigo != $valorNovo) {
                $valorAntigo = is_array($valorAntigo) ? json_encode($valorAntigo, JSON_UNESCAPED_UNICODE) : $valorAntigo;
                $valorNovo = is_array($valorNovo) ? json_encode($valorNovo, JSON_UNESCAPED_UNICODE) : $valorNovo;

                ContratoLog::create([
                    'contrato_id' => $contrato->id,
                    'usuario_id' => $usuarioId,
                    'tabela' => $tabela,
                    'coluna' => $colunaPrefix . $campo,
                    'valor_antigo' => $valorAntigo,
                    'valor_novo' => $valorNovo,
                ]);
            }
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'contrato_tipo_id' => 'required|exists:contrato_tipos,id',
            'descricao' => 'nullable|string',
            'participantes' => 'array|required',
            'participantes.*' => 'exists:users,id',
            'clausulas' => 'array|required',
            'clausulas.*' => 'exists:clausulas,id',
            'duracao' => 'required|integer|min:1',
        ]);

        $validated['contratante_id'] = auth()->user()->id;
        $validated['status'] = 'Pendente';

        $inicio = Carbon::now('America/Sao_Paulo');
        $validated['dt_inicio'] = $inicio;
        $validated['dt_fim'] = $inicio->copy()->addHour();

        // Validação de cláusulas
        $clausulasPermitidas = ClausulaTipoContrato::where('contrato_tipo_id', $validated['contrato_tipo_id'])
            ->pluck('clausula_id')->toArray();

        $clausulasInvalidas = collect($validated['clausulas'])->diff($clausulasPermitidas);
        if ($clausulasInvalidas->isNotEmpty()) {
            return $this->fail('Cláusulas inválidas para o tipo de contrato selecionado.', null, 422);
        }

        // Geração automática do código
        $ano = Carbon::now()->year;
        $ultimoNumero = Contrato::whereYear('created_at', $ano)
            ->orderByDesc('id')
            ->pluck('codigo')
            ->map(fn($codigo) => intval(explode('/', $codigo)[0]))
            ->first() ?? 0;

        $novoNumero = str_pad($ultimoNumero + 1, 6, '0', STR_PAD_LEFT);
        $validated['codigo'] = "{$novoNumero}/{$ano}";

        DB::beginTransaction();

        try {
            $contrato = Contrato::create($validated);

            foreach ($validated['clausulas'] as $clausulaId) {
                ContratoClausula::create([
                    'contrato_id' => $contrato->id,
                    'clausula_id' => $clausulaId,
                ]);
            }

            $usuarios = collect($validated['participantes'])
                ->push($validated['contratante_id'])
                ->unique();

            $perguntas = Pergunta::where('contrato_tipo_id', $validated['contrato_tipo_id'])->get();

            foreach ($usuarios as $usuarioId) {
                $contratoUsuario = ContratoUsuario::create([
                    'contrato_id' => $contrato->id,
                    'usuario_id' => $usuarioId,
                ]);

                foreach ($validated['clausulas'] as $clausulaId) {
                    $contratoClausulaId = ContratoClausula::where('contrato_id', $contrato->id)
                        ->where('clausula_id', $clausulaId)->first()->id;

                    ContratoUsuarioClausula::create([
                        'contrato_usuario_id' => $contratoUsuario->id,
                        'contrato_clausula_id' => $contratoClausulaId,
                        'aceito' => null,
                    ]);
                }

                foreach ($perguntas as $pergunta) {
                    ContratoUsuarioPergunta::create([
                        'contrato_id' => $contrato->id,
                        'pergunta_id' => $pergunta->id,
                        'usuario_id' => $usuarioId,
                        'resposta' => null,
                    ]);
                }
            }

            DB::commit();

            return $this->ok('Contrato criado com sucesso.', $contrato->load([
                'tipo:id,codigo,descricao',
                'contratante:id,nome_completo,CPF'
            ]), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->fail('Erro ao criar contrato', $e, 500);
        }
    }

    public function showCompleto($id)
    {
        $contrato = Contrato::with([
            'tipo:id,codigo,descricao',
            'tipo.perguntas:id,contrato_tipo_id,descricao,alternativas,tipo_alternativa',
            'contratante:id,nome_completo,email,CPF',
            'clausulasContrato.clausula:id,codigo,nome,descricao,sexual',
            'participantes.usuario:id,nome_completo,email,CPF'
        ])->find($id);

        if (!$contrato) {
            return $this->fail('Contrato não encontrado', null, 404);
        }

        // Clausulas com agrupamento por status
        $clausulasDetalhadas = $contrato->clausulasContrato->map(function ($contratoClausula) {
            $usuariosRelacionados = ContratoUsuarioClausula::where('contrato_clausula_id', $contratoClausula->id)
                ->with('contratoUsuario')
                ->get();

            $pendente = [];
            $aceito = [];
            $recusado = [];

            foreach ($usuariosRelacionados as $rel) {
                $usuarioId = $rel->contratoUsuario->usuario_id ?? null;

                if (is_null($rel->aceito)) {
                    $pendente[] = $usuarioId;
                } elseif ($rel->aceito === true) {
                    $aceito[] = $usuarioId;
                } elseif ($rel->aceito === false) {
                    $recusado[] = $usuarioId;
                }
            }

            return [
                'id' => $contratoClausula->clausula->id ?? null,
                'codigo' => $contratoClausula->clausula->codigo ?? null,
                'nome' => $contratoClausula->clausula->nome ?? null,
                'descricao' => $contratoClausula->clausula->descricao ?? null,
                'sexual' => $contratoClausula->clausula->sexual ?? 0,
                'pendente_para' => array_values(array_filter($pendente)),
                'aceito_por' => array_values(array_filter($aceito)),
                'recusado_por' => array_values(array_filter($recusado)),
            ];
        });

        // Participantes com respostas de perguntas do contrato específico
        $perguntas = Pergunta::where('contrato_tipo_id', $contrato->contrato_tipo_id)->get();
        $contrato_id = $contrato->id;

        $participantes = $contrato->participantes->map(function ($participante) use ($perguntas, $contrato_id) {
            $respostas = $perguntas->map(function ($pergunta) use ($participante, $contrato_id) {
                $resposta = ContratoUsuarioPergunta::where('pergunta_id', $pergunta->id)
                    ->where('usuario_id', $participante->usuario_id)
                    ->where('contrato_id', $contrato_id)
                    ->first();

                return [
                    'pergunta_id' => $pergunta->id,
                    'descricao' => $pergunta->descricao,
                    'alternativas' => $pergunta->alternativas,
                    'tipo_alternativa' => $pergunta->tipo_alternativa,
                    'resposta' => $resposta?->resposta
                ];
            });

            $usuario = $participante->usuario;

            return [
                'id' => $usuario->id,
                'nome_completo' => $usuario->nome_completo,
                'email' => $usuario->email,
                'CPF' => $usuario->CPF,
                'respostas' => $respostas
            ];
        });

        // Assinaturas (aceites de participantes)
        $assinaturas = $contrato->participantes->map(function ($participante) {
            return [
                'usuario_id' => $participante->usuario_id,
                'usuario_nome' => $participante->usuario->nome_completo ?? null,
                'aceito' => $participante->aceito,
                'dt_aceito' => $participante->dt_aceito ?? null
            ];
        });

        return $this->ok('OK', [
            'id' => $contrato->id,
            'codigo' => $contrato->codigo,
            'descricao' => $contrato->descricao,
            'status' => $contrato->status,
            'duracao' => $contrato->duracao,
            'dt_inicio' => $contrato->dt_inicio,
            'dt_fim' => $contrato->dt_fim,
            'tipo' => $contrato->tipo,
            'contratante' => $contrato->contratante,
            'clausulas' => $clausulasDetalhadas,
            'participantes' => $participantes,
            'assinaturas' => $assinaturas
        ]);
    }

    public function update(Request $request, $id)
    {
        $contrato = Contrato::find($id);

        if (!$contrato) {
            return $this->fail('Contrato não encontrado', null, 404);
        }

        $this->verificarExpiracaoContrato($contrato);

        $validated = $request->validate([
            'codigo' => 'sometimes|string|max:25',
            'contrato_tipo_id' => 'sometimes|exists:contrato_tipos,id',
            'descricao' => 'nullable|string',
            'contratante_id' => 'sometimes|exists:users,id',
            'status' => 'sometimes|in:Pendente,Ativo,Concluído,Suspenso',
            'participantes' => 'sometimes|array',
            'participantes.*' => 'exists:users,id',
            'clausulas' => 'sometimes|array',
            'clausulas.*' => 'exists:clausulas,id',
            'duracao' => 'nullable|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            // Regras adicionais para status Ativo
            if (($validated['status'] ?? null) === 'Ativo') {
                $duracao = $contrato->duracao ?? 2;

                $agora = now()->setTimezone('America/Sao_Paulo');
                $validated['dt_inicio'] = $agora;
                $validated['dt_fim'] = $agora->copy()->addHours($duracao);
            }

            $contratoAntes = $contrato->replicate()->toArray();
            $contrato->update($validated);

            // Logs de alterações básicas
            $alteracoes = [];
            foreach ($validated as $campo => $valorNovo) {
                if (in_array($campo, ['participantes', 'clausulas'])) continue;
                $valorAntigo = $contratoAntes[$campo] ?? null;
                $alteracoes[$campo] = [$valorAntigo, $valorNovo];
            }
            $this->logContratoAlteracoes($contrato, $alteracoes);

            // Participantes
            if (isset($validated['participantes'])) {
                $novosIds = collect($validated['participantes'])->unique()->values()->all();
                $anterioresIds = $contrato->usuarios()->pluck('users.id')->toArray();

                if ($novosIds !== $anterioresIds) {
                    $this->logContratoAlteracoes($contrato, [
                        'usuario_id' => [$anterioresIds, $novosIds]
                    ], 'contrato_usuarios');
                }

                $contrato->usuarios()->sync($novosIds);
            }

            // Cláusulas
            if (isset($validated['clausulas'])) {
                $tipoContratoId = $validated['contrato_tipo_id'] ?? $contrato->contrato_tipo_id;

                $permitidas = ClausulaTipoContrato::where('contrato_tipo_id', $tipoContratoId)
                    ->pluck('clausula_id')->toArray();

                $invalidas = collect($validated['clausulas'])->diff($permitidas);
                if ($invalidas->isNotEmpty()) {
                    return $this->fail('Cláusulas inválidas para o tipo de contrato selecionado.', null, 422);
                }

                // Atualiza as cláusulas do contrato (ContratoClausula)
                $atuais = $contrato->clausulas()->pluck('clausula_id')->toArray();
                $novas = collect($validated['clausulas'])->unique()->values()->all();

                $incluir = array_diff($novas, $atuais);
                $remover = array_diff($atuais, $novas);

                foreach ($incluir as $clausulaId) {
                    \App\Models\ContratoClausula::create([
                        'contrato_id' => $contrato->id,
                        'clausula_id' => $clausulaId,
                    ]);
                }

                \App\Models\ContratoClausula::where('contrato_id', $contrato->id)
                    ->whereIn('clausula_id', $remover)
                    ->forceDelete();

                // Atualiza cláusulas por usuário (ContratoUsuarioClausula)
                $usuariosContrato = $contrato->usuarios()->pluck('users.id')->push($contrato->contratante_id)->unique();

                foreach ($usuariosContrato as $usuarioId) {
                    $contratoUsuario = ContratoUsuario::firstOrCreate([
                        'contrato_id' => $contrato->id,
                        'usuario_id' => $usuarioId
                    ]);

                    $atuaisCUC = $contratoUsuario->clausulas()->pluck('contrato_clausula_id')->toArray();

                    $clausulasContrato = \App\Models\ContratoClausula::where('contrato_id', $contrato->id)->pluck('id', 'clausula_id');

                    $novasCUC = collect($novas)
                        ->map(fn($cid) => $clausulasContrato[$cid] ?? null)
                        ->filter()
                        ->values()
                        ->toArray();

                    $addCUC = array_diff($novasCUC, $atuaisCUC);
                    foreach ($addCUC as $contratoClausulaId) {
                        \App\Models\ContratoUsuarioClausula::create([
                            'contrato_usuario_id' => $contratoUsuario->id,
                            'contrato_clausula_id' => $contratoClausulaId,
                            'aceito' => null,
                        ]);
                    }

                    $remCUC = array_diff($atuaisCUC, $novasCUC);
                    if (!empty($remCUC)) {
                        \App\Models\ContratoUsuarioClausula::where('contrato_usuario_id', $contratoUsuario->id)
                            ->whereIn('contrato_clausula_id', $remCUC)
                            ->forceDelete();
                    }
                }
            }

            DB::commit();

            return $this->ok(
                'Contrato atualizado com sucesso.',
                $contrato->load(['tipo', 'contratante', 'usuarios'])
            );
        } catch (HttpResponseException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->fail('Erro ao atualizar contrato', $e, 500);
        }
    }

    private function verificarExpiracaoContrato(Contrato $contrato)
    {
        $agora = now('America/Sao_Paulo');
        $dtFim = Carbon::parse($contrato->dt_fim, 'America/Sao_Paulo');

        if ($dtFim <= $agora) {
            if ($contrato->status === 'Ativo') {
                $contrato->update(['status' => 'Concluído']);
            } elseif ($contrato->status === 'Pendente') {
                $contrato->update(['status' => 'Expirado']);
            }

            throw new HttpResponseException(
                $this->fail('Contrato expirado. Não é possível alterá-lo.', null, 403)
            );
        }
    }

    public function logs($id)
    {
        $contrato = Contrato::find($id);

        if (!$contrato) {
            return $this->fail('Contrato não encontrado', null, 404);
        }

        $logs = $contrato->logs()->with('usuario')->latest()->get();

        return $this->ok('OK', [
            'contrato_id' => $contrato->id,
            'logs' => $logs
        ]);
    }

    public function destroy($id)
    {
        $contrato = Contrato::find($id);

        if (!$contrato) {
            return $this->fail('Contrato não encontrado', null, 404);
        }

        $contrato->delete();

        return $this->ok('Contrato excluído com sucesso.');
    }

    public function responderContrato(Request $request, $contratoId)
    {
        $validated = $request->validate([
            'aceito' => 'required|boolean',
        ]);

        $usuarioId = auth()->id();

        $contratoUsuario = ContratoUsuario::where('contrato_id', $contratoId)
            ->where('usuario_id', $usuarioId)
            ->first();

        if (!$contratoUsuario) {
            return $this->fail('Usuário não está vinculado a este contrato.', null, 404);
        }

        $contratoUsuario->update([
            'aceito' => $validated['aceito'],
            'dt_aceito' => now('America/Sao_Paulo'),
        ]);

        return $this->ok(
            $validated['aceito'] ? 'Contrato aceito com sucesso.' : 'Contrato recusado.'
        );
    }

    public function alterarStatusContrato(Request $request)
    {
        $validated = $request->validate([
            'expirado_ids' => 'sometimes|nullable|array',
            'expirado_ids.*' => 'integer|exists:contratos,id',
            'concluido_ids' => 'sometimes|nullable|array',
            'concluido_ids.*' => 'integer|exists:contratos,id',
        ]);

        if (!empty($validated['expirado_ids'])) {
            Contrato::whereIn('id', $validated['expirado_ids'])->update([
                'status' => 'Expirado',
            ]);
        }

        if (!empty($validated['concluido_ids'])) {
            Contrato::whereIn('id', $validated['concluido_ids'])->update([
                'status' => 'Concluído',
            ]);
        }

        return $this->ok('Status de contratos atualizado com sucesso.');
    }
}
