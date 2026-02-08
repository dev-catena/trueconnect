<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Adiciona campos do app se não existirem
            if (!Schema::hasColumn('users', 'codigo')) {
                $table->bigInteger('codigo')->nullable()->unique()->after('id');
            }
            if (!Schema::hasColumn('users', 'nome_completo')) {
                $table->string('nome_completo', 255)->nullable()->after('name');
            }
            if (!Schema::hasColumn('users', 'CPF')) {
                $table->string('CPF', 255)->nullable()->after('nome_completo');
            }
            if (!Schema::hasColumn('users', 'pais')) {
                $table->string('pais', 255)->nullable()->after('CPF');
            }
            if (!Schema::hasColumn('users', 'estado')) {
                $table->string('estado', 255)->nullable()->after('pais');
            }
            if (!Schema::hasColumn('users', 'cidade')) {
                $table->string('cidade', 255)->nullable()->after('estado');
            }
            if (!Schema::hasColumn('users', 'endereco')) {
                $table->string('endereco', 255)->nullable()->after('cidade');
            }
            if (!Schema::hasColumn('users', 'profissao')) {
                $table->string('profissao', 255)->nullable()->after('endereco');
            }
            if (!Schema::hasColumn('users', 'renda_classe')) {
                $table->string('renda_classe', 100)->nullable()->after('profissao');
            }
            if (!Schema::hasColumn('users', 'dt_nascimento')) {
                $table->timestamp('dt_nascimento')->nullable()->after('renda_classe');
            }
            if (!Schema::hasColumn('users', 'caminho_foto')) {
                $table->string('caminho_foto', 255)->nullable()->after('dt_nascimento');
            }
            if (!Schema::hasColumn('users', 'cep')) {
                $table->string('cep')->nullable()->after('pais');
            }
            if (!Schema::hasColumn('users', 'bairro')) {
                $table->string('bairro')->nullable()->after('endereco');
            }
            if (!Schema::hasColumn('users', 'endereco_numero')) {
                $table->string('endereco_numero')->nullable()->after('bairro');
            }
            if (!Schema::hasColumn('users', 'complemento')) {
                $table->string('complemento')->nullable()->after('endereco_numero');
            }
            // Adiciona soft deletes se não existir
            if (!Schema::hasColumn('users', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = ['codigo', 'nome_completo', 'CPF', 'pais', 'estado', 'cidade', 'endereco', 
                       'profissao', 'renda_classe', 'dt_nascimento', 'caminho_foto', 
                       'cep', 'bairro', 'endereco_numero', 'complemento'];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
            
            if (Schema::hasColumn('users', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
