<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Contrato;

class VerificaContratosExpirados
{
    public function handle(Request $request, Closure $next)
    {
        if ($user = auth()->user()) {
            $agora = Carbon::now('America/Sao_Paulo');

            // só contratos cujo fim já passou (<= agora)
            $vencidos = Contrato::query()
                ->whereHas('participantes', fn($q) => $q->where('usuario_id', $user->id))
                ->where('dt_fim', '<=', $agora)
                ->whereIn('status', ['Ativo', 'Pendente'])
                ->get()
                ->groupBy('status');

            if (isset($vencidos['Ativo'])) {
                Contrato::whereIn('id', $vencidos['Ativo']->pluck('id'))
                    ->update(['status' => 'Concluído']);
            }
            if (isset($vencidos['Pendente'])) {
                Contrato::whereIn('id', $vencidos['Pendente']->pluck('id'))
                    ->update(['status' => 'Expirado']);
            }
        }

        return $next($request);
    }
}





