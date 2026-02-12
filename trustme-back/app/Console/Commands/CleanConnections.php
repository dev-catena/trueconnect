<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\UsuarioConexao;
use Illuminate\Support\Facades\DB;

class CleanConnections extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'connections:clean {--force : Força a exclusão sem confirmação}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove todas as conexões do banco de dados (incluindo soft deletes)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Contar conexões antes de deletar
        $totalConnections = UsuarioConexao::withTrashed()->count();
        $activeConnections = UsuarioConexao::count();
        $deletedConnections = UsuarioConexao::onlyTrashed()->count();

        if ($totalConnections === 0) {
            $this->info('✅ Não há conexões no banco de dados.');
            return 0;
        }

        $this->info('');
        $this->warn('⚠️  ATENÇÃO: Esta operação irá deletar TODAS as conexões!');
        $this->info('');
        $this->info("📊 Estatísticas:");
        $this->info("   - Total de conexões: {$totalConnections}");
        $this->info("   - Conexões ativas: {$activeConnections}");
        $this->info("   - Conexões deletadas (soft): {$deletedConnections}");
        $this->info('');

        // Confirmar se não usar --force
        if (!$this->option('force')) {
            if (!$this->confirm('Deseja realmente deletar TODAS as conexões?', false)) {
                $this->info('❌ Operação cancelada.');
                return 0;
            }
        }

        $this->info('');
        $this->info('🗑️  Deletando todas as conexões...');

        try {
            DB::beginTransaction();

            // Deletar todas as conexões (incluindo soft deletes)
            $deleted = UsuarioConexao::withTrashed()->forceDelete();

            DB::commit();

            $this->info('');
            $this->info("✅ Sucesso! {$totalConnections} conexão(ões) foram deletadas permanentemente.");
            $this->info('');

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('');
            $this->error('❌ Erro ao deletar conexões: ' . $e->getMessage());
            $this->error('');
            return 1;
        }

        return 0;
    }
}



