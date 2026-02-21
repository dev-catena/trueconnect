<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Mantém apenas Core (padrão) e Infinit.
     * Reatribui assinaturas dos planos removidos para Core, desativa os demais.
     */
    public function up(): void
    {
        // Reatribuir assinaturas dos planos 2,3,4,5 para Core (1)
        DB::table('subscriptions')->whereIn('plan_id', [2, 3, 4, 5])->update(['plan_id' => 1]);

        // Deletar planos que não são Core nem Infinit
        DB::table('plans')->whereIn('id', [2, 3, 4, 5])->delete();

        // Criar plano Infinit se não existir (recém deletamos 2-5, então id disponível)
        $infinitExists = DB::table('plans')->where('name', 'Infinit')->exists();
        if (!$infinitExists) {
            DB::table('plans')->insert([
                'name' => 'Infinit',
                'description' => 'Plano sem limites. Conexões e contratos ilimitados, ideal para quem precisa de total liberdade.',
                'monthly_price' => 0,
                'semiannual_price' => 0,
                'annual_price' => 0,
                'one_time_price' => null,
                'seals_limit' => null,
                'contracts_limit' => null,
                'connections_limit' => null,
                'pending_requests_limit' => null,
                'features' => json_encode(['Conexões ilimitadas', 'Contratos ilimitados']),
                'is_active' => 1,
                'is_default' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            // Garantir que Infinit está ativo e com limites null
            DB::table('plans')->where('name', 'Infinit')->update([
                'is_active' => 1,
                'contracts_limit' => null,
                'connections_limit' => null,
                'seals_limit' => null,
                'updated_at' => now(),
            ]);
        }

        // Garantir Core está correto (padrão, ativo, limites finitos)
        DB::table('plans')->where('id', 1)->update([
            'name' => 'Core',
            'is_default' => 1,
            'is_active' => 1,
            'one_time_price' => null,
            'contracts_limit' => 2,
            'connections_limit' => 2,
            'features' => json_encode(['2 Conexões', '2 Contratos digitais']),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        // Não reverter - a limpeza é intencional
    }
};
