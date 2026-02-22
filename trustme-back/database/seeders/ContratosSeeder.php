<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContratosSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 57, 'codigo' => '000001/2026', 'contrato_tipo_id' => 2, 'descricao' => null, 'contratante_id' => 14, 'status' => 'Pendente', 'duracao' => 24, 'dt_inicio' => null, 'dt_fim' => null, 'dt_prazo_assinatura' => '2026-02-25 10:23:31', 'deleted_at' => null, 'created_at' => '2026-02-22 13:23:31', 'updated_at' => '2026-02-22 13:23:31']
        ];

        foreach ($data as $row) {
            DB::table('contratos')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
