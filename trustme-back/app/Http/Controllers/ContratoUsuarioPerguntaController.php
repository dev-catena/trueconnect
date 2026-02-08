<?php

namespace App\Http\Controllers;

use App\Models\Contrato;
use App\Models\ContratoUsuarioPergunta;
use Illuminate\Http\Request;

class ContratoUsuarioPerguntaController extends Controller
{
    public function responder(Request $request)
    {
        $validated = $request->validate([
            'contrato_id' => 'required|exists:contratos,id',
            'respostas' => 'required|array',
            'respostas.*.pergunta_id' => 'required|exists:perguntas,id',
            'respostas.*.resposta' => 'nullable|string',
        ]);

        $usuarioId = auth()->id();

        // Confirma que o usuário faz parte do contrato (participante ou contratante)
        $contrato = Contrato::with('usuarios')->find($validated['contrato_id']);
        $participantesIds = $contrato->usuarios->pluck('id')->push($contrato->contratante_id)->unique()->toArray();

        if (!in_array($usuarioId, $participantesIds)) {
            return $this->fail('Usuário não faz parte deste contrato.', null, 403);
        }

        foreach ($validated['respostas'] as $respostaData) {
            ContratoUsuarioPergunta::updateOrCreate(
                [
                    'contrato_id' => $validated['contrato_id'],
                    'pergunta_id' => $respostaData['pergunta_id'],
                    'usuario_id' => $usuarioId,
                ],
                [
                    'resposta' => $respostaData['resposta'],
                ]
            );
        }

        return $this->ok('Respostas salvas com sucesso.');
    }
}
