<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ExportDatabaseToSeeders extends Command
{
    protected $signature = 'db:seed-export 
        {--tables=* : Tabelas específicas para exportar (vazio = todas)}
        {--exclude=* : Tabelas a excluir}
        {--force : Sobrescrever seeders existentes}';

    protected $description = 'Exporta os dados atuais do banco para arquivos de seeder (use --force para sobrescrever)';

    protected array $excludeTables = [
        'migrations',
        'password_reset_tokens',
        'personal_access_tokens',
        'failed_jobs',
        'sessions',
        'cache',
        'cache_locks',
        'jobs',
        'job_batches',
    ];

    protected array $tableOrder = [
        'users',
        'plans',
        'contrato_tipos',
        'selos',
        'seal_types',
        'parametros_sistema',
        'additional_purchase_prices',
        'faqs',
        'testimonials',
        'site_settings',
        'contacts',
        'login_history',
        'grupo',
        'modulo',
        'funcionalidade',
        'grupo_funcionalidade',
        'grupo_usuario',
        'usuario_conexoes',
        'clausulas',
        'contratos',
        'contrato_logs',
        'contrato_usuarios',
        'contrato_clausulas',
        'contrato_usuario_clausulas',
        'clausula_tipo_contrato',
        'perguntas',
        'contrato_usuario_perguntas',
        'usuario_selos',
        'usuario_chave',
        'subscriptions',
        'additional_purchases',
        'seal_requests',
        'seal_documents',
        'user_seals',
    ];

    public function handle(): int
    {
        $this->info('Exportando dados do banco para seeders...');

        $tables = $this->getTablesToExport();
        if (empty($tables)) {
            $this->error('Nenhuma tabela encontrada para exportar.');
            return 1;
        }

        foreach ($tables as $table) {
            try {
                $this->exportTable($table);
            } catch (\Throwable $e) {
                $this->error("Erro ao exportar {$table}: " . $e->getMessage());
            }
        }

        $this->info('Exportação concluída!');
        return 0;
    }

    protected function getTablesToExport(): array
    {
        $requested = $this->option('tables');
        $exclude = array_merge($this->excludeTables, $this->option('exclude'));

        $results = DB::select('SHOW TABLES');
        $allTables = collect($results)->map(fn ($t) => array_values((array) $t)[0] ?? '')->filter()->toArray();

        if (!empty($requested)) {
            $tables = array_intersect($allTables, $requested);
        } else {
            $tables = array_diff($allTables, $exclude);
        }

        return $this->sortTablesByDependencies(array_values($tables));
    }

    protected function sortTablesByDependencies(array $tables): array
    {
        $ordered = [];
        foreach ($this->tableOrder as $t) {
            if (in_array($t, $tables)) {
                $ordered[] = $t;
            }
        }
        foreach ($tables as $t) {
            if (!in_array($t, $ordered)) {
                $ordered[] = $t;
            }
        }
        return $ordered;
    }

    protected function exportTable(string $table): void
    {
        if (!Schema::hasTable($table)) {
            $this->warn("  [{$table}] não existe, pulando.");
            return;
        }

        $rows = DB::table($table)->get();
        if ($rows->isEmpty()) {
            $this->line("  [{$table}] vazia, pulando.");
            return;
        }

        $className = $this->tableToSeederClass($table);
        $filePath = database_path("seeders/{$className}.php");

        if (file_exists($filePath) && !$this->option('force')) {
            $this->warn("  [{$table}] {$className} existe, use --force para sobrescrever.");
            return;
        }

        $content = $this->generateSeederContent($table, $className, $rows);
        file_put_contents($filePath, $content);

        $this->info("  [{$table}] " . $rows->count() . " registros -> {$className}.php");
    }

    protected function tableToSeederClass(string $table): string
    {
        return implode('', array_map('ucfirst', explode('_', $table))) . 'Seeder';
    }

    protected function generateSeederContent(string $table, string $className, $rows): string
    {
        $dataArrays = [];
        foreach ($rows as $row) {
            $arr = (array) $row;
            $dataArrays[] = $this->arrayToPhpString($arr);
        }

        $dataStr = "[\n            " . implode(",\n            ", $dataArrays) . "\n        ]";

        return <<<PHP
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class {$className} extends Seeder
{
    public function run(): void
    {
        \$data = {$dataStr};

        foreach (\$data as \$row) {
            DB::table('{$table}')->insert(\$row);
        }
    }
}

PHP;
    }

    protected function arrayToPhpString(array $arr): string
    {
        $parts = [];
        foreach ($arr as $key => $value) {
            $parts[] = "'{$key}' => " . $this->valueToPhp($value);
        }
        return '[' . implode(', ', $parts) . ']';
    }

    protected function valueToPhp($value): string
    {
        if (is_null($value)) {
            return 'null';
        }
        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }
        if (is_int($value)) {
            return (string) $value;
        }
        if (is_float($value)) {
            return number_format($value, 8, '.', '');
        }
        if (is_array($value) || is_object($value)) {
            return "'" . addslashes(json_encode($value, JSON_UNESCAPED_UNICODE)) . "'";
        }
        $str = (string) $value;
        return "'" . addslashes(str_replace(["\r", "\n"], ['\r', '\n'], $str)) . "'";
    }
}
