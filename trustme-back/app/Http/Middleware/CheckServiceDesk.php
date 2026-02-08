<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckServiceDesk
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || (!$user->isServiceDesk() && !$user->isAdmin())) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado. Apenas usuários do Service Desk ou administradores podem acessar esta rota.'
            ], 403);
        }

        return $next($request);
    }
}
