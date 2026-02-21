<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Adiciona status "Rescindido" aos contratos.
     * Permite que o contratante desista/rescinda de um contrato já assinado (Ativo/Concluído).
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE contratos MODIFY COLUMN status ENUM('Pendente', 'Ativo', 'Concluído', 'Suspenso', 'Expirado', 'Rescindido') NOT NULL DEFAULT 'Pendente'");
    }

    public function down(): void
    {
        // Contratos Rescindido voltam para Concluído antes de reverter o enum
        DB::table('contratos')->where('status', 'Rescindido')->update(['status' => 'Concluído']);
        DB::statement("ALTER TABLE contratos MODIFY COLUMN status ENUM('Pendente', 'Ativo', 'Concluído', 'Suspenso', 'Expirado') NOT NULL DEFAULT 'Pendente'");
    }
};
