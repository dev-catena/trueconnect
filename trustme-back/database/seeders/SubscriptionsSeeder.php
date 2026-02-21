<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubscriptionsSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 3, 'user_id' => 17, 'plan_id' => 1, 'billing_cycle' => 'one_time', 'amount' => '28.90', 'status' => 'cancelled', 'start_date' => '2026-02-08', 'end_date' => null, 'payment_method' => 'app_store', 'payment_id' => 'test_1770586283', 'payment_data' => null, 'created_at' => '2026-02-08 21:31:23', 'updated_at' => '2026-02-08 21:35:24'],
            ['id' => 8, 'user_id' => 7, 'plan_id' => 1, 'billing_cycle' => 'one_time', 'amount' => '19.90', 'status' => 'active', 'start_date' => '2026-02-10', 'end_date' => null, 'payment_method' => 'app_store', 'payment_id' => 'maria_core_001', 'payment_data' => '{\"plan_id\": 1, \"payment_id\": \"maria_core_001\", \"billing_cycle\": \"one_time\", \"payment_method\": \"app_store\"}', 'created_at' => '2026-02-10 10:00:00', 'updated_at' => '2026-02-10 10:00:00'],
            ['id' => 9, 'user_id' => 19, 'plan_id' => 1, 'billing_cycle' => 'one_time', 'amount' => '19.90', 'status' => 'active', 'start_date' => '2026-02-10', 'end_date' => null, 'payment_method' => 'app_store', 'payment_id' => 'mock_1770765969561', 'payment_data' => '{\"plan_id\": 1, \"payment_id\": \"mock_1770765969561\", \"billing_cycle\": \"one_time\", \"payment_method\": \"app_store\"}', 'created_at' => '2026-02-10 23:26:09', 'updated_at' => '2026-02-10 23:26:09'],
            ['id' => 10, 'user_id' => 14, 'plan_id' => 1, 'billing_cycle' => 'one_time', 'amount' => '19.90', 'status' => 'cancelled', 'start_date' => '2026-02-10', 'end_date' => null, 'payment_method' => 'app_store', 'payment_id' => 'mock_1770767297234', 'payment_data' => '{\"plan_id\": 1, \"payment_id\": \"mock_1770767297234\", \"billing_cycle\": \"one_time\", \"payment_method\": \"app_store\"}', 'created_at' => '2026-02-10 23:48:17', 'updated_at' => '2026-02-11 00:01:10'],
            ['id' => 11, 'user_id' => 14, 'plan_id' => 1, 'billing_cycle' => 'one_time', 'amount' => '19.90', 'status' => 'active', 'start_date' => '2026-02-11', 'end_date' => null, 'payment_method' => 'app_store', 'payment_id' => 'mock_1770768070515', 'payment_data' => '{\"plan_id\": 1, \"payment_id\": \"mock_1770768070515\", \"billing_cycle\": \"one_time\", \"payment_method\": \"app_store\"}', 'created_at' => '2026-02-11 00:01:10', 'updated_at' => '2026-02-11 00:01:10']
        ];

        foreach ($data as $row) {
            DB::table('subscriptions')->insert($row);
        }
    }
}
