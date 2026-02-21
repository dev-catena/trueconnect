<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdditionalPurchasesSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'user_id' => 19, 'type' => 'contracts', 'quantity' => 1, 'price' => '9.00', 'payment_method' => 'store', 'payment_id' => null, 'payment_data' => null, 'status' => 'pending', 'purchased_at' => null, 'created_at' => '2026-02-10 23:29:35', 'updated_at' => '2026-02-10 23:29:35', 'deleted_at' => null],
            ['id' => 2, 'user_id' => 19, 'type' => 'contracts', 'quantity' => 1, 'price' => '9.00', 'payment_method' => 'store', 'payment_id' => null, 'payment_data' => null, 'status' => 'pending', 'purchased_at' => null, 'created_at' => '2026-02-10 23:29:36', 'updated_at' => '2026-02-10 23:29:36', 'deleted_at' => null],
            ['id' => 3, 'user_id' => 19, 'type' => 'contracts', 'quantity' => 1, 'price' => '9.00', 'payment_method' => 'store', 'payment_id' => null, 'payment_data' => null, 'status' => 'pending', 'purchased_at' => null, 'created_at' => '2026-02-10 23:29:37', 'updated_at' => '2026-02-10 23:29:37', 'deleted_at' => null],
            ['id' => 4, 'user_id' => 19, 'type' => 'contracts', 'quantity' => 1, 'price' => '9.00', 'payment_method' => 'store', 'payment_id' => null, 'payment_data' => null, 'status' => 'pending', 'purchased_at' => null, 'created_at' => '2026-02-10 23:29:38', 'updated_at' => '2026-02-10 23:29:38', 'deleted_at' => null],
            ['id' => 5, 'user_id' => 14, 'type' => 'contracts', 'quantity' => 2, 'price' => '18.00', 'payment_method' => 'store', 'payment_id' => null, 'payment_data' => null, 'status' => 'pending', 'purchased_at' => null, 'created_at' => '2026-02-10 23:50:11', 'updated_at' => '2026-02-10 23:50:11', 'deleted_at' => null],
            ['id' => 6, 'user_id' => 14, 'type' => 'contracts', 'quantity' => 1, 'price' => '9.00', 'payment_method' => 'store', 'payment_id' => null, 'payment_data' => null, 'status' => 'pending', 'purchased_at' => null, 'created_at' => '2026-02-10 23:51:16', 'updated_at' => '2026-02-10 23:51:16', 'deleted_at' => null],
            ['id' => 7, 'user_id' => 14, 'type' => 'contracts', 'quantity' => 2, 'price' => '18.00', 'payment_method' => 'store', 'payment_id' => null, 'payment_data' => null, 'status' => 'pending', 'purchased_at' => null, 'created_at' => '2026-02-10 23:52:12', 'updated_at' => '2026-02-10 23:52:12', 'deleted_at' => null],
            ['id' => 8, 'user_id' => 14, 'type' => 'contracts', 'quantity' => 2, 'price' => '18.00', 'payment_method' => 'store', 'payment_id' => 'mock_1770767567201', 'payment_data' => null, 'status' => 'completed', 'purchased_at' => '2026-02-10 23:52:47', 'created_at' => '2026-02-10 23:52:39', 'updated_at' => '2026-02-10 23:52:47', 'deleted_at' => null],
            ['id' => 9, 'user_id' => 14, 'type' => 'contracts', 'quantity' => 3, 'price' => '27.00', 'payment_method' => 'store', 'payment_id' => 'mock_1770767609337', 'payment_data' => null, 'status' => 'completed', 'purchased_at' => '2026-02-10 23:53:29', 'created_at' => '2026-02-10 23:53:22', 'updated_at' => '2026-02-10 23:53:29', 'deleted_at' => null],
            ['id' => 10, 'user_id' => 14, 'type' => 'contracts', 'quantity' => 3, 'price' => '27.00', 'payment_method' => 'store', 'payment_id' => 'mock_1770768604187', 'payment_data' => null, 'status' => 'completed', 'purchased_at' => '2026-02-11 00:10:04', 'created_at' => '2026-02-11 00:09:57', 'updated_at' => '2026-02-11 00:10:04', 'deleted_at' => null],
            ['id' => 11, 'user_id' => 14, 'type' => 'connections', 'quantity' => 3, 'price' => '9.00', 'payment_method' => 'store', 'payment_id' => 'mock_1770771955093', 'payment_data' => null, 'status' => 'completed', 'purchased_at' => '2026-02-11 01:05:55', 'created_at' => '2026-02-11 01:05:47', 'updated_at' => '2026-02-11 01:05:55', 'deleted_at' => null],
            ['id' => 12, 'user_id' => 14, 'type' => 'connections', 'quantity' => 4, 'price' => '12.00', 'payment_method' => 'store', 'payment_id' => 'mock_1770772065778', 'payment_data' => null, 'status' => 'completed', 'purchased_at' => '2026-02-11 01:07:45', 'created_at' => '2026-02-11 01:07:38', 'updated_at' => '2026-02-11 01:07:45', 'deleted_at' => null],
            ['id' => 13, 'user_id' => 14, 'type' => 'connections', 'quantity' => 2, 'price' => '6.00', 'payment_method' => 'store', 'payment_id' => 'mock_1770772719261', 'payment_data' => null, 'status' => 'completed', 'purchased_at' => '2026-02-11 01:18:39', 'created_at' => '2026-02-11 01:18:19', 'updated_at' => '2026-02-11 01:18:39', 'deleted_at' => null],
            ['id' => 14, 'user_id' => 14, 'type' => 'connections', 'quantity' => 4, 'price' => '12.00', 'payment_method' => 'store', 'payment_id' => 'mock_1770773439067', 'payment_data' => null, 'status' => 'completed', 'purchased_at' => '2026-02-11 01:30:39', 'created_at' => '2026-02-11 01:30:32', 'updated_at' => '2026-02-11 01:30:39', 'deleted_at' => null],
            ['id' => 15, 'user_id' => 14, 'type' => 'contracts', 'quantity' => 5, 'price' => '45.00', 'payment_method' => 'store', 'payment_id' => 'mock_1770773455542', 'payment_data' => null, 'status' => 'completed', 'purchased_at' => '2026-02-11 01:30:55', 'created_at' => '2026-02-11 01:30:48', 'updated_at' => '2026-02-11 01:30:55', 'deleted_at' => null]
        ];

        foreach ($data as $row) {
            DB::table('additional_purchases')->insert($row);
        }
    }
}
