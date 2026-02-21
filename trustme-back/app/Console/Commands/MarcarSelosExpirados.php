<?php

namespace App\Console\Commands;

use App\Models\UserSeal;
use Illuminate\Console\Command;

class MarcarSelosExpirados extends Command
{
    protected $signature = 'selos:marcar-expirados';

    protected $description = 'Atualiza status para expired em UserSeal cujo expires_at já passou';

    public function handle(): int
    {
        $count = UserSeal::where('status', 'approved')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->update(['status' => 'expired']);

        if ($count > 0) {
            $this->info("{$count} selo(s) marcado(s) como expirado(s).");
        }

        return 0;
    }
}
