<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_plan_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('connections_balance')->default(0)->comment('Saldo disponível de conexões');
            $table->unsignedInteger('contracts_balance')->default(0)->comment('Saldo disponível de contratos');
            $table->timestamp('last_topup_at')->nullable()->comment('Última vez que o saldo foi recarregado');
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_plan_balances');
    }
};
