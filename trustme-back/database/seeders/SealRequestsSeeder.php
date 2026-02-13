<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SealRequestsSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 8, 'user_id' => 17, 'seal_type_id' => 7, 'status' => 'under_review', 'notes' => null, 'reviewed_by' => null, 'reviewed_at' => null, 'rejection_reason' => null, 'created_at' => '2026-02-08 04:05:17', 'updated_at' => '2026-02-08 04:05:22'],
            ['id' => 9, 'user_id' => 17, 'seal_type_id' => 7, 'status' => 'under_review', 'notes' => null, 'reviewed_by' => null, 'reviewed_at' => null, 'rejection_reason' => null, 'created_at' => '2026-02-08 04:06:07', 'updated_at' => '2026-02-08 04:06:11'],
            ['id' => 10, 'user_id' => 17, 'seal_type_id' => 8, 'status' => 'approved', 'notes' => null, 'reviewed_by' => 15, 'reviewed_at' => '2026-02-08 04:34:48', 'rejection_reason' => null, 'created_at' => '2026-02-08 04:09:17', 'updated_at' => '2026-02-08 04:34:48'],
            ['id' => 11, 'user_id' => 17, 'seal_type_id' => 7, 'status' => 'approved', 'notes' => null, 'reviewed_by' => 15, 'reviewed_at' => '2026-02-08 04:32:21', 'rejection_reason' => null, 'created_at' => '2026-02-08 04:13:25', 'updated_at' => '2026-02-08 04:32:21'],
            ['id' => 12, 'user_id' => 17, 'seal_type_id' => 7, 'status' => 'under_review', 'notes' => null, 'reviewed_by' => null, 'reviewed_at' => null, 'rejection_reason' => null, 'created_at' => '2026-02-08 04:20:07', 'updated_at' => '2026-02-08 04:20:14'],
            ['id' => 13, 'user_id' => 17, 'seal_type_id' => 9, 'status' => 'rejected', 'notes' => null, 'reviewed_by' => 15, 'reviewed_at' => '2026-02-08 12:16:52', 'rejection_reason' => 'As imagens nao corresponderam', 'created_at' => '2026-02-08 04:57:38', 'updated_at' => '2026-02-08 12:16:52'],
            ['id' => 14, 'user_id' => 17, 'seal_type_id' => 10, 'status' => 'under_review', 'notes' => null, 'reviewed_by' => null, 'reviewed_at' => null, 'rejection_reason' => null, 'created_at' => '2026-02-08 05:03:34', 'updated_at' => '2026-02-08 05:03:38'],
            ['id' => 15, 'user_id' => 14, 'seal_type_id' => 10, 'status' => 'under_review', 'notes' => null, 'reviewed_by' => null, 'reviewed_at' => null, 'rejection_reason' => null, 'created_at' => '2026-02-08 13:49:36', 'updated_at' => '2026-02-08 13:49:45'],
            ['id' => 16, 'user_id' => 14, 'seal_type_id' => 10, 'status' => 'under_review', 'notes' => null, 'reviewed_by' => null, 'reviewed_at' => null, 'rejection_reason' => null, 'created_at' => '2026-02-08 13:50:50', 'updated_at' => '2026-02-08 13:50:56'],
            ['id' => 17, 'user_id' => 14, 'seal_type_id' => 10, 'status' => 'pending', 'notes' => null, 'reviewed_by' => null, 'reviewed_at' => null, 'rejection_reason' => null, 'created_at' => '2026-02-08 14:18:20', 'updated_at' => '2026-02-08 14:18:20'],
            ['id' => 18, 'user_id' => 14, 'seal_type_id' => 10, 'status' => 'pending', 'notes' => null, 'reviewed_by' => null, 'reviewed_at' => null, 'rejection_reason' => null, 'created_at' => '2026-02-08 14:26:13', 'updated_at' => '2026-02-08 14:26:13'],
            ['id' => 19, 'user_id' => 14, 'seal_type_id' => 7, 'status' => 'pending', 'notes' => null, 'reviewed_by' => null, 'reviewed_at' => null, 'rejection_reason' => null, 'created_at' => '2026-02-08 17:07:57', 'updated_at' => '2026-02-08 17:07:57'],
            ['id' => 20, 'user_id' => 14, 'seal_type_id' => 7, 'status' => 'approved', 'notes' => null, 'reviewed_by' => 18, 'reviewed_at' => '2026-02-08 23:28:42', 'rejection_reason' => null, 'created_at' => '2026-02-08 23:26:26', 'updated_at' => '2026-02-08 23:28:42'],
            ['id' => 21, 'user_id' => 19, 'seal_type_id' => 10, 'status' => 'pending', 'notes' => null, 'reviewed_by' => null, 'reviewed_at' => null, 'rejection_reason' => null, 'created_at' => '2026-02-12 09:54:32', 'updated_at' => '2026-02-12 09:54:32'],
            ['id' => 22, 'user_id' => 19, 'seal_type_id' => 7, 'status' => 'approved', 'notes' => null, 'reviewed_by' => 15, 'reviewed_at' => '2026-02-12 09:58:09', 'rejection_reason' => null, 'created_at' => '2026-02-12 09:55:58', 'updated_at' => '2026-02-12 09:58:09']
        ];

        foreach ($data as $row) {
            DB::table('seal_requests')->insert($row);
        }
    }
}
