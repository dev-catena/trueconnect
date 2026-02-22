<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SealRequestsSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 40, 'user_id' => 14, 'seal_type_id' => 8, 'status' => 'approved', 'notes' => null, 'reviewed_by' => 15, 'reviewed_at' => '2026-02-21 16:04:24', 'rejection_reason' => null, 'analyst_feedback' => null, 'analyst_feedback_at' => null, 'user_response' => 'Teste PDF', 'user_response_at' => '2026-02-21 16:00:30', 'created_at' => '2026-02-21 15:23:16', 'updated_at' => '2026-02-21 16:04:24'],
            ['id' => 41, 'user_id' => 14, 'seal_type_id' => 10, 'status' => 'rejected', 'notes' => null, 'reviewed_by' => 15, 'reviewed_at' => '2026-02-21 16:07:03', 'rejection_reason' => 'Vc é 171', 'analyst_feedback' => null, 'analyst_feedback_at' => null, 'user_response' => null, 'user_response_at' => null, 'created_at' => '2026-02-21 16:05:54', 'updated_at' => '2026-02-21 16:07:03'],
            ['id' => 42, 'user_id' => 14, 'seal_type_id' => 10, 'status' => 'approved', 'notes' => null, 'reviewed_by' => 15, 'reviewed_at' => '2026-02-21 16:10:03', 'rejection_reason' => null, 'analyst_feedback' => null, 'analyst_feedback_at' => null, 'user_response' => null, 'user_response_at' => null, 'created_at' => '2026-02-21 16:08:33', 'updated_at' => '2026-02-21 16:10:03'],
            ['id' => 43, 'user_id' => 14, 'seal_type_id' => 7, 'status' => 'approved', 'notes' => null, 'reviewed_by' => 15, 'reviewed_at' => '2026-02-21 16:43:31', 'rejection_reason' => null, 'analyst_feedback' => null, 'analyst_feedback_at' => null, 'user_response' => 'Rrrrrrrrr', 'user_response_at' => '2026-02-21 16:33:45', 'created_at' => '2026-02-21 16:23:08', 'updated_at' => '2026-02-21 16:43:31'],
            ['id' => 44, 'user_id' => 13, 'seal_type_id' => 7, 'status' => 'rejected', 'notes' => null, 'reviewed_by' => 15, 'reviewed_at' => '2026-02-21 16:43:13', 'rejection_reason' => 'sdfasdfasdf', 'analyst_feedback' => null, 'analyst_feedback_at' => null, 'user_response' => 'Ssss', 'user_response_at' => '2026-02-21 16:40:01', 'created_at' => '2026-02-21 16:39:13', 'updated_at' => '2026-02-21 16:43:13'],
            ['id' => 45, 'user_id' => 8, 'seal_type_id' => 7, 'status' => 'approved', 'notes' => null, 'reviewed_by' => 15, 'reviewed_at' => '2026-02-21 16:43:24', 'rejection_reason' => null, 'analyst_feedback' => null, 'analyst_feedback_at' => null, 'user_response' => 'Vcvv', 'user_response_at' => '2026-02-21 16:43:16', 'created_at' => '2026-02-21 16:40:35', 'updated_at' => '2026-02-21 16:43:24'],
            ['id' => 46, 'user_id' => 7, 'seal_type_id' => 7, 'status' => 'approved', 'notes' => null, 'reviewed_by' => 15, 'reviewed_at' => '2026-02-21 16:42:38', 'rejection_reason' => null, 'analyst_feedback' => null, 'analyst_feedback_at' => null, 'user_response' => null, 'user_response_at' => null, 'created_at' => '2026-02-21 16:41:46', 'updated_at' => '2026-02-21 16:42:38'],
            ['id' => 47, 'user_id' => 13, 'seal_type_id' => 7, 'status' => 'approved', 'notes' => null, 'reviewed_by' => 15, 'reviewed_at' => '2026-02-21 16:44:46', 'rejection_reason' => null, 'analyst_feedback' => null, 'analyst_feedback_at' => null, 'user_response' => null, 'user_response_at' => null, 'created_at' => '2026-02-21 16:44:31', 'updated_at' => '2026-02-21 16:44:46'],
            ['id' => 48, 'user_id' => 13, 'seal_type_id' => 11, 'status' => 'rejected', 'notes' => null, 'reviewed_by' => 15, 'reviewed_at' => '2026-02-21 16:45:34', 'rejection_reason' => 'safgadsadf', 'analyst_feedback' => null, 'analyst_feedback_at' => null, 'user_response' => null, 'user_response_at' => null, 'created_at' => '2026-02-21 16:45:05', 'updated_at' => '2026-02-21 16:45:34'],
            ['id' => 49, 'user_id' => 13, 'seal_type_id' => 11, 'status' => 'under_review', 'notes' => null, 'reviewed_by' => null, 'reviewed_at' => null, 'rejection_reason' => null, 'analyst_feedback' => null, 'analyst_feedback_at' => null, 'user_response' => null, 'user_response_at' => null, 'created_at' => '2026-02-21 16:45:58', 'updated_at' => '2026-02-21 16:46:08']
        ];

        foreach ($data as $row) {
            DB::table('seal_requests')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
