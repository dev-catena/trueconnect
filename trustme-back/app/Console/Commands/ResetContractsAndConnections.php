<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ResetContractsAndConnections extends Command
{
    protected $signature = 'tests:reset-contracts-connections
                            {--force : Confirmar sem perguntar}';

    protected $description = 'Exclui TODOS os contratos e conexões da plataforma para iniciar uma nova rodada de testes';

    public function handle(): int
    {
        if (!$this->option('force')) {
            if (!$this->confirm('Tem certeza que deseja excluir TODOS os contratos e conexões? Esta ação não pode ser desfeita.')) {
                $this->info('Operação cancelada.');
                return 0;
            }
        }

        $this->info('');
        $this->info('🗑️  Excluindo contratos e conexões...');
        $this->info('');

        // 1. Limpar contratos
        $this->call('contratos:limpar', ['--force' => true]);

        // 2. Limpar conexões
        $this->call('connections:clean', ['--force' => true]);

        $this->info('');
        $this->info('✅ Pronto! Todos os contratos e conexões foram excluídos. Nova rodada de testes pode começar.');
        $this->info('');

        return 0;
    }
}
