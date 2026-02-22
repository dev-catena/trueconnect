<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LoginHistorySeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 2, 'user_id' => 1, 'first_login_at' => '2025-09-03 23:33:36', 'last_login_at' => '2026-02-08 01:32:16', 'created_at' => '2025-09-03 23:33:36', 'updated_at' => '2026-02-08 01:32:16'],
            ['id' => 3, 'user_id' => 15, 'first_login_at' => '2026-02-08 02:42:49', 'last_login_at' => '2026-02-22 16:00:42', 'created_at' => '2026-02-08 02:42:49', 'updated_at' => '2026-02-22 16:00:42'],
            ['id' => 4, 'user_id' => 18, 'first_login_at' => '2026-02-08 05:54:12', 'last_login_at' => '2026-02-17 19:27:40', 'created_at' => '2026-02-08 05:54:12', 'updated_at' => '2026-02-17 19:27:40'],
            ['id' => 5, 'user_id' => 14, 'first_login_at' => '2026-02-08 12:38:49', 'last_login_at' => '2026-02-08 20:59:22', 'created_at' => '2026-02-08 12:38:49', 'updated_at' => '2026-02-08 20:59:22']
        ];

        foreach ($data as $row) {
            DB::table('login_history')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
