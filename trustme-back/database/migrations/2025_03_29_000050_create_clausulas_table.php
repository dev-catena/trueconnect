<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('clausulas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 25);
            $table->string('nome', 255);
            $table->text('descricao')->nullable();
            $table->boolean('sexual')->default(false);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clausulas');
    }
};
