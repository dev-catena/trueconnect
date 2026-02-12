<?php

namespace App\Http\Controllers;

use App\Models\ClausulaTipoContrato;
use App\Models\Contrato;
use App\Models\ContratoClausula;
use App\Models\ParametroSistema;
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
        try {
            $usuario = auth()->user();
            if (!$usuario) {
                return $this->fail('Usuário não autenticado.', null, 401);
            }

            // Buscar IDs de contratos que o usuário excluiu para si mesmo (incluindo soft-deleted)
            // Usar distinct() para evitar IDs duplicados
            $contratosExcluidos = ContratoUsuario::withTrashed()
                ->where('usuario_id', $usuario->id)
                ->whereNotNull('deleted_at')
                ->distinct()
                ->pluck('contrato_id')
                ->toArray();

            $contratos = Contrato::with(['tipo', 'contratante'])
                ->where(function($query) use ($usuario) {
                    $query->where('contratante_id', $usuario->id)
                        ->orWhereHas('participantes', function($q) use ($usuario) {
                            $q->where('usuario_id', $usuario->id)
                              ->whereNull('deleted_at'); // Filtrar participantes excluídos
                        });
                })
                ->whereNull('deleted_at') // Filtrar contratos excluídos completamente
                ->whereNotIn('id', $contratosExcluidos) // Excluir contratos que o usuário removeu para si
                ->orderByDesc('id')
                ->get();

            $contratosFormatados = $contratos->map(function($contrato) {
                return [
                    'id' => $contrato->id,
                    'codigo' => $contrato->codigo,
                    'descricao' => $contrato->descricao,
                    'status' => $contrato->status,
                    'duracao' => $contrato->duracao,
                    'dt_inicio' => $contrato->dt_inicio,
                    'dt_fim' => $contrato->dt_fim,
                    'dt_prazo_assinatura' => $contrato->dt_prazo_assinatura,
                    'tipo' => $contrato->tipo ? [
                        'id' => $contrato->tipo->id,
                        'nome' => $contrato->tipo->nome,
                        'descricao' => $contrato->tipo->descricao,
                    ] : null,
                    'contratante' => $contrato->contratante ? [
                        'id' => $contrato->contratante->id,
                        'nome_completo' => $contrato->contratante->nome_completo,
                        'email' => $contrato->contratante->email,
                    ] : null,
                ];
            });

            return $this->ok('Contratos recuperados com sucesso.', $contratosFormatados);
        } catch (\Exception $e) {
            \Log::error('Erro ao listar contratos: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return $this->fail('Erro ao recuperar contratos.', null, 500);
        }
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
            'participantes' => 'required|array|min:1',
            'participantes.*' => 'required|exists:users,id',
            'clausulas' => 'required|array|min:1',
            'clausulas.*' => 'required|exists:clausulas,id',
            'duracao' => 'required|integer|min:1',
        ]);

        $validated['contratante_id'] = auth()->user()->id;
        $validated['status'] = 'Pendente';

        // As datas serão definidas quando o contrato for assinado por todas as partes
        $validated['dt_inicio'] = null;
        $validated['dt_fim'] = null;

        // Prazo para assinatura: parametrizado (default 1 hora)
        $tempoHoras = ParametroSistema::getValorInt('tempo_assinatura_contrato_horas', 1);
        $validated['dt_prazo_assinatura'] = Carbon::now('America/Sao_Paulo')->addHours($tempoHoras);

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

        // Verificar limite de contratos (considerando plano + compras adicionais)
        $user = auth()->user();
        if (!$user) {
            return $this->fail('Usuário não autenticado.', null, 401);
        }
        
        try {
            if (!$user->canCreateContract()) {
                $limit = $user->getTotalContractsLimit();
                $current = $user->contratosContratante()
                    ->whereIn('status', ['Ativo', 'Pendente'])
                    ->count();

                // Quando não há assinatura/plano com contratos incluídos,
                // o limite calculado acaba sendo 0. Nesse caso, a mensagem
                // precisa orientar o usuário a contratar um plano.
                if ($limit === 0) {
                    return $this->fail(
                        'Você ainda não possui um plano ativo que permita criar contratos. ' .
                        'Para criar seu primeiro contrato, contrate um plano na área de assinaturas.',
                        null,
                        403
                    );
                }
                
                return $this->fail(
                    "Você atingiu o limite de contratos ({$current}/{$limit}). " .
                    "Contrate mais contratos adicionais ou faça upgrade do seu plano para criar novos contratos.",
                    null,
                    403
                );
            }
        } catch (\Exception $e) {
            \Log::warning('Erro ao verificar limite de contratos', [
                'error' => $e->getMessage(),
                'user_id' => $user->id
            ]);
            // Continua mesmo se houver erro na verificação de limite
        }

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
                    $contratoClausula = ContratoClausula::where('contrato_id', $contrato->id)
                        ->where('clausula_id', $clausulaId)->first();

                    if (!$contratoClausula) {
                        throw new \Exception("Cláusula {$clausulaId} não foi encontrada no contrato {$contrato->id}");
                    }

                    ContratoUsuarioClausula::create([
                        'contrato_usuario_id' => $contratoUsuario->id,
                        'contrato_clausula_id' => $contratoClausula->id,
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
                'contratante:id,nome_completo,email'
            ]), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erro ao criar contrato', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
                'request_data' => $validated
            ]);
            return $this->fail('Erro ao criar contrato: ' . $e->getMessage(), $e, 500);
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

        // Verificar se todas as cláusulas estão coincidentes (todos aprovaram OU todos rejeitaram)
        $todasClausulasCoincidentes = $this->todasClausulasCoincidentes($contrato->id);
        
        // Identificar cláusulas em desacordo para exibição
        $clausulasEmDesacordo = [];
        $participantesContrato = ContratoUsuario::where('contrato_id', $contrato->id)->get();
        $totalParticipantes = $participantesContrato->count();
        
        foreach ($contrato->clausulasContrato as $contratoClausula) {
            $respostas = ContratoUsuarioClausula::where('contrato_clausula_id', $contratoClausula->id)
                ->whereNotNull('aceito')
                ->get();
            
            if ($respostas->count() >= $totalParticipantes) {
                $aprovacoes = $respostas->where('aceito', true)->count();
                $rejeicoes = $respostas->where('aceito', false)->count();
                
                // Se não está coincidente (não é todos aprovaram nem todos rejeitaram)
                if ($aprovacoes != $totalParticipantes && $rejeicoes != $totalParticipantes) {
                    $clausulasEmDesacordo[] = $contratoClausula->clausula_id;
                }
            }
        }
        
        // Verificar se o usuário atual pode assinar (todas as cláusulas coincidentes)
        $usuarioAtual = auth()->user();
        $podeAssinar = false;
        if ($usuarioAtual) {
            $contratoUsuarioAtual = ContratoUsuario::where('contrato_id', $contrato->id)
                ->where('usuario_id', $usuarioAtual->id)
                ->first();
            
            // Pode assinar se: todas as cláusulas estão coincidentes E o usuário ainda não assinou
            $podeAssinar = $todasClausulasCoincidentes && 
                          $contratoUsuarioAtual && 
                          $contratoUsuarioAtual->aceito === null;
        }

        return $this->ok('OK', [
            'id' => $contrato->id,
            'codigo' => $contrato->codigo,
            'descricao' => $contrato->descricao,
            'status' => $contrato->status,
            'duracao' => $contrato->duracao,
            'dt_inicio' => $contrato->dt_inicio,
            'dt_fim' => $contrato->dt_fim,
            'dt_prazo_assinatura' => $contrato->dt_prazo_assinatura,
            'tipo' => $contrato->tipo,
            'contratante' => $contrato->contratante,
            'clausulas' => $clausulasDetalhadas,
            'participantes' => $contrato->participantes->map(function ($participante) {
                return [
                    'usuario_id' => $participante->usuario_id,
                    'usuario' => $participante->usuario ? [
                        'id' => $participante->usuario->id,
                        'nome_completo' => $participante->usuario->nome_completo,
                        'email' => $participante->usuario->email,
                        'CPF' => $participante->usuario->CPF,
                    ] : null,
                    'aceito' => $participante->aceito,
                    'dt_aceito' => $participante->dt_aceito,
                ];
            }),
            'assinaturas' => $assinaturas,
            'todas_clausulas_coincidentes' => $todasClausulasCoincidentes,
            'clausulas_em_desacordo' => $clausulasEmDesacordo,
            'pode_assinar' => $podeAssinar
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
        try {
            $usuario = auth()->user();
            if (!$usuario) {
                return $this->fail('Usuário não autenticado.', null, 401);
            }

            $contrato = Contrato::find($id);
            if (!$contrato) {
                return $this->fail('Contrato não encontrado', null, 404);
            }

            // Verificar se o usuário tem relação com o contrato
            $isContratante = $contrato->contratante_id === $usuario->id;
            // Buscar relação ativa (não soft-deleted)
            $contratoUsuario = ContratoUsuario::where('contrato_id', $id)
                ->where('usuario_id', $usuario->id)
                ->first();
            
            // Se não encontrou relação ativa, verificar se existe soft-deleted
            $contratoUsuarioDeleted = null;
            if (!$contratoUsuario) {
                $contratoUsuarioDeleted = ContratoUsuario::withTrashed()
                    ->where('contrato_id', $id)
                    ->where('usuario_id', $usuario->id)
                    ->whereNotNull('deleted_at')
                    ->first();
            }

            if (!$isContratante && !$contratoUsuario && !$contratoUsuarioDeleted) {
                return $this->fail('Você não tem permissão para excluir este contrato.', null, 403);
            }

            // Sempre excluir apenas para o usuário específico
            // Se for contratante, criar ou atualizar a relação ContratoUsuario e fazer soft delete
            // Se for participante, fazer soft delete da relação existente
            if ($isContratante) {
                // Contratante: criar relação se não existir e fazer soft delete
                if (!$contratoUsuario) {
                    // Se já existe relação soft-deleted, não precisa fazer nada (já está excluído)
                    if ($contratoUsuarioDeleted) {
                        return $this->ok('Contrato já foi removido da sua lista anteriormente.');
                    }
                    
                    // Se não existe relação, criar nova e fazer soft delete
                    try {
                        $contratoUsuario = ContratoUsuario::create([
                            'contrato_id' => $id,
                            'usuario_id' => $usuario->id,
                            'aceito' => null,
                        ]);
                    } catch (\Exception $e) {
                        \Log::error('Erro ao criar relação ContratoUsuario: ' . $e->getMessage(), [
                            'contrato_id' => $id,
                            'usuario_id' => $usuario->id,
                            'trace' => $e->getTraceAsString()
                        ]);
                        return $this->fail('Erro ao criar relação para exclusão: ' . $e->getMessage(), null, 500);
                    }
                }
                
                // Fazer soft delete da relação
                $contratoUsuario->delete();
                return $this->ok('Contrato removido da sua lista com sucesso.');
            } else {
                // Participante: excluir apenas a relação
                if ($contratoUsuario) {
                    $contratoUsuario->delete();
                    return $this->ok('Contrato removido da sua lista com sucesso.');
                } else {
                    // Se não encontrou relação ativa, verificar se já está excluída
                    if ($contratoUsuarioDeleted) {
                        return $this->ok('Contrato já foi removido da sua lista anteriormente.');
                    }
                    return $this->fail('Relação não encontrada para exclusão.', null, 404);
                }
            }
        } catch (\Exception $e) {
            \Log::error('Erro ao excluir contrato: ' . $e->getMessage(), [
                'contrato_id' => $id,
                'usuario_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->fail('Erro ao excluir contrato.', null, 500);
        }
    }

    /**
     * Verifica se todas as cláusulas estão coincidentes (todos aprovaram OU todos rejeitaram)
     */
    private function todasClausulasCoincidentes($contratoId)
    {
        // Buscar todas as cláusulas do contrato
        $clausulasContrato = ContratoClausula::where('contrato_id', $contratoId)->get();
        
        if ($clausulasContrato->isEmpty()) {
            return false; // Se não há cláusulas, não pode assinar
        }

        // Buscar todos os participantes do contrato
        $participantes = ContratoUsuario::where('contrato_id', $contratoId)->get();
        
        if ($participantes->isEmpty()) {
            return false;
        }

        $totalParticipantes = $participantes->count();

        // Para cada cláusula, verificar se todos os participantes estão de acordo (todos aprovaram OU todos rejeitaram)
        foreach ($clausulasContrato as $contratoClausula) {
            // Buscar todas as respostas desta cláusula
            $respostas = ContratoUsuarioClausula::where('contrato_clausula_id', $contratoClausula->id)
                ->whereNotNull('aceito')
                ->get();
            
            // Se nem todos responderam, não está completo
            if ($respostas->count() < $totalParticipantes) {
                return false;
            }
            
            // Verificar se todos aprovaram OU todos rejeitaram
            $aprovacoes = $respostas->where('aceito', true)->count();
            $rejeicoes = $respostas->where('aceito', false)->count();
            
            // Deve ser: todos aprovaram (aprovacoes == total) OU todos rejeitaram (rejeicoes == total)
            if ($aprovacoes != $totalParticipantes && $rejeicoes != $totalParticipantes) {
                return false; // Há desacordo
            }
        }

        return true;
    }

    public function responderContrato(Request $request, $contratoId)
    {
        $validated = $request->validate([
            'aceito' => 'required|boolean',
        ]);

        $usuarioId = auth()->id();
        $contrato = Contrato::find($contratoId);

        if (!$contrato) {
            return $this->fail('Contrato não encontrado.', null, 404);
        }

        $contratoUsuario = ContratoUsuario::where('contrato_id', $contratoId)
            ->where('usuario_id', $usuarioId)
            ->first();

        if (!$contratoUsuario) {
            return $this->fail('Usuário não está vinculado a este contrato.', null, 404);
        }

        // Se está tentando aceitar o contrato, verificar se todas as cláusulas estão coincidentes
        if ($validated['aceito']) {
            if (!$this->todasClausulasCoincidentes($contratoId)) {
                return $this->fail(
                    'Não é possível assinar o contrato. Todas as cláusulas devem estar coincidentes (todos devem aprovar ou todos devem rejeitar cada cláusula) antes de assinar o contrato.',
                    null,
                    422
                );
            }
        }

        $contratoUsuario->update([
            'aceito' => $validated['aceito'],
            'dt_aceito' => now('America/Sao_Paulo'),
        ]);

        // Se foi aceito, verificar se todas as partes já assinaram
        if ($validated['aceito']) {
            // Contar quantos participantes existem (incluindo o contratante)
            $totalParticipantes = ContratoUsuario::where('contrato_id', $contratoId)->count();
            // Contar quantos já aceitaram
            $aceitos = ContratoUsuario::where('contrato_id', $contratoId)
                ->where('aceito', true)
                ->count();

            // Se todas as partes aceitaram e o contrato ainda não tem data de início
            if ($aceitos === $totalParticipantes && !$contrato->dt_inicio) {
                $agora = now()->setTimezone('America/Sao_Paulo');
                $duracao = $contrato->duracao ?? 24; // Duração padrão de 24 horas se não especificada
                
                $contrato->update([
                    'dt_inicio' => $agora,
                    'dt_fim' => $agora->copy()->addHours($duracao),
                    'status' => 'Ativo',
                ]);
            }
        }

        return $this->ok(
            $validated['aceito'] ? 'Contrato assinado com sucesso.' : 'Contrato recusado.'
        );
    }

    public function aceitarContrato(Request $request, $contratoId)
    {
        $request->merge(['aceito' => true]);
        return $this->responderContrato($request, $contratoId);
    }

    public function rejeitarContrato(Request $request, $contratoId)
    {
        $request->merge(['aceito' => false]);
        return $this->responderContrato($request, $contratoId);
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
