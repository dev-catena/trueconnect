<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateTestUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'create:test-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cria usuários de teste: jose@trustme.com (usuário comum) e admin@trustme.com (admin)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Criando usuários de teste...');
        
        // Criar usuário comum (web)
        $this->createUser(
            'José Silva',
            'jose@trustme.com',
            'jose123',
            'user'
        );
        
        // Criar usuário admin (web)
        $this->createUser(
            'Admin TrustMe',
            'admin@trustme.com',
            'admin123',
            'admin'
        );
        
        // Criar usuário de teste para app (com CPF)
        $this->createAppUser(
            'Usuário Teste App',
            '57712083029',
            'teste.app@trustme.com',
            '11111111',
            'user'
        );
        
        $this->info('');
        $this->info('✅ Usuários de teste criados com sucesso!');
        $this->info('');
        $this->info('👤 Usuário Comum (Web):');
        $this->info('   Email: jose@trustme.com');
        $this->info('   Senha: jose123');
        $this->info('');
        $this->info('👨‍💼 Usuário Admin (Web):');
        $this->info('   Email: admin@trustme.com');
        $this->info('   Senha: admin123');
        $this->info('');
        $this->info('📱 Usuário App:');
        $this->info('   CPF: 57712083029');
        $this->info('   Email: teste.app@trustme.com');
        $this->info('   Senha: 11111111');
        $this->info('');
    }
    
    private function createUser($name, $email, $password, $role)
    {
        // Verificar se o usuário já existe
        $existingUser = User::where('email', $email)->first();
        
        if ($existingUser) {
            $this->warn("⚠️  Usuário {$email} já existe. Atualizando senha...");
            $existingUser->update([
                'name' => $name,
                'nome_completo' => $name,
                'password' => Hash::make($password),
                'role' => $role
            ]);
            $this->info("✅ Usuário {$email} atualizado.");
        } else {
            // Gerar código único
            $maxCodigo = User::max('codigo') ?? 0;
            $codigo = $maxCodigo + 1;
            
            User::create([
                'codigo' => $codigo,
                'name' => $name,
                'nome_completo' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'role' => $role,
                'email_verified_at' => now(),
            ]);
            $this->info("✅ Usuário {$email} criado.");
        }
    }
    
    private function createAppUser($nomeCompleto, $cpf, $email, $password, $role)
    {
        // Normalizar CPF: remover pontos, traços e espaços
        $cpfNormalized = preg_replace('/[^0-9]/', '', $cpf);
        
        // Verificar se o usuário já existe por CPF ou email
        $existingUser = User::where('CPF', $cpfNormalized)
            ->orWhere('CPF', $cpf)
            ->orWhere('email', $email)
            ->first();
        
        if ($existingUser) {
            $this->warn("⚠️  Usuário com CPF {$cpf} ou email {$email} já existe. Atualizando senha...");
            $existingUser->update([
                'nome_completo' => $nomeCompleto,
                'name' => $nomeCompleto,
                'CPF' => $cpfNormalized,
                'email' => $email,
                'password' => Hash::make($password),
                'role' => $role
            ]);
            $this->info("✅ Usuário com CPF {$cpf} atualizado.");
        } else {
            // Gerar código único
            $maxCodigo = User::max('codigo') ?? 0;
            $codigo = $maxCodigo + 1;
            
            User::create([
                'codigo' => $codigo,
                'nome_completo' => $nomeCompleto,
                'name' => $nomeCompleto,
                'CPF' => $cpfNormalized,
                'email' => $email,
                'password' => Hash::make($password),
                'role' => $role,
            ]);
            $this->info("✅ Usuário com CPF {$cpf} criado.");
        }
    }
}
