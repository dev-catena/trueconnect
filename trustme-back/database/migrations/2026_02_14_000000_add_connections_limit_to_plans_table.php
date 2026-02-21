<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->integer('connections_limit')->nullable()->after('contracts_limit');
        });

        // Definir limites conforme features dos planos
        DB::table('plans')->where('id', 1)->update(['connections_limit' => 2]);   // Core
        DB::table('plans')->where('id', 2)->update(['connections_limit' => 4]);   // Intermediário
        DB::table('plans')->where('id', 3)->update(['connections_limit' => null]); // Plus: ilimitado
        DB::table('plans')->where('id', 4)->update(['connections_limit' => 20]);   // Plano Master
        DB::table('plans')->where('id', 5)->update(['connections_limit' => null]); // Prime: ilimitado
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('connections_limit');
        });
    }
};
