<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('additional_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['contracts', 'connections'])->comment('Tipo de compra adicional');
            $table->integer('quantity')->comment('Quantidade comprada');
            $table->decimal('price', 10, 2)->comment('Preço pago');
            $table->enum('payment_method', ['store', 'pix', 'card'])->default('store');
            $table->string('payment_id')->nullable()->comment('ID do pagamento na loja ou gateway');
            $table->json('payment_data')->nullable()->comment('Dados adicionais do pagamento');
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->timestamp('purchased_at')->nullable()->comment('Data da compra');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('additional_purchases');
    }
};
