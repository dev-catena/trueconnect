<?php

namespace App\Http\Controllers;

use App\Models\ContratoClausula;
use App\Models\ContratoUsuario;
use App\Models\ContratoUsuarioClausula;
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

                    // 4. Atualiza aceitação
                    $usuarioClausula->aceito = $item['aceito'];
                    $usuarioClausula->save();
                }
            });

            return $this->ok('Cláusulas atualizadas com sucesso.');
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
