<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubscriptionsSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 17, 'user_id' => 8, 'plan_id' => 7, 'billing_cycle' => 'monthly', 'amount' => '19.90', 'status' => 'active', 'start_date' => '2026-02-21', 'end_date' => '2026-03-21', 'payment_method' => 'google_play', 'payment_id' => 'mock_1771710576692', 'payment_data' => '{"plan_id": 7, "payment_id": "mock_1771710576692", "billing_cycle": "monthly", "payment_method": "google_play"}', 'created_at' => '2026-02-21 21:49:36', 'updated_at' => '2026-02-21 21:49:36'],
            ['id' => 18, 'user_id' => 14, 'plan_id' => 7, 'billing_cycle' => 'monthly', 'amount' => '9.90', 'status' => 'active', 'start_date' => '2026-02-22', 'end_date' => '2026-03-22', 'payment_method' => 'app_store', 'payment_id' => 'mock_1771766512232', 'payment_data' => '{"plan_id": 7, "payment_id": "mock_1771766512232", "billing_cycle": "monthly", "payment_method": "app_store"}', 'created_at' => '2026-02-22 13:21:52', 'updated_at' => '2026-02-22 13:21:52']
        ];

        foreach ($data as $row) {
            DB::table('subscriptions')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
