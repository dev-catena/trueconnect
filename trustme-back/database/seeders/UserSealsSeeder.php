<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSealsSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 33, 'user_id' => 14, 'seal_type_id' => 8, 'status' => 'approved', 'approved_at' => '2026-02-21 16:04:24', 'approved_by' => 15, 'rejection_reason' => null, 'expires_at' => '2026-05-22 16:04:24', 'validation_data' => null, 'created_at' => '2026-02-21 15:23:25', 'updated_at' => '2026-02-21 16:04:24'],
            ['id' => 34, 'user_id' => 14, 'seal_type_id' => 10, 'status' => 'approved', 'approved_at' => '2026-02-21 16:10:03', 'approved_by' => 15, 'rejection_reason' => 'Vc é 171', 'expires_at' => '2026-05-22 16:10:03', 'validation_data' => null, 'created_at' => '2026-02-21 16:06:16', 'updated_at' => '2026-02-21 16:10:03'],
            ['id' => 35, 'user_id' => 14, 'seal_type_id' => 7, 'status' => 'approved', 'approved_at' => '2026-02-21 16:43:31', 'approved_by' => 15, 'rejection_reason' => null, 'expires_at' => '2026-05-22 16:43:31', 'validation_data' => null, 'created_at' => '2026-02-21 16:23:21', 'updated_at' => '2026-02-21 16:43:31'],
            ['id' => 36, 'user_id' => 13, 'seal_type_id' => 7, 'status' => 'approved', 'approved_at' => '2026-02-21 16:44:46', 'approved_by' => 15, 'rejection_reason' => 'sdfasdfasdf', 'expires_at' => '2026-05-22 16:44:46', 'validation_data' => null, 'created_at' => '2026-02-21 16:39:24', 'updated_at' => '2026-02-21 16:44:46'],
            ['id' => 37, 'user_id' => 8, 'seal_type_id' => 7, 'status' => 'approved', 'approved_at' => '2026-02-21 16:43:24', 'approved_by' => 15, 'rejection_reason' => null, 'expires_at' => '2026-05-22 16:43:24', 'validation_data' => null, 'created_at' => '2026-02-21 16:40:45', 'updated_at' => '2026-02-21 16:43:24'],
            ['id' => 38, 'user_id' => 7, 'seal_type_id' => 7, 'status' => 'approved', 'approved_at' => '2026-02-21 16:42:38', 'approved_by' => 15, 'rejection_reason' => null, 'expires_at' => '2026-05-22 16:42:38', 'validation_data' => null, 'created_at' => '2026-02-21 16:41:56', 'updated_at' => '2026-02-21 16:42:38'],
            ['id' => 39, 'user_id' => 13, 'seal_type_id' => 11, 'status' => 'pending', 'approved_at' => null, 'approved_by' => null, 'rejection_reason' => null, 'expires_at' => null, 'validation_data' => null, 'created_at' => '2026-02-21 16:46:08', 'updated_at' => '2026-02-21 16:46:08']
        ];

        foreach ($data as $row) {
            DB::table('user_seals')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
