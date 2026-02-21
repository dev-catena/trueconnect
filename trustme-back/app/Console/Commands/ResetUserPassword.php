<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ResetUserPassword extends Command
{
    protected $signature = 'user:reset-password 
                            {identifier : CPF (com ou sem formatação) ou ID do usuário}
                            {password : Nova senha (mínimo 8 caracteres)}
                            {--id : Se informado, identifier é tratado como ID}';

    protected $description = 'Reseta a senha de um usuário por CPF ou ID (útil para corrigir senhas com hash duplicado)';

    public function handle(): int
    {
        $identifier = $this->argument('identifier');
        $password = $this->argument('password');
        $isId = $this->option('id');

        if (strlen($password) < 8) {
            $this->error('A senha deve ter pelo menos 8 caracteres.');
            return 1;
        }

        if ($isId) {
            $user = User::find($identifier);
        } else {
            $cpfNormalized = preg_replace('/[^0-9]/', '', $identifier);
            $user = User::where(function ($query) use ($cpfNormalized, $identifier) {
                $query->whereRaw("REPLACE(REPLACE(REPLACE(CPF, '.', ''), '-', ''), ' ', '') = ?", [$cpfNormalized])
                    ->orWhere('CPF', $identifier)
                    ->orWhere('CPF', $cpfNormalized);
            })->first();
        }

        if (!$user) {
            $this->error('Usuário não encontrado.');
            return 1;
        }

        $user->password = $password;
        $user->save();

        $this->info("Senha alterada com sucesso para o usuário: {$user->nome_completo} (ID: {$user->id}, Email: {$user->email})");

        return 0;
    }
}
