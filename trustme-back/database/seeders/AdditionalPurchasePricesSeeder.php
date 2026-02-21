<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdditionalPurchasePricesSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['type' => 'contracts', 'unit_price' => 9.00, 'min_quantity' => 1, 'max_quantity' => 100, 'is_active' => 1],
            ['type' => 'connections', 'unit_price' => 3.00, 'min_quantity' => 1, 'max_quantity' => 100, 'is_active' => 1],
            ['type' => 'pending_requests', 'unit_price' => 2.00, 'min_quantity' => 1, 'max_quantity' => 100, 'is_active' => 1],
        ];

        foreach ($data as $row) {
            DB::table('additional_purchase_prices')->updateOrInsert(
                ['type' => $row['type']],
                array_merge($row, ['updated_at' => now(), 'created_at' => now()])
            );
        }
    }
}
