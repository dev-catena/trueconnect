<?php

namespace App\Http\Controllers\Concerns;

use App\Helpers\ResponseHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Throwable;

trait ApiResponses
{
    protected function ok(string $message, $result = null, int $code = 200): JsonResponse
    {
        return ResponseHelper::success($message, $result, $code);
    }

    protected function okPaginated(string $message, LengthAwarePaginator $paginator, int $code = 200): JsonResponse
    {
        return ResponseHelper::paginated($message, $paginator, $code);
    }

    protected function fail(string $message, Throwable $e = null, int $code = 400, array $errors = []): JsonResponse
    {
        return ResponseHelper::error($message, $e, $code, $errors);
    }
}





