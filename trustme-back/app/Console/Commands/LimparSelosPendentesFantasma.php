<?php

namespace App\Console\Commands;

use App\Models\UsuarioSelo;
use App\Models\User;
use Illuminate\Console\Command;

class LimparSelosPendentesFantasma extends Command
{
    protected $signature = 'selos:limpar-pendentes-fantasma {--user= : ID ou email do usuário}';
    protected $description = 'Remove UsuarioSelo legado (verificado=0) que causa "selo pendente fantasma" no app';

    public function handle(): int
    {
        $userInput = $this->option('user');
        if (!$userInput) {
            $this->error('Informe --user=ID ou --user=email');
            return 1;
        }

        $user = is_numeric($userInput)
            ? User::find($userInput)
            : User::where('email', $userInput)->first();

        if (!$user) {
            $this->error("Usuário não encontrado: {$userInput}");
            return 1;
        }

        $fantasmas = UsuarioSelo::where('usuario_id', $user->id)
            ->where(function ($q) {
                $q->whereNull('verificado')->orWhere('verificado', false);
            })
            ->where(function ($q) {
                $q->whereNull('expira_em')->orWhere('expira_em', '>', now());
            })
            ->get();

        if ($fantasmas->isEmpty()) {
            $this->info("Nenhum selo pendente legado encontrado para {$user->name} ({$user->email}).");
            return 0;
        }

        $count = $fantasmas->count();
        $this->info("Removendo {$count} selo(s) pendente(s) legado(s) de {$user->name}...");
        foreach ($fantasmas as $us) {
            $us->delete();
            $this->line("  - UsuarioSelo #{$us->id} (selo_id={$us->selo_id})");
        }
        $this->info("Concluído. O app não deve mais exibir selo pendente para este usuário.");
        return 0;
    }
}
