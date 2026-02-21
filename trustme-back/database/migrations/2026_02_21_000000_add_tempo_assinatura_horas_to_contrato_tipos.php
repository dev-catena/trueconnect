<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contrato_tipos', function (Blueprint $table) {
            $table->decimal('tempo_assinatura_horas', 5, 2)->nullable()->after('descricao')
                ->comment('Tempo em horas para assinatura do contrato (por tipo)');
        });

        // Usar valor atual do parâmetro global como padrão para tipos existentes
        $tempoPadrao = 1;
        try {
            $param = DB::table('parametros_sistema')->where('chave', 'tempo_assinatura_contrato_horas')->first();
            if ($param && is_numeric($param->valor)) {
                $tempoPadrao = (int) $param->valor;
            }
        } catch (\Throwable $e) {
            // ignorar se tabela não existir
        }

        DB::table('contrato_tipos')->update(['tempo_assinatura_horas' => $tempoPadrao]);
    }

    public function down(): void
    {
        Schema::table('contrato_tipos', function (Blueprint $table) {
            $table->dropColumn('tempo_assinatura_horas');
        });
    }
};
