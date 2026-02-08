<?php

namespace App\Http\Controllers;

use App\Mail\ChaveAcesso;
use App\Models\UsuarioChave;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class UsuarioChaveController extends Controller
{
    public function validarCodigo(Request $request)
    {
        $request->validate([
            'codigo' => 'required',
        ]);

        $codigo = $request->input('codigo');

        $chave = UsuarioChave::where('chave', $codigo)
            ->where('expires_at', '>', now()->setTimezone('America/Sao_Paulo'))
            ->first();

        if (!$chave) {
            return $this->fail('OK', [
                'success' => false,
                'message' => 'Código inválido ou expirado.'
            ], 422);
        }

        return $this->ok('OK', [
            'success' => true,
            'message' => 'Código válido.',
            'usuario_id' => $chave->usuario_id
        ], 200);
    }

    public function enviarCodigo(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'tipo' => 'required|in:primeiro_acesso,redefinicao'
        ]);

        $usuario = User::where('email', $request->input('email'))->first();

        if (!$usuario) {
            return  $this->fail('Email não encontrado', null, 404);
        }

        $chaveAleatoria = str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);

        UsuarioChave::where('usuario_id', $usuario->id)->delete();

        UsuarioChave::create([
            'usuario_id' => $usuario->id,
            'chave' => $chaveAleatoria,
            'expires_at' => now()->setTimezone('America/Sao_Paulo')->addMinutes(15),
            'tipo' => $request->input('tipo')
        ]);

        Mail::to($usuario->email)->send(new ChaveAcesso($chaveAleatoria, $request->input('tipo')));

        return  $this->ok('Email com código enviado com sucesso', null, 200);
    }

    public function processarRedefinicaoSenha(Request $request)
    {
        $request->validate([
            'codigo' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        DB::beginTransaction();

        try {
            $chave = UsuarioChave::where('chave', $request->input('codigo'))
                ->where('expires_at', '>', now()->setTimezone('America/Sao_Paulo'))
                ->first();

            if (!$chave) {
                return $this->fail('OK', [
                    'success' => false,
                    'message' => 'Código inválido ou expirado.',
                ], 422);
            }

            $usuario = User::find($chave->usuario_id);

            if (!$usuario) {
                return $this->fail('OK', [
                    'success' => false,
                    'message' => 'Usuário não encontrado.',
                ], 404);
            }

            $usuario->update([
                'password' => Hash::make($request->input('new_password'))
            ]);

            $chave->delete();

            DB::commit();

            return $this->ok('OK', [
                'success' => true,
                'message' => 'Senha redefinida com sucesso.',
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();

            return $this->fail('OK', [
                'success' => false,
                'message' => 'Erro interno ao redefinir a senha.',
            ], 500);
        }
    }
}
