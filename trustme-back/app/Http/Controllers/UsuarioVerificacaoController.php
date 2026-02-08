<?php

namespace App\Http\Controllers;

use App\Models\Selo;
use App\Models\User;
use App\Models\UsuarioSelo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Notifications\VerificarEmail;
use Illuminate\Support\Facades\Log;

class UsuarioVerificacaoController extends Controller
{
    public function enviarVerificacao(Request $request)
    {
        $user = $request->user();

        if ($this->possuiSeloVerificado($user)) {
            return  $this->ok( 'Usuário já está verificado.', null, 200 );
        }

        if (!filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
            return $this->fail('E-mail do usuário é inválido.', null, 422);
        }

        $token = Str::random(64);

        Cache::put("verificacao_{$token}", $user->id, now()->addMinutes(60));

        $user->notify(new VerificarEmail($token));

        return $this->ok('E-mail de verificação enviado.');
    }

    public function verificar($token)
    {
        $userId = Cache::pull("verificacao_{$token}");

        if (!$userId) {
            return view('verificacao.resultado', ['mensagem' => 'Token inválido ou expirado.', 'tipo' => 'erro']);
        }

        $user = User::find($userId);

        if (!$user) {
            return view('verificacao.resultado', ['mensagem' => 'Usuário não encontrado.', 'tipo' => 'erro']);
        }

        if ($this->possuiSeloVerificado($user)) {
            return view('verificacao.resultado', ['mensagem' => 'Usuário já está verificado.', 'tipo' => 'info']);
        }

        $this->atribuirSeloDeVerificacao($user);

        return view('verificacao.resultado', ['mensagem' => 'E-mail verificado com sucesso!', 'tipo' => 'sucesso']);
    }

    private function atribuirSeloDeVerificacao(User $user): void
    {
        $selo = Selo::find(1);

        if (!$selo) {
            Log::warning("Selo de verificação (ID 1) não encontrado.");
            return;
        }

        $agora = now('America/Sao_Paulo');
        $expira = $selo->validade ? $agora->copy()->addDays($selo->validade) : null;

        UsuarioSelo::create([
            'usuario_id' => $user->id,
            'selo_id' => $selo->id,
            'verificado' => true,
            'obtido_em' => $agora,
            'expira_em' => $expira,
        ]);

        $user->email_verified_at = $agora;
        $user->save();
    }

    private function possuiSeloVerificado(User $user): bool
    {
        return $user->usuarioSelos()
            ->where('selo_id', 1)
            ->where('verificado', true)
            ->where(function ($query) {
                $query->whereNull('expira_em')->orWhere('expira_em', '>', now());
            })
            ->exists();
    }
}
