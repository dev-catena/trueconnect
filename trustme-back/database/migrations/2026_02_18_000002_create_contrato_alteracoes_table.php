<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Alterações contratuais: manifestações formais (ex: desistência do contratante).
     * O contrato NÃO é alterado; a alteração é um documento que registra a vontade.
     */
    public function up(): void
    {
        Schema::create('contrato_alteracoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_id')->constrained('contratos')->onDelete('cascade');
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->string('tipo', 50); // 'rescindir', 'aditamento', etc
            $table->text('manifestacao'); // Texto formal da manifestação de vontade
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contrato_alteracoes');
    }
};
