<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ParametrosSistemaSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'chave' => 'tempo_assinatura_contrato_horas', 'valor' => '1', 'descricao' => 'Tempo em horas que as partes têm para assinar o contrato após criação', 'created_at' => '2026-02-11 09:59:01', 'updated_at' => '2026-02-11 09:59:01']
        ];

        foreach ($data as $row) {
            DB::table('parametros_sistema')->insert($row);
        }
    }
}
