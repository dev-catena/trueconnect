<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->unsignedInteger('connections_period_allowance')->nullable()->after('connections_limit')
                ->comment('Quantidade de conexões que o usuário recebe a cada período (ex: mensal)');
            $table->unsignedInteger('connections_accumulation_limit')->nullable()->after('connections_period_allowance')
                ->comment('Teto máximo de acúmulo de conexões (null = ilimitado)');
            $table->unsignedInteger('contracts_period_allowance')->nullable()->after('contracts_limit')
                ->comment('Quantidade de contratos que o usuário recebe a cada período');
            $table->unsignedInteger('contracts_accumulation_limit')->nullable()->after('contracts_period_allowance')
                ->comment('Teto máximo de acúmulo de contratos (null = ilimitado)');
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn([
                'connections_period_allowance',
                'connections_accumulation_limit',
                'contracts_period_allowance',
                'contracts_accumulation_limit',
            ]);
        });
    }
};
