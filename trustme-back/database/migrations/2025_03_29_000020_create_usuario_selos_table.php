<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuario_selos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('selo_id')->constrained('selos')->onDelete('cascade');
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->boolean('verificado')->nullable();
            $table->timestamp('obtido_em')->nullable();
            $table->timestamp('expira_em')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuario_selos');
    }
};
