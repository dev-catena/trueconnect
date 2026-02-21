<?php

namespace App\Console\Commands;

use App\Models\ContratoUsuario;
use Illuminate\Console\Command;

class RestoreExcludedContracts extends Command
{
    protected $signature = 'contrato:restaurar-excluidos {--usuario= : ID do usuário (opcional, restaura todos se omitido)}';
    protected $description = 'Restaura ContratoUsuario soft-deleted para que contratos voltem a aparecer na lista dos usuários';

    public function handle()
    {
        $usuarioId = $this->option('usuario');
        $query = ContratoUsuario::onlyTrashed();

        if ($usuarioId) {
            $query->where('usuario_id', $usuarioId);
            $this->info("Restaurando contratos excluídos do usuário {$usuarioId}...");
        } else {
            $this->info('Restaurando todos os contratos excluídos...');
        }

        $count = $query->count();
        $query->restore();

        $this->info("Restaurados {$count} registro(s). Os contratos devem voltar a aparecer.");
        return 0;
    }
}
