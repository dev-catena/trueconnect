<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Sincroniza os campos name e nome_completo para garantir compatibilidade
     * entre usuários criados pelo app e pela web
     */
    public function up(): void
    {
        // Atualiza usuários que têm name mas não têm nome_completo
        DB::table('users')
            ->whereNotNull('name')
            ->where(function($query) {
                $query->whereNull('nome_completo')
                      ->orWhere('nome_completo', '');
            })
            ->update(['nome_completo' => DB::raw('name')]);

        // Atualiza usuários que têm nome_completo mas não têm name
        DB::table('users')
            ->whereNotNull('nome_completo')
            ->where(function($query) {
                $query->whereNull('name')
                      ->orWhere('name', '');
            })
            ->update(['name' => DB::raw('nome_completo')]);
    }

    /**
     * Reverse the migrations.
     * Não há necessidade de reverter, pois esta é uma sincronização de dados
     */
    public function down(): void
    {
        // Não há necessidade de reverter esta sincronização
    }
};
