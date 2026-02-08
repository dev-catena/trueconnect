<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('clausula_tipo_contrato', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_tipo_id')->constrained('contrato_tipos')->onDelete('cascade');
            $table->foreignId('clausula_id')->constrained('clausulas')->onDelete('cascade');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clausula_tipo_contrato');
    }
};
