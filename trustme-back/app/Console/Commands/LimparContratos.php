<?php

namespace App\Console\Commands;

use App\Models\Contrato;
use App\Models\ContratoClausula;
use App\Models\ContratoLog;
use App\Models\ContratoUsuario;
use App\Models\ContratoUsuarioClausula;
use App\Models\ContratoUsuarioPergunta;
use Illuminate\Console\Command;

class LimparContratos extends Command
{
    protected $signature = 'contratos:limpar
                            {--force : Confirmar sem perguntar}';

    protected $description = 'Remove todos os contratos e dados associados (contrato_usuarios, cláusulas, logs, perguntas)';

    public function handle(): int
    {
        if (!$this->option('force')) {
            if (!$this->confirm('Tem certeza que deseja remover TODOS os contratos? Esta ação não pode ser desfeita.')) {
                $this->info('Operação cancelada.');
                return 0;
            }
        }

        $this->info('Limpando contratos e dados associados...');

        try {
            // Deletar na ordem correta devido às FKs (ou deixar CASCADE fazer o trabalho)
            // ContratoUsuarioClausula -> contrato_usuario_id
            $deletedClausulasUsuario = ContratoUsuarioClausula::count();
            ContratoUsuarioClausula::query()->forceDelete();
            $this->line("  - contrato_usuario_clausulas: {$deletedClausulasUsuario} registros");

            // ContratoUsuarioPergunta -> contrato_id (não usa SoftDeletes)
            $deletedPerguntas = ContratoUsuarioPergunta::count();
            ContratoUsuarioPergunta::query()->delete();
            $this->line("  - contrato_usuario_perguntas: {$deletedPerguntas} registros");

            // ContratoClausula -> contrato_id
            $deletedClausulas = ContratoClausula::withTrashed()->count();
            ContratoClausula::withTrashed()->forceDelete();
            $this->line("  - contrato_clausulas: {$deletedClausulas} registros");

            // ContratoLog -> contrato_id
            $deletedLogs = ContratoLog::withTrashed()->count();
            ContratoLog::withTrashed()->forceDelete();
            $this->line("  - contrato_logs: {$deletedLogs} registros");

            // ContratoUsuario -> contrato_id
            $deletedUsuarios = ContratoUsuario::withTrashed()->count();
            ContratoUsuario::withTrashed()->forceDelete();
            $this->line("  - contrato_usuarios: {$deletedUsuarios} registros");

            // Contratos (inclui soft-deleted)
            $deletedContratos = Contrato::withTrashed()->count();
            Contrato::withTrashed()->forceDelete();
            $this->line("  - contratos: {$deletedContratos} registros");

            $this->newLine();
            $this->info('✓ Todos os contratos foram removidos com sucesso.');

            return 0;
        } catch (\Exception $e) {
            $this->error('Erro ao limpar contratos: ' . $e->getMessage());
            return 1;
        }
    }
}
