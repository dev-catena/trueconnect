<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UsuarioConexao;
use App\Events\ConexaoCriada;
use App\Events\ConexaoAtualizada;
use App\Events\ConexaoRemovida;
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
            'usuario_codigo' => 'required|digits:6'
        ]);

        $usuario = Auth::user();
        
        // Verificar limite de conexões (considerando plano + compras adicionais)
        if (!$usuario->canCreateConnection()) {
            $limit = $usuario->getTotalConnectionsLimit();
            $current = UsuarioConexao::where(function($query) use ($usuario) {
                $query->where('solicitante_id', $usuario->id)
                      ->orWhere('destinatario_id', $usuario->id);
            })
            ->where('aceito', true)
            ->whereNull('deleted_at')
            ->count();
            
            return $this->fail(
                "Você atingiu o limite de conexões ({$current}/{$limit}). " .
                "Contrate mais conexões adicionais ou faça upgrade do seu plano.",
                null,
                403
            );
        }

        // Buscar o destinatário pelo código exato
        $destinatario = User::where('codigo', $validated['usuario_codigo'])->first();

        if (!$destinatario) {
            // Tentar buscar com código formatado (com zeros à esquerda)
            $codigoFormatado = str_pad($validated['usuario_codigo'], 6, '0', STR_PAD_LEFT);
            $destinatario = User::where('codigo', $codigoFormatado)->first();
            
            if (!$destinatario) {
                return $this->fail('Destinatário não encontrado. Verifique o código de 6 dígitos e tente novamente.', null, 404);
            }
        }
        
        if ($destinatario->id === $usuario->id) {
            return $this->fail('Você não pode se conectar consigo mesmo.', null, 422);
        }

        // Existe conexão pendente ou ativa, qualquer direção (excluindo soft deletes)
        $existe = UsuarioConexao::where(function ($q) use ($usuario, $destinatario) {
            $q->where('solicitante_id', $usuario->id)
                ->where('destinatario_id', $destinatario->id);
        })
            ->orWhere(function ($q) use ($usuario, $destinatario) {
                $q->where('solicitante_id', $destinatario->id)
                    ->where('destinatario_id', $usuario->id);
            })
            ->whereNull('deleted_at')
            ->first();

        if ($existe) {
            if (is_null($existe->aceito)) {
                // há pendência em alguma direção
                $msg = $existe->solicitante_id === $usuario->id
                    ? 'Solicitação já enviada. Aguarde a resposta.'
                    : 'Essa pessoa já solicitou conexão com você. Responda a solicitação pendente.';
                return $this->fail($msg, null, 422);
            }
            if ($existe->aceito === true) {
                $outroUsuario = $existe->solicitante_id === $usuario->id 
                    ? $existe->destinatario 
                    : $existe->solicitante;
                $nomeOutro = $outroUsuario ? $outroUsuario->nome_completo : 'esta pessoa';
                return $this->fail("Você já está conectado com {$nomeOutro}. A conexão já existe e está ativa. Verifique sua lista de conexões.", null, 422);
            }
        }

        $conexao = UsuarioConexao::create([
            'solicitante_id' => $usuario->id,
            'destinatario_id' => $destinatario->id,
            'aceito' => null,
        ]);

        // Disparar evento de broadcast
        event(new ConexaoCriada($conexao));

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
            $conexao->refresh();
            // Disparar evento de broadcast
            event(new ConexaoAtualizada($conexao, 'aceita'));
            return $this->ok('Conexão aceita com sucesso.');
        } else {
            $solicitanteId = $conexao->solicitante_id;
            $destinatarioId = $conexao->destinatario_id;
            $conexaoId = $conexao->id;
            $conexao->forceDelete();
            // Disparar evento de broadcast
            event(new ConexaoRemovida($conexaoId, $solicitanteId, $destinatarioId));
            return $this->ok('Conexão recusada com sucesso.');
        }
    }

    /**
     * Aceita uma conexão pelo ID (rota alternativa para compatibilidade)
     */
    public function aceitarConexao($id)
    {
        $usuario = Auth::user();

        $conexao = UsuarioConexao::where('id', $id)
            ->where(function ($query) use ($usuario) {
                $query->where('solicitante_id', $usuario->id)
                    ->orWhere('destinatario_id', $usuario->id);
            })
            ->whereNull('deleted_at')
            ->first();

        if (!$conexao) {
            return $this->fail('Conexão não encontrada.', null, 404);
        }

        // Verificar se o usuário pode aceitar (deve ser o destinatário)
        if ($conexao->destinatario_id !== $usuario->id) {
            return $this->fail('Você não tem permissão para aceitar esta conexão.', null, 403);
        }

        // Verificar se já está aceita
        if ($conexao->aceito === true) {
            return $this->fail('Esta conexão já foi aceita.', null, 422);
        }

        $conexao->update(['aceito' => true]);
        $conexao->refresh();
        // Disparar evento de broadcast
        event(new ConexaoAtualizada($conexao, 'aceita'));
        return $this->ok('Conexão aceita com sucesso.');
    }

    /**
     * Exclui (soft delete) uma conexão entre usuários.
     */
    public function excluirConexao($id)
    {
        try {
            $usuario = Auth::user();

            $conexao = UsuarioConexao::where('id', $id)
                ->where(function ($query) use ($usuario) {
                    $query->where('solicitante_id', $usuario->id)
                        ->orWhere('destinatario_id', $usuario->id);
                })
                ->whereNull('deleted_at')
                ->first();

            if (!$conexao) {
                return $this->fail('Conexão não encontrada.', null, 404);
            }

            $solicitanteId = $conexao->solicitante_id;
            $destinatarioId = $conexao->destinatario_id;
            $conexaoId = $conexao->id;
            
            $conexao->delete();
            
            // Disparar evento de broadcast
            event(new ConexaoRemovida($conexaoId, $solicitanteId, $destinatarioId));
            
            return $this->ok('Conexão excluída com sucesso.');
        } catch (\Exception $e) {
            \Log::error('Erro ao excluir conexão: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'conexao_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);
            return $this->fail('Erro ao excluir conexão.', null, 500);
        }
    }
}
