<?php

namespace App\Http\Middleware;

use Closure;

class CheckTokenExpiration
{
    public function handle($request, Closure $next)
    {
        // Só verifica expiração se o usuário estiver autenticado
        $user = $request->user();
        
        if ($user) {
            $token = $user->currentAccessToken();

            if ($token && $token->expires_at && now()->greaterThan($token->expires_at)) {
                $token->delete();
                return response()->json(['success' => false, 'message' => 'Token expirado. Faça login novamente.'], 401);
            }
        }

        return $next($request);
    }
}


