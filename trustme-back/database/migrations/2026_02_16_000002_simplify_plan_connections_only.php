<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Simplifica planos: apenas limite de conexões (remove lógica de solicitações pendentes).
     * Atualiza features dos planos para refletir a nova estrutura.
     */
    public function up(): void
    {
        // Atualizar features dos planos ativos para o novo formato
        DB::table('plans')->where('id', 1)->update([
            'features' => json_encode(['2 Conexões', '2 Contratos digitais']),
        ]);
        DB::table('plans')->where('id', 2)->update([
            'features' => json_encode(['4 Conexões', '6 Contratos']),
        ]);
        DB::table('plans')->where('id', 4)->update([
            'features' => json_encode(['20 Conexões', '20 Contratos']),
        ]);
    }

    public function down(): void
    {
        DB::table('plans')->where('id', 1)->update([
            'features' => json_encode(['2 Conexões ativas', '5 Solicitações pendentes', '2 Contratos digitais']),
        ]);
        DB::table('plans')->where('id', 2)->update([
            'features' => json_encode(['4 conexões', '4 solicitações pendentes', '6 contratos']),
        ]);
        DB::table('plans')->where('id', 4)->update([
            'features' => json_encode(['20 contratos', '20 conexões', '20 solicitações pendentes']),
        ]);
    }
};
