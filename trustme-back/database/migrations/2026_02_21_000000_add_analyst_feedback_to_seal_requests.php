<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seal_requests', function (Blueprint $table) {
            $table->text('analyst_feedback')->nullable()->after('rejection_reason');
            $table->timestamp('analyst_feedback_at')->nullable()->after('analyst_feedback');
        });
    }

    public function down(): void
    {
        Schema::table('seal_requests', function (Blueprint $table) {
            $table->dropColumn(['analyst_feedback', 'analyst_feedback_at']);
        });
    }
};
