<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SealTypesSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'code' => 'telefone', 'name' => 'Telefone/WhatsApp', 'description' => 'Validação automática de telefone e WhatsApp', 'requires_manual_approval' => 0, 'is_active' => 1, 'created_at' => '2026-02-06 03:07:23', 'updated_at' => '2026-02-06 03:07:23'],
            ['id' => 2, 'code' => 'endereco', 'name' => 'Endereço', 'description' => 'Comprovação de endereço através de documentos', 'requires_manual_approval' => 1, 'is_active' => 1, 'created_at' => '2026-02-06 03:07:23', 'updated_at' => '2026-02-06 03:07:23'],
            ['id' => 3, 'code' => 'documentos', 'name' => 'Documentos (RG/CNH/CTPS/Passaporte)', 'description' => 'Validação de documentos de identidade', 'requires_manual_approval' => 1, 'is_active' => 1, 'created_at' => '2026-02-06 03:07:23', 'updated_at' => '2026-02-06 03:07:23'],
            ['id' => 4, 'code' => 'veiculo', 'name' => 'Veículo (CRLV)', 'description' => 'Validação de documentação de veículo', 'requires_manual_approval' => 1, 'is_active' => 1, 'created_at' => '2026-02-06 03:07:23', 'updated_at' => '2026-02-06 03:07:23'],
            ['id' => 5, 'code' => 'irpf', 'name' => 'IRPF (Renda)', 'description' => 'Comprovação de renda através de IRPF', 'requires_manual_approval' => 1, 'is_active' => 1, 'created_at' => '2026-02-06 03:07:23', 'updated_at' => '2026-02-06 03:07:23'],
            ['id' => 6, 'code' => 'empresario', 'name' => 'Empresário (CNPJ)', 'description' => 'Validação de CNPJ e documentação empresarial', 'requires_manual_approval' => 1, 'is_active' => 1, 'created_at' => '2026-02-06 03:07:23', 'updated_at' => '2026-02-06 03:07:23'],
            ['id' => 7, 'code' => 'SEL003', 'name' => 'Estado civil declarado', 'description' => 'Estado civil declarado', 'requires_manual_approval' => 1, 'is_active' => 1, 'created_at' => '2026-02-08 04:05:17', 'updated_at' => '2026-02-21 16:31:54'],
            ['id' => 8, 'code' => 'SEL001', 'name' => 'Declaração de identidade', 'description' => 'Declaração de identidade', 'requires_manual_approval' => 1, 'is_active' => 1, 'created_at' => '2026-02-08 04:09:17', 'updated_at' => '2026-02-21 16:31:54'],
            ['id' => 9, 'code' => 'SEL006', 'name' => 'IRPF', 'description' => 'IRPF', 'requires_manual_approval' => 1, 'is_active' => 1, 'created_at' => '2026-02-08 04:57:38', 'updated_at' => '2026-02-08 04:57:38'],
            ['id' => 10, 'code' => 'SEL002', 'name' => 'Profissão declarada', 'description' => 'Profissão declarada', 'requires_manual_approval' => 1, 'is_active' => 1, 'created_at' => '2026-02-08 05:03:34', 'updated_at' => '2026-02-21 16:31:54'],
            ['id' => 11, 'code' => 'SEL004', 'name' => 'Escolaridade declarada', 'description' => 'Escolaridade declarada', 'requires_manual_approval' => 1, 'is_active' => 1, 'created_at' => '2026-02-13 19:09:03', 'updated_at' => '2026-02-21 14:41:10'],
            ['id' => 12, 'code' => 'SEL0001', 'name' => 'Email', 'description' => 'Email', 'requires_manual_approval' => 1, 'is_active' => 1, 'created_at' => '2026-02-21 14:41:19', 'updated_at' => '2026-02-21 14:41:19'],
            ['id' => 13, 'code' => 'SEL0003', 'name' => 'Escolaridade', 'description' => 'Escolaridade', 'requires_manual_approval' => 1, 'is_active' => 1, 'created_at' => '2026-02-21 14:41:19', 'updated_at' => '2026-02-21 14:41:19']
        ];

        foreach ($data as $row) {
            DB::table('seal_types')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
