<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Adiciona flag is_default para o plano padrão (não pode ser excluído).
     */
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->boolean('is_default')->default(false)->after('is_active');
        });

        // Marcar plano Core (id=1) como padrão e garantir que seja recorrente (one_time_price = null)
        DB::table('plans')->where('id', 1)->update(['is_default' => true, 'one_time_price' => null]);
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('is_default');
        });
    }
};
