<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SelosSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 22, 'codigo' => 'SEL002', 'nome' => 'Profissão declarada', 'descricao' => 'Profissão declarada', 'validade' => 90, 'documentos_evidencias' => '[{"nome": "Carteira de trabalho", "obrigatorio": false}, {"nome": "Registro profissional(OAB, CFM,etc)", "obrigatorio": false}]', 'descricao_como_obter' => 'Verificação na internet, linkedin e sites oficiais', 'custo_obtencao' => '20.00', 'ativo' => 1, 'disponivel' => 0, 'deleted_at' => null, 'created_at' => '2026-02-16 13:20:55', 'updated_at' => '2026-02-17 18:56:05'],
            ['id' => 23, 'codigo' => 'SEL003', 'nome' => 'Estado civil declarado', 'descricao' => 'Estado civil declarado', 'validade' => 90, 'documentos_evidencias' => '[{"nome": "Certidão de Casamento", "obrigatorio": false}, {"nome": "Declaração Pública Registrada", "obrigatorio": false}, {"nome": "Certidão de Nascimento", "obrigatorio": false}]', 'descricao_como_obter' => 'Verificação de canais oficiais e internet', 'custo_obtencao' => '20.00', 'ativo' => 1, 'disponivel' => 0, 'deleted_at' => null, 'created_at' => '2026-02-16 13:25:06', 'updated_at' => '2026-02-21 16:22:36'],
            ['id' => 24, 'codigo' => 'SEL004', 'nome' => 'Escolaridade declarada', 'descricao' => 'Escolaridade declarada', 'validade' => 90, 'documentos_evidencias' => '[]', 'descricao_como_obter' => 'Escolaridade declarada', 'custo_obtencao' => '20.00', 'ativo' => 1, 'disponivel' => 0, 'deleted_at' => null, 'created_at' => '2026-02-16 13:27:23', 'updated_at' => '2026-02-21 14:37:45'],
            ['id' => 25, 'codigo' => 'SEL001', 'nome' => 'Declaração de identidade', 'descricao' => 'Declaração de identidade', 'validade' => 90, 'documentos_evidencias' => '[{"nome": "frente", "obrigatorio": true}, {"nome": "verso", "obrigatorio": true}]', 'descricao_como_obter' => 'Declaração de identidade', 'custo_obtencao' => '20.00', 'ativo' => 1, 'disponivel' => 0, 'deleted_at' => null, 'created_at' => '2026-02-21 15:16:26', 'updated_at' => '2026-02-21 15:20:41']
        ];

        foreach ($data as $row) {
            DB::table('selos')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
