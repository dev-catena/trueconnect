<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seal_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('requires_manual_approval')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Inserir tipos de selos padrão
        DB::table('seal_types')->insert([
            [
                'code' => 'telefone',
                'name' => 'Telefone/WhatsApp',
                'description' => 'Validação automática de telefone e WhatsApp',
                'requires_manual_approval' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'endereco',
                'name' => 'Endereço',
                'description' => 'Comprovação de endereço através de documentos',
                'requires_manual_approval' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'documentos',
                'name' => 'Documentos (RG/CNH/CTPS/Passaporte)',
                'description' => 'Validação de documentos de identidade',
                'requires_manual_approval' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'veiculo',
                'name' => 'Veículo (CRLV)',
                'description' => 'Validação de documentação de veículo',
                'requires_manual_approval' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'irpf',
                'name' => 'IRPF (Renda)',
                'description' => 'Comprovação de renda através de IRPF',
                'requires_manual_approval' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'empresario',
                'name' => 'Empresário (CNPJ)',
                'description' => 'Validação de CNPJ e documentação empresarial',
                'requires_manual_approval' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('seal_types');
    }
};
