<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdditionalPurchasePricesSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'type' => 'contracts', 'unit_price' => '9.00', 'min_quantity' => 1, 'max_quantity' => 100, 'is_active' => 1, 'created_at' => '2026-02-10 00:01:18', 'updated_at' => '2026-02-10 09:07:24'],
            ['id' => 2, 'type' => 'connections', 'unit_price' => '3.00', 'min_quantity' => 1, 'max_quantity' => 100, 'is_active' => 1, 'created_at' => '2026-02-10 00:01:18', 'updated_at' => '2026-02-10 00:01:18']
        ];

        foreach ($data as $row) {
            DB::table('additional_purchase_prices')->insert($row);
        }
    }
}
