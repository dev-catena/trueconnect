<?php

namespace App\Console\Commands;

use App\Models\SealType;
use App\Models\Selo;
use Illuminate\Console\Command;

class SincronizarSealTypesComSelos extends Command
{
    protected $signature = 'selos:sincronizar-seal-types';
    protected $description = 'Atualiza nome/descrição dos SealTypes com base nos Selos (por código)';

    public function handle(): int
    {
        $selos = Selo::whereNull('deleted_at')->get();
        $updated = 0;

        foreach ($selos as $selo) {
            $sealType = SealType::where('code', $selo->codigo)->first();
            if (!$sealType) {
                continue;
            }
            $nome = $selo->nome ?? $selo->descricao ?? 'Selo ' . $selo->id;
            if ($sealType->name !== $nome) {
                $antigo = $sealType->name;
                $sealType->update([
                    'name' => $nome,
                    'description' => $selo->descricao ?? $sealType->description,
                ]);
                $this->line("  SealType #{$sealType->id} ({$sealType->code}): \"{$antigo}\" → \"{$nome}\"");
                $updated++;
            }
        }

        $this->info("Concluído. {$updated} SealType(s) atualizado(s).");
        return 0;
    }
}
