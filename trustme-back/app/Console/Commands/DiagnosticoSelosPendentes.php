<?php

namespace App\Console\Commands;

use App\Models\SealRequest;
use App\Models\Selo;
use App\Models\UsuarioSelo;
use App\Models\User;
use App\Models\UserSeal;
use Illuminate\Console\Command;

class DiagnosticoSelosPendentes extends Command
{
    protected $signature = 'selos:diagnostico-pendentes {user : Nome, email ou ID do usuário}';
    protected $description = 'Diagnostica selos pendentes: mostra fontes (usuario_selos, user_seals, seal_requests) e identifica pendentes órfãos';

    public function handle(): int
    {
        $input = $this->argument('user');
        $user = $this->findUser($input);
        if (!$user) {
            $this->error("Usuário não encontrado: {$input}");
            return 1;
        }

        $this->info("=== Diagnóstico de selos pendentes para {$user->name} (ID: {$user->id}, email: {$user->email}) ===\n");

        // 1. UsuarioSelo pendentes (legado)
        $usuarioSelos = UsuarioSelo::with(['selo' => fn($q) => $q->withTrashed()])
            ->where('usuario_id', $user->id)
            ->where(function ($q) {
                $q->whereNull('verificado')->orWhere('verificado', false);
            })
            ->where(function ($q) {
                $q->whereNull('expira_em')->orWhere('expira_em', '>', now());
            })
            ->get();

        $this->line("1. USUARIO_SELOS (legado) - Pendentes: {$usuarioSelos->count()}");
        foreach ($usuarioSelos as $us) {
            $selo = $us->selo;
            $seloInfo = $selo ? ($selo->descricao ?? $selo->codigo ?? "Selo #{$selo->id}") : "Selo #{$us->selo_id} (excluído?)";
            $trashed = $selo && $selo->trashed() ? ' [SELO EXCLUÍDO]' : '';
            $this->line("   - UsuarioSelo #{$us->id} | selo_id={$us->selo_id} | {$seloInfo}{$trashed}");
        }

        // 2. UserSeal pendentes
        $userSeals = UserSeal::with('sealType')
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'under_review'])
            ->get();

        $this->line("\n2. USER_SEALS - Pendentes: {$userSeals->count()}");
        foreach ($userSeals as $us) {
            $st = $us->sealType;
            $nome = $st ? $st->name : "SealType #{$us->seal_type_id}";
            $this->line("   - UserSeal #{$us->id} | seal_type_id={$us->seal_type_id} | {$nome} | status={$us->status}");
        }

        // 3. SealRequest pendentes
        $sealRequests = SealRequest::with('sealType')
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'under_review'])
            ->get();

        $this->line("\n3. SEAL_REQUESTS - Pendentes na plataforma: {$sealRequests->count()}");
        foreach ($sealRequests as $sr) {
            $st = $sr->sealType;
            $nome = $st ? $st->name : "SealType #{$sr->seal_type_id}";
            $this->line("   - SealRequest #{$sr->id} | seal_type_id={$sr->seal_type_id} | {$nome} | status={$sr->status}");
        }

        // 4. Identificar órfãos (pendentes que NÃO aparecem na plataforma)
        $this->line("\n--- ÓRFÃOS (aparecem no app mas NÃO na plataforma) ---");

        $orphanCount = 0;

        foreach ($usuarioSelos as $us) {
            $selo = $us->selo;
            if (!$selo) continue;
            $codigo = $selo->codigo ?? null;
            if (!$codigo) continue;
            $sealType = \App\Models\SealType::where('code', $codigo)->first();
            if (!$sealType) {
                $this->warn("   [UsuarioSelo #{$us->id}] Selo {$codigo} sem SealType correspondente - precisa criar SealType ou mapear");
                $orphanCount++;
                continue;
            }
            $existeSr = SealRequest::where('user_id', $user->id)
                ->where('seal_type_id', $sealType->id)
                ->whereIn('status', ['pending', 'under_review'])
                ->exists();
            if (!$existeSr) {
                $this->warn("   [UsuarioSelo #{$us->id}] {$selo->descricao} - SEM SealRequest na plataforma");
                $orphanCount++;
            }
        }

        foreach ($userSeals as $us) {
            $existeSr = SealRequest::where('user_id', $user->id)
                ->where('seal_type_id', $us->seal_type_id)
                ->whereIn('status', ['pending', 'under_review'])
                ->exists();
            if (!$existeSr) {
                $st = $us->sealType;
                $nome = $st ? $st->name : "SealType #{$us->seal_type_id}";
                $this->warn("   [UserSeal #{$us->id}] {$nome} - SEM SealRequest na plataforma");
                $orphanCount++;
            }
        }

        if ($orphanCount === 0) {
            $this->info("\nNenhum órfão encontrado. Se o selo ainda não aparece na plataforma, verifique filtros ou busca.");
        } else {
            $this->info("\nTotal de órfãos: {$orphanCount}. Execute: php artisan selos:sincronizar-pendentes-orfaos --user={$user->id}");
        }

        return 0;
    }

    private function findUser(string $input): ?User
    {
        if (is_numeric($input)) {
            return User::find((int) $input);
        }
        if (str_contains($input, '@')) {
            return User::where('email', $input)->first();
        }
        return User::where('nome_completo', 'like', "%{$input}%")
            ->orWhere('name', 'like', "%{$input}%")
            ->first();
    }
}
