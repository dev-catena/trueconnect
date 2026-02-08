<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\UnauthorizedException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function render($request, Throwable $exception)
    {
        if ($request->expectsJson()) {

            // Não autenticado
            if ($exception instanceof AuthenticationException) {
                return response()->json([
                    'erro' => true,
                    'mensagem' => 'Não autenticado',
                ], 401);
            }

            // Rota não encontrada
            if ($exception instanceof NotFoundHttpException) {
                return response()->json([
                    'erro' => true,
                    'mensagem' => 'Recurso não encontrado',
                ], 404);
            }

            if ($exception instanceof AuthorizationException) {
                return response()->json([
                    'erro' => true,
                    'mensagem' => $exception->getMessage() ?: 'Ação não autorizada',
                ], 403);
            }

            if ($exception instanceof UnauthorizedException) {
                return response()->json([
                    'erro' => true,
                    'mensagem' => $exception->getMessage() ?: 'Token inválido ou expirado',
                ], 401);
            }

            // Outros erros (inclui 500)
            return response()->json([
                'erro' => true,
                'mensagem' => $exception->getMessage(),
                'detalhes' => config('app.debug') ? [
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                    'trace' => collect($exception->getTrace())->take(5),
                ] : null,
            ], 500);
        }

        // fallback para render padrão
        return parent::render($request, $exception);
    }

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }
}
