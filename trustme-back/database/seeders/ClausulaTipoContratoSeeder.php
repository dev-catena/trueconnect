<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClausulaTipoContratoSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'contrato_tipo_id' => 1, 'clausula_id' => 1, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 2, 'contrato_tipo_id' => 1, 'clausula_id' => 2, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 3, 'contrato_tipo_id' => 1, 'clausula_id' => 3, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 4, 'contrato_tipo_id' => 1, 'clausula_id' => 4, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 7, 'contrato_tipo_id' => 1, 'clausula_id' => 7, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 8, 'contrato_tipo_id' => 2, 'clausula_id' => 8, 'deleted_at' => '2026-02-10 09:53:35', 'created_at' => null, 'updated_at' => '2026-02-10 09:53:35'],
            ['id' => 9, 'contrato_tipo_id' => 2, 'clausula_id' => 9, 'deleted_at' => '2026-02-10 09:53:37', 'created_at' => null, 'updated_at' => '2026-02-10 09:53:37'],
            ['id' => 10, 'contrato_tipo_id' => 2, 'clausula_id' => 10, 'deleted_at' => '2026-02-10 09:53:38', 'created_at' => null, 'updated_at' => '2026-02-10 09:53:38'],
            ['id' => 11, 'contrato_tipo_id' => 2, 'clausula_id' => 11, 'deleted_at' => '2026-02-10 09:53:40', 'created_at' => null, 'updated_at' => '2026-02-10 09:53:40'],
            ['id' => 12, 'contrato_tipo_id' => 2, 'clausula_id' => 12, 'deleted_at' => '2026-02-10 09:53:42', 'created_at' => null, 'updated_at' => '2026-02-10 09:53:42'],
            ['id' => 13, 'contrato_tipo_id' => 2, 'clausula_id' => 13, 'deleted_at' => '2026-02-10 09:53:54', 'created_at' => null, 'updated_at' => '2026-02-10 09:53:54'],
            ['id' => 14, 'contrato_tipo_id' => 2, 'clausula_id' => 14, 'deleted_at' => '2026-02-10 09:53:52', 'created_at' => null, 'updated_at' => '2026-02-10 09:53:52'],
            ['id' => 15, 'contrato_tipo_id' => 2, 'clausula_id' => 15, 'deleted_at' => '2026-02-10 09:53:48', 'created_at' => null, 'updated_at' => '2026-02-10 09:53:48'],
            ['id' => 16, 'contrato_tipo_id' => 2, 'clausula_id' => 16, 'deleted_at' => '2026-02-10 09:53:44', 'created_at' => null, 'updated_at' => '2026-02-10 09:53:44'],
            ['id' => 17, 'contrato_tipo_id' => 2, 'clausula_id' => 17, 'deleted_at' => '2026-02-10 09:53:46', 'created_at' => null, 'updated_at' => '2026-02-10 09:53:46'],
            ['id' => 19, 'contrato_tipo_id' => 2, 'clausula_id' => 19, 'deleted_at' => '2026-02-10 09:53:50', 'created_at' => null, 'updated_at' => '2026-02-10 09:53:50'],
            ['id' => 20, 'contrato_tipo_id' => 2, 'clausula_id' => 20, 'deleted_at' => '2026-02-10 09:53:56', 'created_at' => null, 'updated_at' => '2026-02-10 09:53:56'],
            ['id' => 21, 'contrato_tipo_id' => 2, 'clausula_id' => 21, 'deleted_at' => '2026-02-10 09:53:58', 'created_at' => null, 'updated_at' => '2026-02-10 09:53:58'],
            ['id' => 22, 'contrato_tipo_id' => 3, 'clausula_id' => 1, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 23, 'contrato_tipo_id' => 3, 'clausula_id' => 2, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 24, 'contrato_tipo_id' => 3, 'clausula_id' => 3, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 25, 'contrato_tipo_id' => 3, 'clausula_id' => 4, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 28, 'contrato_tipo_id' => 3, 'clausula_id' => 7, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 29, 'contrato_tipo_id' => 3, 'clausula_id' => 8, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 30, 'contrato_tipo_id' => 3, 'clausula_id' => 9, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 31, 'contrato_tipo_id' => 3, 'clausula_id' => 10, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 32, 'contrato_tipo_id' => 3, 'clausula_id' => 11, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 33, 'contrato_tipo_id' => 3, 'clausula_id' => 12, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 34, 'contrato_tipo_id' => 3, 'clausula_id' => 13, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 35, 'contrato_tipo_id' => 3, 'clausula_id' => 14, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 36, 'contrato_tipo_id' => 3, 'clausula_id' => 15, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 37, 'contrato_tipo_id' => 3, 'clausula_id' => 16, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 38, 'contrato_tipo_id' => 3, 'clausula_id' => 17, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 40, 'contrato_tipo_id' => 3, 'clausula_id' => 19, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 41, 'contrato_tipo_id' => 3, 'clausula_id' => 20, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 42, 'contrato_tipo_id' => 3, 'clausula_id' => 21, 'deleted_at' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 43, 'contrato_tipo_id' => 1, 'clausula_id' => 8, 'deleted_at' => null, 'created_at' => '2026-02-10 09:35:32', 'updated_at' => '2026-02-10 09:35:32'],
            ['id' => 44, 'contrato_tipo_id' => 1, 'clausula_id' => 10, 'deleted_at' => null, 'created_at' => '2026-02-10 09:35:38', 'updated_at' => '2026-02-10 09:35:38'],
            ['id' => 45, 'contrato_tipo_id' => 1, 'clausula_id' => 12, 'deleted_at' => null, 'created_at' => '2026-02-10 09:35:44', 'updated_at' => '2026-02-10 09:35:44'],
            ['id' => 46, 'contrato_tipo_id' => 2, 'clausula_id' => 1, 'deleted_at' => null, 'created_at' => '2026-02-10 09:54:05', 'updated_at' => '2026-02-10 09:54:05'],
            ['id' => 47, 'contrato_tipo_id' => 2, 'clausula_id' => 2, 'deleted_at' => null, 'created_at' => '2026-02-10 09:54:52', 'updated_at' => '2026-02-10 09:54:52'],
            ['id' => 48, 'contrato_tipo_id' => 2, 'clausula_id' => 4, 'deleted_at' => null, 'created_at' => '2026-02-10 09:54:59', 'updated_at' => '2026-02-10 09:54:59'],
            ['id' => 49, 'contrato_tipo_id' => 2, 'clausula_id' => 7, 'deleted_at' => null, 'created_at' => '2026-02-10 09:55:06', 'updated_at' => '2026-02-10 09:55:06'],
            ['id' => 50, 'contrato_tipo_id' => 2, 'clausula_id' => 3, 'deleted_at' => null, 'created_at' => '2026-02-10 09:55:11', 'updated_at' => '2026-02-10 09:55:11']
        ];

        foreach ($data as $row) {
            DB::table('clausula_tipo_contrato')->insert($row);
        }
    }
}
