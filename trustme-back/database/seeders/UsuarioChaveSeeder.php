<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsuarioChaveSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 8, 'usuario_id' => 4, 'chave' => '790551', 'tipo' => 'redefinicao', 'expires_at' => '2025-11-05 19:30:58', 'created_at' => '2025-11-05 19:15:58', 'updated_at' => '2025-11-05 19:15:58'],
            ['id' => 19, 'usuario_id' => 14, 'chave' => '915936', 'tipo' => 'redefinicao', 'expires_at' => '2026-02-08 12:51:54', 'created_at' => '2026-02-08 12:36:54', 'updated_at' => '2026-02-08 12:36:54']
        ];

        foreach ($data as $row) {
            DB::table('usuario_chave')->insert($row);
        }
    }
}
