<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsuarioConexoesSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 16, 'solicitante_id' => 14, 'destinatario_id' => 19, 'aceito' => 1, 'deleted_at' => '2026-02-09 23:02:54', 'created_at' => '2026-02-09 21:28:53', 'updated_at' => '2026-02-09 23:02:54'],
            ['id' => 18, 'solicitante_id' => 19, 'destinatario_id' => 14, 'aceito' => 1, 'deleted_at' => '2026-02-09 23:12:11', 'created_at' => '2026-02-09 23:05:37', 'updated_at' => '2026-02-09 23:12:11'],
            ['id' => 21, 'solicitante_id' => 19, 'destinatario_id' => 14, 'aceito' => null, 'deleted_at' => '2026-02-09 23:47:06', 'created_at' => '2026-02-09 23:46:55', 'updated_at' => '2026-02-09 23:47:06'],
            ['id' => 22, 'solicitante_id' => 19, 'destinatario_id' => 14, 'aceito' => 1, 'deleted_at' => null, 'created_at' => '2026-02-10 00:20:19', 'updated_at' => '2026-02-10 00:33:40']
        ];

        foreach ($data as $row) {
            DB::table('usuario_conexoes')->insert($row);
        }
    }
}
