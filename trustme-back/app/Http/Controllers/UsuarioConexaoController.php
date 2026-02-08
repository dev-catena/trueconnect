<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UsuarioConexao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UsuarioConexaoController extends Controller
{

    /**
     * O usuário autenticado solicita conexão com outro usuário.
     */
    public function solicitarConexao(Request $request)
    {
        $validated = $request->validate([
            'usuario_codigo' => 'required|digits:7'
        ]);

        $usuario = Auth::user();
        $destinatario = User::where('codigo', $validated['usuario_codigo'])->first();

        if (!$destinatario) {
            return $this->fail('Destinatário não encontrado.', null, 404);
        }
        if ($destinatario->id === $usuario->id) {
            return $this->fail('Você não pode se conectar consigo mesmo.', null, 422);
        }

        // Existe conexão pendente ou ativa, qualquer direção
        $existe = UsuarioConexao::where(function ($q) use ($usuario, $destinatario) {
            $q->where('solicitante_id', $usuario->id)
                ->where('destinatario_id', $destinatario->id);
        })
            ->orWhere(function ($q) use ($usuario, $destinatario) {
                $q->where('solicitante_id', $destinatario->id)
                    ->where('destinatario_id', $usuario->id);
            })
            ->first();

        if ($existe) {
            if (is_null($existe->aceito)) {
                // há pendência em alguma direção
                $msg = $existe->solicitante_id === $usuario->id
                    ? 'Solicitação já enviada. Aguarde a resposta.'
                    : 'Essa pessoa já solicitou conexão com você. Responda a solicitação.';
                return $this->fail($msg, null, 422);
            }
            if ($existe->aceito === true) {
                return $this->fail('Conexão já existente.', null, 422);
            }
        }

        $conexao = UsuarioConexao::create([
            'solicitante_id' => $usuario->id,
            'destinatario_id' => $destinatario->id,
            'aceito' => null,
        ]);

        return $this->ok('Solicitação de conexão enviada.');
    }

    /**
     * O destinatário aceita ou recusa uma solicitação de conexão.
     */
    public function responderConexao(Request $request)
    {
        $validated = $request->validate([
            'conexao_id' => 'required|exists:usuario_conexoes,id',
            'aceito' => 'required|boolean'
        ]);

        $usuario = Auth::user();

        $conexao = UsuarioConexao::where('id', $validated['conexao_id'])
            ->where('destinatario_id', $usuario->id)
            ->first();

        if (!$conexao) {
            return $this->fail('Solicitação de conexão não encontrada.', null, 404);
        }

        if ($validated['aceito']) {
            $conexao->update(['aceito' => true]);
            return $this->ok('Conexão aceita com sucesso.');
        } else {
            $conexao->forceDelete();
            return $this->ok('Conexão recusada com sucesso.');
        }
    }

    /**
     * Exclui (soft delete) uma conexão entre usuários.
     */
    public function excluirConexao($id)
    {
        $usuario = Auth::user();

        $conexao = UsuarioConexao::where('id', $id)
            ->where(function ($query) use ($usuario) {
                $query->where('solicitante_id', $usuario->id)
                    ->orWhere('destinatario_id', $usuario->id);
            })
            ->first();

        if (!$conexao) {
            return $this->fail('Conexão não encontrada.', null, 404);
        }

        $conexao->delete();
        return $this->ok('Conexão excluída com sucesso.');
    }
}
