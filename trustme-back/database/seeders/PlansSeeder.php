<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlansSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'name' => 'Profissional', 'description' => 'Profissional', 'monthly_price' => '19.90', 'semiannual_price' => '79.90', 'annual_price' => '239.90', 'one_time_price' => null, 'seals_limit' => 1, 'contracts_limit' => 5, 'contracts_period_allowance' => null, 'contracts_accumulation_limit' => 15, 'connections_limit' => 4, 'connections_period_allowance' => null, 'connections_accumulation_limit' => 12, 'pending_requests_limit' => 5, 'features' => '["4 Conexões", "5 Contratos digitais"]', 'is_active' => 1, 'is_default' => 1, 'created_at' => '2025-09-03 23:10:27', 'updated_at' => '2026-02-21 20:06:11'],
            ['id' => 6, 'name' => 'Institucional', 'description' => 'Plano sem limites. Conexões e contratos ilimitados, ideal para quem precisa de total liberdade.', 'monthly_price' => '59.90', 'semiannual_price' => '300.00', 'annual_price' => '600.00', 'one_time_price' => '59.90', 'seals_limit' => null, 'contracts_limit' => null, 'contracts_period_allowance' => null, 'contracts_accumulation_limit' => 30, 'connections_limit' => null, 'connections_period_allowance' => null, 'connections_accumulation_limit' => 30, 'pending_requests_limit' => null, 'features' => '["10 Conexões ilimitadas", "10 Contratos ilimitados"]', 'is_active' => 1, 'is_default' => 0, 'created_at' => '2026-02-16 14:17:16', 'updated_at' => '2026-02-21 20:07:42'],
            ['id' => 7, 'name' => 'Essencial', 'description' => 'Essencial', 'monthly_price' => '9.90', 'semiannual_price' => '59.90', 'annual_price' => '99.90', 'one_time_price' => '19.90', 'seals_limit' => null, 'contracts_limit' => 2, 'contracts_period_allowance' => null, 'contracts_accumulation_limit' => 6, 'connections_limit' => 2, 'connections_period_allowance' => null, 'connections_accumulation_limit' => 6, 'pending_requests_limit' => null, 'features' => '["2 Conexões", "2 Contratos"]', 'is_active' => 1, 'is_default' => 0, 'created_at' => '2026-02-21 20:04:22', 'updated_at' => '2026-02-22 13:20:48']
        ];

        foreach ($data as $row) {
            DB::table('plans')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
