<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Permite reutilizar o código de selos após soft delete.
     * Troca unique(codigo) por unique(codigo, deleted_at), assim
     * registros deletados não bloqueiam o mesmo código para novos selos.
     */
    public function up(): void
    {
        Schema::table('selos', function (Blueprint $table) {
            $table->dropUnique('selos_codigo_unique');
        });

        Schema::table('selos', function (Blueprint $table) {
            $table->unique(['codigo', 'deleted_at'], 'selos_codigo_deleted_at_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('selos', function (Blueprint $table) {
            $table->dropUnique('selos_codigo_deleted_at_unique');
        });

        Schema::table('selos', function (Blueprint $table) {
            $table->unique('codigo', 'selos_codigo_unique');
        });
    }
};
