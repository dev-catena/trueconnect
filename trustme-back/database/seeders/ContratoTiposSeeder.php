<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContratoTiposSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'codigo' => 'CTP0001', 'descricao' => 'Contrato de Relações intimas', 'deleted_at' => null, 'created_at' => null, 'updated_at' => '2026-02-10 00:38:58'],
            ['id' => 2, 'codigo' => 'CTP0002', 'descricao' => 'Contrato de namoro', 'deleted_at' => null, 'created_at' => null, 'updated_at' => '2026-02-10 00:38:20'],
            ['id' => 3, 'codigo' => 'CTP0003', 'descricao' => 'Contrato comercial', 'deleted_at' => null, 'created_at' => null, 'updated_at' => '2026-02-10 00:38:46'],
            ['id' => 4, 'codigo' => 'CTR0001', 'descricao' => 'Contratos de relações íntimas', 'deleted_at' => '2026-02-10 09:25:19', 'created_at' => '2026-02-10 09:12:12', 'updated_at' => '2026-02-10 09:25:19'],
            ['id' => 5, 'codigo' => '12435', 'descricao' => 'dxc\\zcv', 'deleted_at' => '2026-02-10 09:24:53', 'created_at' => '2026-02-10 09:12:45', 'updated_at' => '2026-02-10 09:24:53']
        ];

        foreach ($data as $row) {
            DB::table('contrato_tipos')->insert($row);
        }
    }
}
