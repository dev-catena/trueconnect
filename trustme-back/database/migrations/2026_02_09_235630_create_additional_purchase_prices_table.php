<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('additional_purchase_prices', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['contracts', 'connections'])->unique()->comment('Tipo de compra adicional');
            $table->decimal('unit_price', 10, 2)->comment('Preço por unidade');
            $table->integer('min_quantity')->default(1)->comment('Quantidade mínima');
            $table->integer('max_quantity')->default(100)->comment('Quantidade máxima');
            $table->boolean('is_active')->default(true)->comment('Se o preço está ativo');
            $table->timestamps();
        });

        // Inserir valores padrão
        DB::table('additional_purchase_prices')->insert([
            [
                'type' => 'contracts',
                'unit_price' => 5.00,
                'min_quantity' => 1,
                'max_quantity' => 100,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'connections',
                'unit_price' => 3.00,
                'min_quantity' => 1,
                'max_quantity' => 100,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('additional_purchase_prices');
    }
};
