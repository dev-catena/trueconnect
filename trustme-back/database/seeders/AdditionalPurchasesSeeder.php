<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdditionalPurchasesSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 17, 'user_id' => 14, 'type' => 'pending_requests', 'quantity' => 5, 'price' => '10.00', 'payment_method' => 'store', 'payment_id' => 'mock_1771179037184', 'payment_data' => null, 'status' => 'completed', 'purchased_at' => '2026-02-15 18:10:37', 'created_at' => '2026-02-15 18:10:30', 'updated_at' => '2026-02-15 18:10:37', 'deleted_at' => null],
            ['id' => 18, 'user_id' => 14, 'type' => 'contracts', 'quantity' => 2, 'price' => '18.00', 'payment_method' => 'store', 'payment_id' => 'mock_1771336037442', 'payment_data' => null, 'status' => 'completed', 'purchased_at' => '2026-02-17 13:47:17', 'created_at' => '2026-02-17 13:47:09', 'updated_at' => '2026-02-17 13:47:17', 'deleted_at' => null],
            ['id' => 19, 'user_id' => 14, 'type' => 'connections', 'quantity' => 3, 'price' => '9.00', 'payment_method' => 'store', 'payment_id' => 'mock_1771355315154', 'payment_data' => null, 'status' => 'completed', 'purchased_at' => '2026-02-17 19:08:35', 'created_at' => '2026-02-17 19:08:20', 'updated_at' => '2026-02-17 19:08:35', 'deleted_at' => null],
            ['id' => 20, 'user_id' => 14, 'type' => 'contracts', 'quantity' => 1, 'price' => '9.00', 'payment_method' => 'store', 'payment_id' => 'mock_1771370374081', 'payment_data' => null, 'status' => 'completed', 'purchased_at' => '2026-02-17 23:19:34', 'created_at' => '2026-02-17 23:19:19', 'updated_at' => '2026-02-17 23:19:34', 'deleted_at' => null],
            ['id' => 21, 'user_id' => 14, 'type' => 'connections', 'quantity' => 1, 'price' => '3.00', 'payment_method' => 'store', 'payment_id' => 'mock_1771370405345', 'payment_data' => null, 'status' => 'completed', 'purchased_at' => '2026-02-17 23:20:05', 'created_at' => '2026-02-17 23:19:54', 'updated_at' => '2026-02-17 23:20:05', 'deleted_at' => null]
        ];

        foreach ($data as $row) {
            DB::table('additional_purchases')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
