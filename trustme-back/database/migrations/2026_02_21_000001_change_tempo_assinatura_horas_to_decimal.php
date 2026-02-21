<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contrato_tipos', function (Blueprint $table) {
            $table->decimal('tempo_assinatura_horas', 5, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('contrato_tipos', function (Blueprint $table) {
            $table->unsignedInteger('tempo_assinatura_horas')->nullable()->change();
        });
    }
};
