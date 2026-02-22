<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContratoUsuarioClausulasSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1139, 'contrato_usuario_id' => 137, 'contrato_clausula_id' => 527, 'aceito' => null, 'deleted_at' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 1140, 'contrato_usuario_id' => 137, 'contrato_clausula_id' => 528, 'aceito' => null, 'deleted_at' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 1141, 'contrato_usuario_id' => 137, 'contrato_clausula_id' => 529, 'aceito' => null, 'deleted_at' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 1142, 'contrato_usuario_id' => 137, 'contrato_clausula_id' => 530, 'aceito' => null, 'deleted_at' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 1143, 'contrato_usuario_id' => 137, 'contrato_clausula_id' => 531, 'aceito' => null, 'deleted_at' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 1144, 'contrato_usuario_id' => 138, 'contrato_clausula_id' => 527, 'aceito' => null, 'deleted_at' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 1145, 'contrato_usuario_id' => 138, 'contrato_clausula_id' => 528, 'aceito' => null, 'deleted_at' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 1146, 'contrato_usuario_id' => 138, 'contrato_clausula_id' => 529, 'aceito' => null, 'deleted_at' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 1147, 'contrato_usuario_id' => 138, 'contrato_clausula_id' => 530, 'aceito' => null, 'deleted_at' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 1148, 'contrato_usuario_id' => 138, 'contrato_clausula_id' => 531, 'aceito' => null, 'deleted_at' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31']
        ];

        foreach ($data as $row) {
            DB::table('contrato_usuario_clausulas')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
