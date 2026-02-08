<?php

namespace App\Helpers;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Throwable;

class ResponseHelper
{
    public static function success(string $message, $result = null, int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'result'  => $result,
            'timestamp' => now()->toIso8601String(),
        ], $code, [], JSON_UNESCAPED_UNICODE);
    }

    public static function paginated(string $message, LengthAwarePaginator $paginator, int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'result'  => $paginator->items(),
            'meta' => [
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last'  => $paginator->url($paginator->lastPage()),
                'prev'  => $paginator->previousPageUrl(),
                'next'  => $paginator->nextPageUrl(),
            ],
            'timestamp' => now()->toIso8601String(),
        ], $code, [], JSON_UNESCAPED_UNICODE);
    }

    public static function error(
        string $message,
        Throwable $e = null,
        int $code = 400,
        array $errors = []
    ): JsonResponse {
        $payload = [
            'success'   => false,
            'message'   => $message,
            'errors'    => $errors ?? [],
            'timestamp' => now()->toIso8601String(),
        ];

        if (config('app.debug') && $e) {
            $payload['exception'] = get_class($e);
            $payload['stack']     = $e->getTraceAsString();
            $payload['detail']    = $e->getMessage(); // mensagem crua da exception
        } else {
            $payload['stack'] = '';
        }

        // request_id p/ correlação de logs
        //$payload['request_id'] = Str::uuid()->toString();

        return response()->json($payload, $code, [], JSON_UNESCAPED_UNICODE);
    }
}

