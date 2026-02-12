<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class FixUserCodes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:fix-codes {--dry-run : Apenas mostra o que seria corrigido sem fazer alterações}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Corrige todos os códigos de usuário para terem exatamente 6 dígitos (com zeros à esquerda)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        
        if ($dryRun) {
            $this->info('🔍 Modo DRY-RUN: Nenhuma alteração será feita.');
            $this->info('');
        }

        // Buscar todos os usuários
        $users = User::all();
        $totalUsers = $users->count();
        $fixedCount = 0;
        $errorCount = 0;
        $skippedCount = 0;

        $this->info("📊 Total de usuários encontrados: {$totalUsers}");
        $this->info('');

        $this->info('🔍 Verificando códigos...');
        $this->info('');

        $issues = [];

        foreach ($users as $user) {
            $originalCode = $user->codigo;
            
            // Se não tem código, gerar um novo
            if (!$originalCode || $originalCode === '') {
                if (!$dryRun) {
                    try {
                        $user->codigo = User::generateUniqueCode();
                        $user->save();
                        $fixedCount++;
                        $userName = $user->nome_completo ?? $user->name ?? 'Sem nome';
                        $this->info("✅ Usuário ID {$user->id} ({$userName}): Código gerado: {$user->codigo}");
                    } catch (\Exception $e) {
                        $errorCount++;
                        $this->error("❌ Erro ao corrigir usuário ID {$user->id}: " . $e->getMessage());
                    }
                } else {
                    $issues[] = [
                        'id' => $user->id,
                        'nome' => $user->nome_completo ?? $user->name ?? 'Sem nome',
                        'codigo_atual' => 'SEM CÓDIGO',
                        'codigo_novo' => '[GERAR NOVO]',
                        'acao' => 'Gerar novo código'
                    ];
                }
                continue;
            }

            // Converter para string e remover espaços
            $codeStr = trim((string)$originalCode);
            
            // Verificar se já tem 6 dígitos
            if (strlen($codeStr) === 6 && ctype_digit($codeStr)) {
                $skippedCount++;
                continue;
            }

            // Se tem mais de 6 dígitos, gerar um novo código
            if (strlen($codeStr) > 6) {
                if (!$dryRun) {
                    try {
                        $newCode = User::generateUniqueCode();
                        $user->codigo = $newCode;
                        $user->save();
                        $fixedCount++;
                        $userName = $user->nome_completo ?? $user->name ?? 'Sem nome';
                        $this->info("✅ Usuário ID {$user->id} ({$userName}): {$originalCode} → {$newCode} (código tinha mais de 6 dígitos)");
                    } catch (\Exception $e) {
                        $errorCount++;
                        $this->error("❌ Erro ao corrigir usuário ID {$user->id}: " . $e->getMessage());
                    }
                } else {
                    $issues[] = [
                        'id' => $user->id,
                        'nome' => $user->nome_completo ?? $user->name ?? 'Sem nome',
                        'codigo_atual' => $originalCode,
                        'codigo_novo' => '[GERAR NOVO - MAIS DE 6 DÍGITOS]',
                        'acao' => 'Gerar novo código (mais de 6 dígitos)'
                    ];
                }
                continue;
            }

            // Formatar para 6 dígitos (apenas se tiver menos de 6 dígitos)
            $formattedCode = str_pad($codeStr, 6, '0', STR_PAD_LEFT);

            // Verificar se o código formatado já existe para outro usuário
            $exists = User::where('codigo', $formattedCode)
                ->where('id', '!=', $user->id)
                ->exists();

            if ($exists) {
                // Se o código formatado já existe, gerar um novo
                if (!$dryRun) {
                    try {
                        $newCode = User::generateUniqueCode();
                        $user->codigo = $newCode;
                        $user->save();
                        $fixedCount++;
                        $userName = $user->nome_completo ?? $user->name ?? 'Sem nome';
                        $this->info("✅ Usuário ID {$user->id} ({$userName}): {$originalCode} → {$newCode} (conflito resolvido)");
                    } catch (\Exception $e) {
                        $errorCount++;
                        $this->error("❌ Erro ao corrigir usuário ID {$user->id}: " . $e->getMessage());
                    }
                } else {
                    $issues[] = [
                        'id' => $user->id,
                        'nome' => $user->nome_completo ?? $user->name ?? 'Sem nome',
                        'codigo_atual' => $originalCode,
                        'codigo_novo' => '[GERAR NOVO - CONFLITO]',
                        'acao' => 'Gerar novo código (conflito)'
                    ];
                }
            } else {
                // Atualizar com código formatado
                if (!$dryRun) {
                    try {
                        DB::beginTransaction();
                        $user->codigo = $formattedCode;
                        $user->save();
                        DB::commit();
                        $fixedCount++;
                        $userName = $user->nome_completo ?? $user->name ?? 'Sem nome';
                        $this->info("✅ Usuário ID {$user->id} ({$userName}): {$originalCode} → {$formattedCode}");
                    } catch (\Exception $e) {
                        DB::rollBack();
                        $errorCount++;
                        $this->error("❌ Erro ao corrigir usuário ID {$user->id}: " . $e->getMessage());
                    }
                } else {
                    $issues[] = [
                        'id' => $user->id,
                        'nome' => $user->nome_completo ?? $user->name ?? 'Sem nome',
                        'codigo_atual' => $originalCode,
                        'codigo_novo' => $formattedCode,
                        'acao' => 'Formatar código'
                    ];
                }
            }
        }

        if ($dryRun && !empty($issues)) {
            $this->info('');
            $this->warn('⚠️  Usuários que seriam corrigidos:');
            $this->info('');
            
            $headers = ['ID', 'Nome', 'Código Atual', 'Código Novo', 'Ação'];
            $rows = array_map(function($issue) {
                return [
                    $issue['id'],
                    $issue['nome'],
                    $issue['codigo_atual'],
                    $issue['codigo_novo'],
                    $issue['acao']
                ];
            }, $issues);
            
            $this->table($headers, $rows);
            $this->info('');
            $this->info("📊 Resumo (DRY-RUN):");
            $this->info("   - Seriam corrigidos: " . count($issues));
            $this->info("   - Seriam ignorados: {$skippedCount}");
        } else {
            $this->info('');
            $this->info("📊 Resumo:");
            $this->info("   - Total de usuários: {$totalUsers}");
            $this->info("   - Códigos corrigidos: {$fixedCount}");
            $this->info("   - Códigos já corretos: {$skippedCount}");
            if ($errorCount > 0) {
                $this->error("   - Erros: {$errorCount}");
            }
        }

        $this->info('');

        if ($dryRun) {
            $this->info('💡 Para aplicar as correções, execute sem --dry-run:');
            $this->info('   php artisan users:fix-codes');
        } else {
            $this->info('✅ Processo concluído!');
        }

        return 0;
    }
}

