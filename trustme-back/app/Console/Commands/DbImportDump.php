<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Config;

class DbImportDump extends Command
{
    protected $signature = 'db:import-dump {file : Caminho do arquivo .sql}';
    protected $description = 'Importa um dump SQL no banco configurado (via cliente mysql)';

    public function handle(): int
    {
        $file = $this->argument('file');
        if (! is_file($file) || ! is_readable($file)) {
            $this->error("Arquivo não encontrado ou inacessível: {$file}");
            return 1;
        }

        $cfg = Config::get('database.connections.mysql');
        $host = $cfg['host'] ?? '127.0.0.1';
        $user = $cfg['username'] ?? 'root';
        $pass = $cfg['password'] ?? '';
        $db = $cfg['database'] ?? '';

        $passArg = $pass !== '' ? '-p' . escapeshellarg($pass) : '';
        $cmd = sprintf(
            'mysql -h%s -u%s %s %s < %s 2>&1',
            escapeshellarg($host),
            escapeshellarg($user),
            $passArg,
            escapeshellarg($db),
            escapeshellarg(realpath($file))
        );

        $this->info("Importando {$file} em {$db}...");
        passthru($cmd, $code);
        if ($code !== 0) {
            $this->error("Importação falhou (código {$code}).");
            return 1;
        }
        $this->info('Importação concluída.');
        return 0;
    }
}
