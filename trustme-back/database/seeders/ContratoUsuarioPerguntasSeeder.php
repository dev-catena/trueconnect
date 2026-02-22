<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContratoUsuarioPerguntasSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 150, 'contrato_id' => 57, 'pergunta_id' => 2, 'usuario_id' => 8, 'resposta' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 151, 'contrato_id' => 57, 'pergunta_id' => 3, 'usuario_id' => 8, 'resposta' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 152, 'contrato_id' => 57, 'pergunta_id' => 4, 'usuario_id' => 8, 'resposta' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 153, 'contrato_id' => 57, 'pergunta_id' => 5, 'usuario_id' => 8, 'resposta' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 154, 'contrato_id' => 57, 'pergunta_id' => 2, 'usuario_id' => 14, 'resposta' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 155, 'contrato_id' => 57, 'pergunta_id' => 3, 'usuario_id' => 14, 'resposta' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 156, 'contrato_id' => 57, 'pergunta_id' => 4, 'usuario_id' => 14, 'resposta' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31'],
            ['id' => 157, 'contrato_id' => 57, 'pergunta_id' => 5, 'usuario_id' => 14, 'resposta' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31']
        ];

        foreach ($data as $row) {
            DB::table('contrato_usuario_perguntas')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
