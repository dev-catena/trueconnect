<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seal_requests', function (Blueprint $table) {
            $table->text('user_response')->nullable()->after('analyst_feedback_at');
            $table->timestamp('user_response_at')->nullable()->after('user_response');
        });
    }

    public function down(): void
    {
        Schema::table('seal_requests', function (Blueprint $table) {
            $table->dropColumn(['user_response', 'user_response_at']);
        });
    }
};
