<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            \Log::warning('CheckAdmin: Usuário não autenticado', [
                'url' => $request->url(),
                'token_present' => $request->bearerToken() ? 'yes' : 'no'
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Usuário não autenticado.'
            ], 401);
        }
        
        if (!$user->isAdmin()) {
            \Log::warning('CheckAdmin: Usuário não é admin', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role,
                'url' => $request->url()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado. Apenas administradores podem acessar este recurso.'
            ], 403);
        }

        return $next($request);
    }
}
