<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alterar enum em additional_purchases
        DB::statement("ALTER TABLE additional_purchases MODIFY COLUMN type ENUM('contracts', 'connections', 'pending_requests') NOT NULL");

        // Alterar enum em additional_purchase_prices e inserir preço padrão
        DB::statement("ALTER TABLE additional_purchase_prices MODIFY COLUMN type ENUM('contracts', 'connections', 'pending_requests') NOT NULL");

        // Inserir preço para pending_requests se não existir
        if (!DB::table('additional_purchase_prices')->where('type', 'pending_requests')->exists()) {
            DB::table('additional_purchase_prices')->insert([
                'type' => 'pending_requests',
                'unit_price' => 2.00,
                'min_quantity' => 1,
                'max_quantity' => 100,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('additional_purchase_prices')->where('type', 'pending_requests')->delete();
        DB::table('additional_purchases')->where('type', 'pending_requests')->delete();
        DB::statement("ALTER TABLE additional_purchases MODIFY COLUMN type ENUM('contracts', 'connections') NOT NULL");
        DB::statement("ALTER TABLE additional_purchase_prices MODIFY COLUMN type ENUM('contracts', 'connections') NOT NULL");
    }
};
