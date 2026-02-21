<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('plans')->where('id', 1)->update(['pending_requests_limit' => 5]);
    }

    public function down(): void
    {
        DB::table('plans')->where('id', 1)->update(['pending_requests_limit' => 2]);
    }
};
