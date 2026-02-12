<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $tempoHoras = \App\Models\ParametroSistema::getValorInt('tempo_assinatura_contrato_horas', 1);

        DB::table('contratos')
            ->where('status', 'Pendente')
            ->whereNull('dt_prazo_assinatura')
            ->whereNull('deleted_at')
            ->update([
                'dt_prazo_assinatura' => DB::raw("DATE_ADD(created_at, INTERVAL {$tempoHoras} HOUR)"),
            ]);
    }

    public function down(): void
    {
        DB::table('contratos')
            ->where('status', 'Pendente')
            ->update(['dt_prazo_assinatura' => null]);
    }
};
