<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alterar o enum para incluir 'servicedesk'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'user', 'servicedesk') DEFAULT 'user'");
    }

    public function down(): void
    {
        // Reverter para o enum original
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'user') DEFAULT 'user'");
    }
};
