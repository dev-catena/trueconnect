<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Plano padrão deve ser recorrente (one_time_price = null)
     */
    public function up(): void
    {
        DB::table('plans')->where('is_default', true)->update(['one_time_price' => null]);
    }

    public function down(): void
    {
        // Não reverter - manter recorrente
    }
};
