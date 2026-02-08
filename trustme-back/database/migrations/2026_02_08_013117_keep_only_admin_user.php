<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Remove todos os usuários exceto admin@trustme.com
     * Garante que admin@trustme.com exista com senha admin123
     */
    public function up(): void
    {
        // Buscar ou criar o usuário admin
        $adminEmail = 'admin@trustme.com';
        $adminPassword = 'admin123';
        
        $admin = User::where('email', $adminEmail)->first();
        
        if (!$admin) {
            // Criar o usuário admin se não existir
            $admin = User::create([
                'name' => 'Administrador',
                'nome_completo' => 'Administrador',
                'email' => $adminEmail,
                'password' => Hash::make($adminPassword),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);
        } else {
            // Atualizar senha e garantir que seja admin
            $admin->update([
                'name' => 'Administrador',
                'nome_completo' => 'Administrador',
                'password' => Hash::make($adminPassword),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);
        }
        
        // NÃO remover usuários do app - apenas garantir que o admin existe
        // Os usuários do app devem ser mantidos
        // Comentado para não deletar usuários do app:
        // User::where('email', '!=', $adminEmail)->forceDelete();
    }

    /**
     * Reverse the migrations.
     * Não há como reverter a exclusão de usuários
     */
    public function down(): void
    {
        // Não é possível reverter a exclusão de usuários
    }
};
