<?php

namespace App\Console\Commands;

use App\Models\SealRequest;
use App\Models\User;
use Illuminate\Console\Command;

class RemoverSolicitacoesSelosDuplicadas extends Command
{
    protected $signature = 'selos:remover-duplicadas {--user= : Nome ou email do usuário (ex: darley)}';

    protected $description = 'Remove solicitações de selos duplicadas (mesmo tipo em pending/under_review), mantendo a mais antiga por tipo';

    public function handle(): int
    {
        $search = $this->option('user') ?? 'darley';

        $user = User::where(function ($q) use ($search) {
            $pattern = '%' . $search . '%';
            $q->where('name', 'like', $pattern)
                ->orWhere('nome_completo', 'like', $pattern)
                ->orWhere('email', 'like', $pattern);
        })->first();

        if (!$user) {
            $this->error("Usuário não encontrado para: {$search}");
            return 1;
        }

        $this->info("Processando usuário: {$user->name} (ID: {$user->id})");

        $solicitacoes = SealRequest::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'under_review'])
            ->orderBy('seal_type_id')
            ->orderBy('created_at')
            ->get();

        $porTipo = $solicitacoes->groupBy('seal_type_id');
        $deletadas = 0;

        foreach ($porTipo as $sealTypeId => $grupo) {
            if ($grupo->count() <= 1) {
                continue;
            }

            $manter = $grupo->first();
            $excluir = $grupo->skip(1);

            foreach ($excluir as $req) {
                $this->line("  Excluindo solicitação #{$req->id} (seal_type: {$sealTypeId})");
                $req->delete();
                $deletadas++;
            }
        }

        if ($deletadas > 0) {
            $this->info("{$deletadas} solicitação(ões) duplicada(s) removida(s).");
        } else {
            $this->info('Nenhuma duplicata encontrada.');
        }

        return 0;
    }
}
