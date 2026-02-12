<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parametros_sistema', function (Blueprint $table) {
            $table->id();
            $table->string('chave', 100)->unique();
            $table->string('valor', 255);
            $table->string('descricao', 500)->nullable();
            $table->timestamps();
        });

        // Inserir parâmetro padrão: tempo para assinatura do contrato (em horas)
        DB::table('parametros_sistema')->insert([
            'chave' => 'tempo_assinatura_contrato_horas',
            'valor' => '1',
            'descricao' => 'Tempo em horas que as partes têm para assinar o contrato após criação',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('parametros_sistema');
    }
};
