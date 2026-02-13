<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlansSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'name' => 'Core', 'description' => 'Personalize conforme sua necessidade. Adicione conexões e contratos de forma modular e pague apenas pelo que sua operação exigir.', 'monthly_price' => '9.90', 'semiannual_price' => '49.90', 'annual_price' => '99.90', 'one_time_price' => '19.90', 'seals_limit' => 1, 'contracts_limit' => 1, 'features' => '[\"2 Conexões\", \"2 Contratos digitais\"]', 'is_active' => 1, 'created_at' => '2025-09-03 23:10:27', 'updated_at' => '2026-02-10 23:27:27'],
            ['id' => 2, 'name' => 'Intermediário', 'description' => 'Plano para quem tem contatos relevantes', 'monthly_price' => '49.90', 'semiannual_price' => '199.90', 'annual_price' => '299.90', 'one_time_price' => '49.90', 'seals_limit' => 3, 'contracts_limit' => 3, 'features' => '[\"4 conexões\", \"6 contratos\"]', 'is_active' => 0, 'created_at' => '2025-09-03 23:10:27', 'updated_at' => '2026-02-10 08:53:40'],
            ['id' => 3, 'name' => 'Plus', 'description' => 'Plano completo para empresas que precisam de recursos ilimitados', 'monthly_price' => '69.90', 'semiannual_price' => '299.90', 'annual_price' => '499.90', 'one_time_price' => null, 'seals_limit' => null, 'contracts_limit' => null, 'features' => '[\"Selos digitais ilimitados\", \"Contratos ilimitados\", \"Suporte 24/7\", \"Certificado SSL\", \"Backup automático\", \"Relatórios avançados\", \"API personalizada\", \"Integração com sistemas\"]', 'is_active' => 0, 'created_at' => '2025-09-03 23:10:27', 'updated_at' => '2026-02-08 19:52:45'],
            ['id' => 4, 'name' => 'Plano Master', 'description' => 'Com volume denso de contratos e conexões', 'monthly_price' => '59.90', 'semiannual_price' => '299.00', 'annual_price' => '599.00', 'one_time_price' => '59.90', 'seals_limit' => null, 'contracts_limit' => null, 'features' => '[\"20 contratos\", \"20 conexões\"]', 'is_active' => 0, 'created_at' => '2026-02-08 20:53:05', 'updated_at' => '2026-02-10 08:53:48'],
            ['id' => 5, 'name' => 'Prime', 'description' => 'Para quem quer segurança sem limites', 'monthly_price' => '79.00', 'semiannual_price' => '429.00', 'annual_price' => '799.00', 'one_time_price' => '79.00', 'seals_limit' => null, 'contracts_limit' => null, 'features' => '[\"Conexões sem limites\", \"Contratos sem limite\"]', 'is_active' => 0, 'created_at' => '2026-02-08 20:54:58', 'updated_at' => '2026-02-10 08:53:44']
        ];

        foreach ($data as $row) {
            DB::table('plans')->insert($row);
        }
    }
}
