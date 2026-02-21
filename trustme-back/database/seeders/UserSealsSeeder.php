<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSealsSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 7, 'user_id' => 17, 'seal_type_id' => 7, 'status' => 'approved', 'approved_at' => '2026-02-08 04:32:21', 'approved_by' => 15, 'rejection_reason' => null, 'expires_at' => null, 'validation_data' => null, 'created_at' => '2026-02-08 04:32:21', 'updated_at' => '2026-02-08 04:32:21'],
            ['id' => 8, 'user_id' => 17, 'seal_type_id' => 8, 'status' => 'approved', 'approved_at' => '2026-02-08 04:34:48', 'approved_by' => 15, 'rejection_reason' => null, 'expires_at' => null, 'validation_data' => null, 'created_at' => '2026-02-08 04:34:48', 'updated_at' => '2026-02-08 04:34:48'],
            ['id' => 9, 'user_id' => 14, 'seal_type_id' => 7, 'status' => 'approved', 'approved_at' => '2026-02-08 23:28:42', 'approved_by' => 18, 'rejection_reason' => null, 'expires_at' => null, 'validation_data' => null, 'created_at' => '2026-02-08 23:28:42', 'updated_at' => '2026-02-08 23:28:42'],
            ['id' => 10, 'user_id' => 19, 'seal_type_id' => 7, 'status' => 'approved', 'approved_at' => '2026-02-12 09:58:09', 'approved_by' => 15, 'rejection_reason' => null, 'expires_at' => null, 'validation_data' => null, 'created_at' => '2026-02-12 09:58:09', 'updated_at' => '2026-02-12 09:58:09']
        ];

        foreach ($data as $row) {
            DB::table('user_seals')->insert($row);
        }
    }
}
