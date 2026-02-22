<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContratoUsuariosSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 137, 'contrato_id' => 57, 'usuario_id' => 8, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 138, 'contrato_id' => 57, 'usuario_id' => 14, 'aceito' => null, 'dt_aceito' => null, 'deleted_at' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31']
        ];

        foreach ($data as $row) {
            DB::table('contrato_usuarios')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
