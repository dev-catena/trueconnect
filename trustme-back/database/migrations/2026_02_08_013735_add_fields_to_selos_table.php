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
        Schema::table('selos', function (Blueprint $table) {
            // Nome do selo (pode ser diferente da descrição)
            if (!Schema::hasColumn('selos', 'nome')) {
                $table->string('nome')->nullable()->after('codigo');
            }
            
            // Lista de documentos e evidências (JSON para armazenar array)
            if (!Schema::hasColumn('selos', 'documentos_evidencias')) {
                $table->json('documentos_evidencias')->nullable()->after('validade');
            }
            
            // Descrição de como obter o selo
            if (!Schema::hasColumn('selos', 'descricao_como_obter')) {
                $table->text('descricao_como_obter')->nullable()->after('documentos_evidencias');
            }
            
            // Custo de obtenção
            if (!Schema::hasColumn('selos', 'custo_obtencao')) {
                $table->decimal('custo_obtencao', 10, 2)->default(0)->after('descricao_como_obter');
            }
            
            // Campo ativo (se não existir)
            if (!Schema::hasColumn('selos', 'ativo')) {
                $table->boolean('ativo')->default(true)->after('custo_obtencao');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('selos', function (Blueprint $table) {
            $columns = ['nome', 'documentos_evidencias', 'descricao_como_obter', 'custo_obtencao'];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('selos', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
