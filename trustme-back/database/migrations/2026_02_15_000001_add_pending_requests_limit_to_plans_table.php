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
            $table->integer('pending_requests_limit')->nullable()->after('connections_limit');
        });

        // Valores iniciais: Core 2 pendentes, Intermediário 4, etc.
        DB::table('plans')->where('id', 1)->update(['pending_requests_limit' => 2]);   // Core
        DB::table('plans')->where('id', 2)->update(['pending_requests_limit' => 4]);   // Intermediário
        DB::table('plans')->where('id', 3)->update(['pending_requests_limit' => null]); // Plus: ilimitado
        DB::table('plans')->where('id', 4)->update(['pending_requests_limit' => 20]);  // Master
        DB::table('plans')->where('id', 5)->update(['pending_requests_limit' => null]); // Prime: ilimitado
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('pending_requests_limit');
        });
    }
};
