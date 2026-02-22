<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContratoClausulasSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 527, 'contrato_id' => 57, 'clausula_id' => 1, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31', 'deleted_at' => null],
            ['id' => 528, 'contrato_id' => 57, 'clausula_id' => 2, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31', 'deleted_at' => null],
            ['id' => 529, 'contrato_id' => 57, 'clausula_id' => 4, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31', 'deleted_at' => null],
            ['id' => 530, 'contrato_id' => 57, 'clausula_id' => 7, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31', 'deleted_at' => null],
            ['id' => 531, 'contrato_id' => 57, 'clausula_id' => 3, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31', 'deleted_at' => null]
        ];

        foreach ($data as $row) {
            DB::table('contrato_clausulas')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
