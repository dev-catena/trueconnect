<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use App\Http\Controllers\Concerns\ApiResponses;

/**
 * @method \Illuminate\Http\JsonResponse ok(string $message, $result = null, int $code = 200)
 * @method \Illuminate\Http\JsonResponse okPaginated(string $message, \Illuminate\Contracts\Pagination\LengthAwarePaginator $paginator, int $code = 200)
 * @method \Illuminate\Http\JsonResponse fail(string $message, \Throwable $e = null, int $code = 400, array $errors = [])
 */
class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests, ApiResponses;
}
