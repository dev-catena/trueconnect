<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsuarioConexoesSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 59, 'solicitante_id' => 14, 'destinatario_id' => 8, 'aceito' => 1, 'deleted_at' => null, 'created_at' => '2026-02-22 13:22:21', 'updated_at' => '2026-02-22 13:23:00']
        ];

        foreach ($data as $row) {
            DB::table('usuario_conexoes')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
