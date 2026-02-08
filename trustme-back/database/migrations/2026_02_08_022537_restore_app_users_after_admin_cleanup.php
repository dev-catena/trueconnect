<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Esta migration não faz nada, pois não é possível restaurar usuários deletados.
     * Os usuários do app precisam ser criados novamente através do aplicativo.
     */
    public function up(): void
    {
        // Não é possível restaurar usuários que foram deletados permanentemente
        // Os usuários do app precisam ser criados novamente através do aplicativo
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
