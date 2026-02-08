<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adiciona colunas necessárias para usuários restaurados do backup
     */
    public function up(): void
    {
        // Adicionar coluna 'name' se não existir
        if (!Schema::hasColumn('users', 'name')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('name')->nullable()->after('id');
            });
        }

        // Adicionar coluna 'role' se não existir
        if (!Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->enum('role', ['admin', 'user', 'servicedesk'])->default('user')->after('password');
            });
        }

        // Adicionar coluna 'deleted_at' se não existir (para soft deletes)
        if (!Schema::hasColumn('users', 'deleted_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('deleted_at')->nullable()->after('updated_at');
            });
        }

        // Adicionar coluna 'remember_token' se não existir
        if (!Schema::hasColumn('users', 'remember_token')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('remember_token', 100)->nullable()->after('password');
            });
        }

        // Preencher 'name' com 'nome_completo' onde estiver vazio
        DB::statement("UPDATE users SET name = nome_completo WHERE (name IS NULL OR name = '') AND nome_completo IS NOT NULL");

        // Definir role 'admin' para admin@trustme.com se existir
        DB::statement("UPDATE users SET role = 'admin' WHERE email = 'admin@trustme.com'");

        // Garantir que todos os outros usuários tenham role 'user'
        DB::statement("UPDATE users SET role = 'user' WHERE role IS NULL OR role = ''");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Não remover colunas para não perder dados
        // As colunas podem ser necessárias mesmo após rollback
    }
};
