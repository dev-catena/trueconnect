<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Corrige os preços do plano Core (id=1) quando estiverem zerados.
     * O plano Core deve custar R$ 9,90/mês, R$ 49,90/semestre, R$ 99,90/ano.
     */
    public function up(): void
    {
        $core = DB::table('plans')->where('id', 1)->first();
        if (!$core) {
            return;
        }
        // Corrigir apenas se os preços estiverem zerados (provável erro de migração/anterior)
        $monthly = is_numeric($core->monthly_price) ? (float) $core->monthly_price : 0;
        if ($monthly < 0.01) {
            DB::table('plans')->where('id', 1)->update([
                'monthly_price' => 9.90,
                'semiannual_price' => 49.90,
                'annual_price' => 99.90,
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        // Não reverter - a correção é intencional
    }
};
