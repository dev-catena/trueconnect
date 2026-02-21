<?php

namespace App\Console\Commands;

use App\Models\SealRequest;
use App\Models\SealType;
use App\Models\Selo;
use App\Models\UsuarioSelo;
use App\Models\User;
use App\Models\UserSeal;
use Illuminate\Console\Command;

class SincronizarPendentesOrfaos extends Command
{
    protected $signature = 'selos:sincronizar-pendentes-orfaos {--user= : Apenas para este usuário (ID, email ou nome)}';
    protected $description = 'Cria SealRequests para pendentes órfãos (UsuarioSelo ou UserSeal sem SealRequest) para que apareçam na plataforma';

    public function handle(): int
    {
        $userInput = $this->option('user');
        $created = 0;

        if ($userInput) {
            $user = $this->findUser($userInput);
            if (!$user) {
                $this->error("Usuário não encontrado: {$userInput}");
                return 1;
            }
            $created += $this->syncForUser($user);
        } else {
            $users = collect();
            // UsuarioSelos pendentes
            $usIds = UsuarioSelo::where(function ($q) {
                $q->whereNull('verificado')->orWhere('verificado', false);
            })->where(function ($q) {
                $q->whereNull('expira_em')->orWhere('expira_em', '>', now());
            })->pluck('usuario_id')->unique();
            $users = $users->merge($usIds);
            // UserSeals pendentes
            $usIds2 = UserSeal::whereIn('status', ['pending', 'under_review'])->pluck('user_id')->unique();
            $users = $users->merge($usIds2)->unique();

            foreach ($users as $uid) {
                $u = User::find($uid);
                if ($u) {
                    $c = $this->syncForUser($u);
                    $created += $c;
                }
            }
        }

        $this->info("Concluído. {$created} SealRequest(s) criado(s) para pendentes órfãos.");
        return 0;
    }

    private function syncForUser(User $user): int
    {
        $created = 0;

        // 1. UsuarioSelo pendentes sem SealRequest
        $usuarioSelos = UsuarioSelo::with(['selo' => fn($q) => $q->withTrashed()])
            ->where('usuario_id', $user->id)
            ->where(function ($q) {
                $q->whereNull('verificado')->orWhere('verificado', false);
            })
            ->where(function ($q) {
                $q->whereNull('expira_em')->orWhere('expira_em', '>', now());
            })
            ->get();

        foreach ($usuarioSelos as $us) {
            $selo = $us->selo;
            if (!$selo) continue;
            $codigo = $selo->codigo ?? null;
            if (!$codigo) continue;

            $sealType = SealType::where('code', $codigo)->first();
            if (!$sealType) {
                $sealType = SealType::create([
                    'code' => $codigo,
                    'name' => $selo->descricao ?? $selo->nome ?? "Selo {$codigo}",
                    'description' => $selo->descricao,
                    'requires_manual_approval' => true,
                    'is_active' => true,
                ]);
            }

            $existe = SealRequest::where('user_id', $user->id)
                ->where('seal_type_id', $sealType->id)
                ->whereIn('status', ['pending', 'under_review'])
                ->exists();
            if (!$existe) {
                SealRequest::create([
                    'user_id' => $user->id,
                    'seal_type_id' => $sealType->id,
                    'status' => 'pending',
                ]);
                $this->line("  [UsuarioSelo #{$us->id}] Criado SealRequest para {$sealType->name}");
                $created++;
            }
        }

        // 2. UserSeal pendentes sem SealRequest
        $userSeals = UserSeal::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'under_review'])
            ->get();

        foreach ($userSeals as $us) {
            $existe = SealRequest::where('user_id', $user->id)
                ->where('seal_type_id', $us->seal_type_id)
                ->whereIn('status', ['pending', 'under_review'])
                ->exists();
            if (!$existe) {
                SealRequest::create([
                    'user_id' => $user->id,
                    'seal_type_id' => $us->seal_type_id,
                    'status' => $us->status === 'under_review' ? 'under_review' : 'pending',
                ]);
                $st = $us->sealType;
                $nome = $st ? $st->name : "SealType #{$us->seal_type_id}";
                $this->line("  [UserSeal #{$us->id}] Criado SealRequest para {$nome}");
                $created++;
            }
        }

        return $created;
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
