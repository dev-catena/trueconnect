<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UsuarioConexao;

class ConnectionStatusController extends Controller
{
    /**
     * Retorna um hash/timestamp das conexões do usuário para verificar mudanças
     */
    public function checkChanges()
    {
        try {
            $usuario = Auth::user();
            if (!$usuario) {
                return $this->fail('Usuário não autenticado.', null, 401);
            }

            // Contar conexões e pegar o último updated_at
            $conexoes = UsuarioConexao::where(function ($query) use ($usuario) {
                $query->where('destinatario_id', $usuario->id)
                    ->orWhere('solicitante_id', $usuario->id);
            })
            ->whereNull('deleted_at')
            ->orderBy('updated_at', 'desc')
            ->get();

            $lastUpdate = $conexoes->max('updated_at');
            $count = $conexoes->count();

            // Criar um hash simples baseado no count e último update
            $hash = md5($count . ($lastUpdate ? $lastUpdate->timestamp : '0'));

            return $this->ok('Status verificado.', [
                'hash' => $hash,
                'count' => $count,
                'last_update' => $lastUpdate ? $lastUpdate->toIso8601String() : null,
            ]);
        } catch (\Exception $e) {
            \Log::error('Erro ao verificar mudanças nas conexões: ' . $e->getMessage());
            return $this->fail('Erro ao verificar mudanças.', null, 500);
        }
    }
}



