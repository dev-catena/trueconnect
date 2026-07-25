<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * TIMESTAMP do MySQL não aceita datas antes de 1970-01-01.
     * Data de nascimento precisa ser DATE.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE users MODIFY dt_nascimento DATE NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE users MODIFY dt_nascimento TIMESTAMP NULL');
    }
};
