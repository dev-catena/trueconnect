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
        Schema::create('contratos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 25);
            $table->foreignId('contrato_tipo_id')->constrained('contrato_tipos')->onDelete('cascade');
            $table->text('descricao')->nullable();
            $table->foreignId('contratante_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['Pendente', 'Ativo', 'Concluído', 'Suspenso', 'Expirado'])->default('Pendente');
            $table->unsignedInteger('duracao');
            $table->timestamp('dt_inicio')->nullable();
            $table->timestamp('dt_fim')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contratos');
    }
};
