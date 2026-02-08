<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Para requisições de API, sempre retornar null (não redirecionar)
        if ($request->expectsJson() || $request->is('api/*')) {
            return null;
        }
        
        // Para requisições web, redirecionar para login (se a rota existir)
        return '/login';
    }
}
