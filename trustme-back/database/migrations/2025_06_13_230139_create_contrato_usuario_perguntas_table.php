<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('contrato_usuario_perguntas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_id')->constrained('contratos')->onDelete('cascade');
            $table->foreignId('pergunta_id')->constrained('perguntas')->onDelete('cascade');
            $table->foreignId('usuario_id')->constrained('users');
            $table->text('resposta')->nullable();
            $table->timestamps();

            $table->unique(['contrato_id', 'pergunta_id', 'usuario_id'], 'unique_contrato_pergunta_usuario');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contrato_usuario_perguntas');
    }
};
