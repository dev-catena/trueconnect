<?php

namespace App\Http\Controllers;

use App\Events\ClausulaContratoAtualizada;
use App\Events\ContratoAtualizado;
use App\Models\Contrato;
use App\Models\ContratoClausula;
use App\Models\ContratoUsuario;
use App\Models\ContratoUsuarioClausula;
use App\Models\UserNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ContratoClausulaController extends Controller
{

    public function aceitarClausula(Request $request)
    {
        $usuario = auth()->user();

        $validated = $request->validate([
            '*.contrato_id' => 'required|integer|exists:contratos,id',
            '*.clausula_id' => 'required|integer|exists:clausulas,id',
            '*.aceito'      => 'required|numeric',
        ]);

        try {
            DB::transaction(function () use ($validated, $usuario) {

                foreach ($validated as $item) {

                    // 1. Verifica vínculo usuário-contrato
                    $contratoUsuario = ContratoUsuario::where('contrato_id', $item['contrato_id'])
                        ->where('usuario_id', $usuario->id)
                        ->first();

                    if (!$contratoUsuario) {
                        throw new \Exception("Usuário não está vinculado ao contrato ID {$item['contrato_id']}.");
                    }

                    // 2. Verifica vínculo cláusula-contrato
                    $contratoClausula = ContratoClausula::where('contrato_id', $item['contrato_id'])
                        ->where('clausula_id', $item['clausula_id'])
                        ->first();

                    if (!$contratoClausula) {
                        throw new \Exception("A cláusula ID {$item['clausula_id']} não está vinculada ao contrato ID {$item['contrato_id']}.");
                    }

                    // 3. Verifica registro cláusula do usuário
                    $usuarioClausula = ContratoUsuarioClausula::where('contrato_usuario_id', $contratoUsuario->id)
                        ->where('contrato_clausula_id', $contratoClausula->id)
                        ->first();

                    if (!$usuarioClausula) {
                        throw new \Exception("Cláusula não encontrada para esse usuário no contrato informado.");
                    }

                    // 4. Verificar se o contrato já foi assinado (não pode alterar após assinatura)
                    $contrato = \App\Models\Contrato::find($item['contrato_id']);
                    if ($contrato && $contrato->status !== 'Pendente') {
                        throw new \Exception("Não é possível alterar a aprovação de cláusulas após a assinatura do contrato.");
                    }

                    // 5. Atualiza aceitação
                    $usuarioClausula->aceito = $item['aceito'];
                    $usuarioClausula->save();

                    // 6. Broadcast em tempo real via Reverb para as outras partes
                    $aceitoBool = $item['aceito'] == 1 ? true : ($item['aceito'] == 0 ? false : null);
                    event(new ClausulaContratoAtualizada(
                        (int) $item['contrato_id'],
                        (int) $item['clausula_id'],
                        $usuario->id,
                        $aceitoBool
                    ));
                }
            });

            return $this->ok('Cláusulas atualizadas com sucesso.');
        } catch (\Exception $e) {
            return $this->fail($e->getMessage(), $e, 400);
        }
    }

    /**
     * Revogar uma ou mais cláusulas: a parte retira sua concordância (aceito: true → null).
     * Permitido a qualquer tempo (Pendente, Ativo ou Concluído).
     * Notifica os demais participantes sempre que houver revogação.
     */
    public function revogarClausulas(Request $request)
    {
        $usuario = auth()->user();
        $validated = $request->validate([
            'contrato_id' => 'required|integer|exists:contratos,id',
            'clausula_ids' => 'required|array',
            'clausula_ids.*' => 'required|integer|exists:clausulas,id',
        ]);

        $contratoId = (int) $validated['contrato_id'];
        $contrato = Contrato::with(['contratante', 'tipo'])->find($contratoId);
        if (!$contrato) {
            return $this->fail('Contrato não encontrado.', null, 404);
        }

        $contratoUsuario = ContratoUsuario::where('contrato_id', $contratoId)
            ->where('usuario_id', $usuario->id)
            ->first();
        if (!$contratoUsuario) {
            return $this->fail('Você não é participante deste contrato.', null, 403);
        }

        if (!in_array($contrato->status, ['Ativo', 'Concluído'])) {
            return $this->fail(
                'A revogação de cláusulas só é permitida após o contrato estar assinado por todos. Para contratos pendentes, use Concordar ou Discordar nas cláusulas.',
                null,
                403
            );
        }

        $idsRealsClausulasDoContrato = ContratoClausula::where('contrato_id', $contratoId)
            ->pluck('clausula_id')
            ->toArray();

        $revogadas = 0;
        $contratoClausulasRevogadas = [];

        try {
            DB::transaction(function () use ($validated, $contratoUsuario, $idsRealsClausulasDoContrato, $usuario, $contratoId, &$revogadas, &$contratoClausulasRevogadas) {
                foreach ($validated['clausula_ids'] as $clausulaId) {
                    if (!in_array($clausulaId, $idsRealsClausulasDoContrato)) {
                        continue;
                    }
                    $contratoClausula = ContratoClausula::where('contrato_id', $validated['contrato_id'])
                        ->where('clausula_id', $clausulaId)
                        ->first();
                    if (!$contratoClausula) {
                        continue;
                    }
                    $usuarioClausula = ContratoUsuarioClausula::where('contrato_usuario_id', $contratoUsuario->id)
                        ->where('contrato_clausula_id', $contratoClausula->id)
                        ->first();
                    if (!$usuarioClausula || $usuarioClausula->aceito !== true) {
                        continue; // Só revoga se tinha concordado
                    }
                    $usuarioClausula->aceito = null;
                    $usuarioClausula->save();
                    $revogadas++;
                    $contratoClausulasRevogadas[] = ['clausula_id' => (int) $clausulaId];

                    event(new ClausulaContratoAtualizada(
                        $contratoId,
                        (int) $clausulaId,
                        $usuario->id,
                        null
                    ));
                }
            });

            if ($revogadas === 0) {
                return $this->fail('Nenhuma cláusula foi revogada. Verifique se as cláusulas selecionadas tinham sua concordância.', null, 400);
            }

            // Se o contrato estava Ativo ou Concluído: voltar para Pendente, resetar assinaturas, todos devem assinar de novo
            $voltouParaPendente = in_array($contrato->status, ['Ativo', 'Concluído']);
            if ($voltouParaPendente) {
                $tipoContrato = $contrato->tipo;
                $tempoHoras = $tipoContrato && $tipoContrato->tempo_assinatura_horas !== null
                    ? (float) $tipoContrato->tempo_assinatura_horas
                    : 24;
                $contrato->update([
                    'status' => 'Pendente',
                    'dt_inicio' => null,
                    'dt_fim' => null,
                    'dt_prazo_assinatura' => Carbon::now('America/Sao_Paulo')->addHours($tempoHoras),
                ]);
                ContratoUsuario::where('contrato_id', $contratoId)->update([
                    'aceito' => null,
                    'dt_aceito' => null,
                ]);
                $contrato->refresh();

                $userIdsParaBroadcast = array_unique(array_merge(
                    [$contrato->contratante_id],
                    ContratoUsuario::where('contrato_id', $contratoId)->pluck('usuario_id')->toArray()
                ));
                try {
                    event(new ContratoAtualizado($contrato->fresh(), 'revogacao_retorno_pendente', $userIdsParaBroadcast));
                } catch (\Exception $e) {
                    \Log::warning('Broadcast ContratoAtualizado falhou', ['error' => $e->getMessage()]);
                }
            }

            // Notificar os demais participantes
            $userIdsParaNotificar = array_unique(array_filter(array_merge(
                [$contrato->contratante_id],
                ContratoUsuario::where('contrato_id', $contratoId)->pluck('usuario_id')->toArray()
            )));
            $userIdsParaNotificar = array_diff($userIdsParaNotificar, [$usuario->id]);

            $titulo = $revogadas === 1
                ? 'Cláusula revogada'
                : "{$revogadas} cláusulas revogadas";
            $msg = ($usuario->nome_completo ?? $usuario->email) . ' revogou ' .
                ($revogadas === 1 ? 'uma cláusula' : "{$revogadas} cláusulas") .
                ' do contrato ' . ($contrato->codigo ?? "#{$contratoId}") .
                ($voltouParaPendente
                    ? '. Você deve assinar o contrato novamente, pois alguém revogou cláusula(s).'
                    : '.');

            foreach ($userIdsParaNotificar as $userId) {
                UserNotification::create([
                    'user_id' => $userId,
                    'type' => 'clausula_revogada',
                    'title' => $titulo,
                    'message' => $msg,
                    'data' => [
                        'contrato_id' => $contratoId,
                        'contrato_codigo' => $contrato->codigo,
                        'revogador_id' => $usuario->id,
                        'revogador_nome' => $usuario->nome_completo ?? $usuario->email,
                        'clausulas_revogadas' => $contratoClausulasRevogadas,
                        'quantidade' => $revogadas,
                    ],
                ]);
            }

            return $this->ok(
                $revogadas === 1
                    ? 'Cláusula revogada com sucesso. Os demais participantes foram notificados.'
                    : "{$revogadas} cláusulas revogadas com sucesso. Os demais participantes foram notificados."
            );
        } catch (\Exception $e) {
            return $this->fail($e->getMessage(), $e, 400);
        }
    }

    /*     public function aceitarClausula(Request $request)
    {
        $usuario = auth()->user();

        $validated = $request->validate([
            '*.contrato_id' => 'required|integer|exists:contratos,id',
            '*.clausula_id' => 'required|integer|exists:clausulas,id',
            '*.aceito'      => 'required|numeric',
        ]);

        foreach ($validated as $item) {

            // 1. Usuário está mesmo vinculado ao contrato?
            $contratoUsuario = ContratoUsuario::where('contrato_id', $item['contrato_id'])
                ->where('usuario_id', $usuario->id)
                ->first();

            if (!$contratoUsuario) {
                return $this->fail(
                    "Usuário não está vinculado ao contrato ID {$item['contrato_id']}.",
                    null,
                    403
                );
            }

            // 2. Verifica se cláusula faz parte desse contrato
            $contratoClausula = ContratoClausula::where('contrato_id', $item['contrato_id'])
                ->where('clausula_id', $item['clausula_id'])
                ->first();

            if (!$contratoClausula) {
                return $this->fail(
                    "A cláusula ID {$item['clausula_id']} não está vinculada ao contrato ID {$item['contrato_id']}.",
                    null,
                    404
                );
            }

            // 3. Verifica se cláusula existe para o usuário
            $usuarioClausula = ContratoUsuarioClausula::where('contrato_usuario_id', $contratoUsuario->id)
                ->where('contrato_clausula_id', $contratoClausula->id)
                ->first();

            if (!$usuarioClausula) {
                return $this->fail(
                    "Cláusula não encontrada para esse usuário no contrato informado.",
                    null,
                    404
                );
            }

            // 4. Atualiza aceitação
            $usuarioClausula->aceito = $item['aceito'];
            $usuarioClausula->save();
        }

        return $this->ok('Cláusulas atualizadas com sucesso.');
    } */
}
