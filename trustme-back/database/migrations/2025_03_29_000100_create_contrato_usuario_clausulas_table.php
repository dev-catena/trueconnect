<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('contrato_usuario_clausulas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_usuario_id')->constrained('contrato_usuarios')->onDelete('cascade');
            $table->foreignId('contrato_clausula_id')->constrained('contrato_clausulas')->onDelete('cascade');
            $table->boolean('aceito')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contrato_usuario_clausulas');
    }
};
