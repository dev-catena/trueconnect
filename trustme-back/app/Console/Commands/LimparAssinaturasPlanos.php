<?php

namespace App\Console\Commands;

use App\Models\Contrato;
use App\Models\Subscription;
use Illuminate\Console\Command;

class LimparAssinaturasPlanos extends Command
{
    protected $signature = 'planos:limpar-assinaturas {--force : Sem confirmação}';
    protected $description = 'Remove assinaturas e contratos para iniciar testes';

    public function handle(): int
    {
        $subCount = Subscription::count();
        $contratoCount = Contrato::withTrashed()->count();
        $total = $subCount + $contratoCount;

        if ($total === 0) {
            $this->info('Nenhuma assinatura ou contrato encontrado. Base já está limpa.');
            return 0;
        }

        if (!$this->option('force') && !$this->confirm("Remover {$subCount} assinatura(s) e {$contratoCount} contrato(s)?", true)) {
            $this->warn('Operação cancelada.');
            return 1;
        }

        Subscription::query()->delete();
        $this->info("{$subCount} assinatura(s) removida(s).");

        Contrato::withTrashed()->forceDelete();
        $this->info("{$contratoCount} contrato(s) removido(s).");

        $this->info('Pronto. Assinaturas e contratos limpos para testes.');
        return 0;
    }
}
