<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SelosSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'codigo' => 'SEL0001', 'nome' => null, 'descricao' => 'Email', 'validade' => 360, 'documentos_evidencias' => null, 'descricao_como_obter' => null, 'custo_obtencao' => '0.00', 'ativo' => 1, 'disponivel' => 1, 'deleted_at' => '2026-02-08 02:43:39', 'created_at' => null, 'updated_at' => '2026-02-08 02:43:39'],
            ['id' => 2, 'codigo' => 'SEL0002', 'nome' => null, 'descricao' => 'Identidade', 'validade' => 360, 'documentos_evidencias' => null, 'descricao_como_obter' => null, 'custo_obtencao' => '0.00', 'ativo' => 1, 'disponivel' => 0, 'deleted_at' => '2026-02-08 02:43:41', 'created_at' => null, 'updated_at' => '2026-02-08 02:43:41'],
            ['id' => 3, 'codigo' => 'SEL0003', 'nome' => null, 'descricao' => 'Escolaridade', 'validade' => 360, 'documentos_evidencias' => null, 'descricao_como_obter' => null, 'custo_obtencao' => '0.00', 'ativo' => 1, 'disponivel' => 0, 'deleted_at' => '2026-02-08 02:43:42', 'created_at' => null, 'updated_at' => '2026-02-08 02:43:42'],
            ['id' => 4, 'codigo' => 'SEL0004', 'nome' => null, 'descricao' => 'Renda', 'validade' => 360, 'documentos_evidencias' => null, 'descricao_como_obter' => null, 'custo_obtencao' => '0.00', 'ativo' => 1, 'disponivel' => 0, 'deleted_at' => '2026-02-08 02:43:44', 'created_at' => null, 'updated_at' => '2026-02-08 02:43:44'],
            ['id' => 5, 'codigo' => 'SEL0005', 'nome' => null, 'descricao' => 'Estado Civil', 'validade' => 360, 'documentos_evidencias' => null, 'descricao_como_obter' => null, 'custo_obtencao' => '0.00', 'ativo' => 1, 'disponivel' => 0, 'deleted_at' => '2026-02-08 02:43:46', 'created_at' => null, 'updated_at' => '2026-02-08 02:43:46'],
            ['id' => 6, 'codigo' => 'SEL0006', 'nome' => null, 'descricao' => 'Patrimônio', 'validade' => 360, 'documentos_evidencias' => null, 'descricao_como_obter' => null, 'custo_obtencao' => '0.00', 'ativo' => 1, 'disponivel' => 0, 'deleted_at' => '2026-02-08 02:43:48', 'created_at' => null, 'updated_at' => '2026-02-08 02:43:48'],
            ['id' => 7, 'codigo' => 'SEL004', 'nome' => 'Verificação de IRPF', 'descricao' => 'Verificação de IRPF', 'validade' => 90, 'documentos_evidencias' => '[\"Recibo\", \"Folha 1\", \"Folha 2\"]', 'descricao_como_obter' => 'recibo', 'custo_obtencao' => '30.00', 'ativo' => 1, 'disponivel' => 0, 'deleted_at' => null, 'created_at' => '2026-02-08 02:53:29', 'updated_at' => '2026-02-08 23:25:39'],
            ['id' => 8, 'codigo' => 'SEL002', 'nome' => 'Autenticidade de Carteira Nacional de Habilitação', 'descricao' => 'Verificação da autenticidade de Carteira Nacional de Habilitação', 'validade' => 120, 'documentos_evidencias' => '[]', 'descricao_como_obter' => null, 'custo_obtencao' => '10.00', 'ativo' => 1, 'disponivel' => 0, 'deleted_at' => null, 'created_at' => '2026-02-08 02:54:58', 'updated_at' => '2026-02-12 09:46:34'],
            ['id' => 9, 'codigo' => 'SEL003', 'nome' => 'Verificação da autenticidade de passaporte', 'descricao' => 'Verificação da autenticidade de passaporte', 'validade' => 90, 'documentos_evidencias' => '[]', 'descricao_como_obter' => null, 'custo_obtencao' => '40.00', 'ativo' => 1, 'disponivel' => 0, 'deleted_at' => null, 'created_at' => '2026-02-08 02:56:08', 'updated_at' => '2026-02-08 04:08:24'],
            ['id' => 10, 'codigo' => 'SEL006', 'nome' => 'IRPF', 'descricao' => 'IRPF', 'validade' => 50, 'documentos_evidencias' => '[\"Recibo\", \"Declaração\"]', 'descricao_como_obter' => 'IRPF', 'custo_obtencao' => '80.00', 'ativo' => 1, 'disponivel' => 0, 'deleted_at' => '2026-02-12 09:46:22', 'created_at' => '2026-02-08 04:39:51', 'updated_at' => '2026-02-12 09:46:22']
        ];

        foreach ($data as $row) {
            DB::table('selos')->insert($row);
        }
    }
}
