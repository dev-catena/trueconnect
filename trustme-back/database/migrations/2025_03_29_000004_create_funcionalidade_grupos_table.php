<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('grupo_funcionalidade', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('funcionalidade_id');
            $table->unsignedBigInteger('grupo_id');
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('funcionalidade_id')->references('id')->on('funcionalidade');
            $table->foreign('grupo_id')->references('id')->on('grupo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grupo_funcionalidade');
    }
};
