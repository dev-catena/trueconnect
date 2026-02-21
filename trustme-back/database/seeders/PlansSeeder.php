<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlansSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'name' => 'Core', 'description' => 'Personalize conforme sua necessidade. Adicione conexões e contratos de forma modular e pague apenas pelo que sua operação exigir.', 'monthly_price' => '9.90', 'semiannual_price' => '49.90', 'annual_price' => '99.90', 'one_time_price' => null, 'seals_limit' => 1, 'contracts_limit' => 2, 'connections_limit' => 2, 'pending_requests_limit' => null, 'features' => '["2 Conexões", "2 Contratos digitais"]', 'is_active' => 1, 'is_default' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Infinit', 'description' => 'Plano sem limites. Conexões e contratos ilimitados, ideal para quem precisa de total liberdade.', 'monthly_price' => '0', 'semiannual_price' => '0', 'annual_price' => '0', 'one_time_price' => null, 'seals_limit' => null, 'contracts_limit' => null, 'connections_limit' => null, 'pending_requests_limit' => null, 'features' => '["Conexões ilimitadas", "Contratos ilimitados"]', 'is_active' => 1, 'is_default' => 0, 'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($data as $row) {
            DB::table('plans')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
