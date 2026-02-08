<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\SealType;
use App\Models\SealRequest;
use App\Models\SealDocument;
use App\Models\UserSeal;
use Carbon\Carbon;

class SealTestDataSeeder extends Seeder
{
    public function run(): void
    {
        // Buscar usuários e tipos de selos
        $users = User::where('role', 'user')->get();
        $sealTypes = SealType::all();
        $servicedeskUser = User::where('role', 'servicedesk')->first();

        if ($users->isEmpty()) {
            $this->command->warn('Nenhum usuário comum encontrado. Criando usuários de teste...');
            $users = collect([
                User::create([
                    'name' => 'João Silva',
                    'email' => 'joao@teste.com',
                    'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                    'role' => 'user',
                    'email_verified_at' => now(),
                ]),
                User::create([
                    'name' => 'Maria Santos',
                    'email' => 'maria@teste.com',
                    'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                    'role' => 'user',
                    'email_verified_at' => now(),
                ]),
                User::create([
                    'name' => 'Pedro Oliveira',
                    'email' => 'pedro@teste.com',
                    'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                    'role' => 'user',
                    'email_verified_at' => now(),
                ]),
            ]);
        }

        if ($sealTypes->isEmpty()) {
            $this->command->error('Nenhum tipo de selo encontrado. Execute as migrations primeiro!');
            return;
        }

        $this->command->info('Criando dados de teste para selos...');

        // Criar solicitações e selos para cada tipo
        foreach ($sealTypes as $index => $sealType) {
            $user = $users[$index % $users->count()];
            
            // Criar solicitação
            $request = SealRequest::create([
                'user_id' => $user->id,
                'seal_type_id' => $sealType->id,
                'status' => $this->getRandomStatus($sealType->code),
                'notes' => $this->getNotesForSealType($sealType->code),
                'reviewed_by' => $this->shouldBeReviewed($sealType->code) ? ($servicedeskUser ? $servicedeskUser->id : null) : null,
                'reviewed_at' => $this->shouldBeReviewed($sealType->code) ? now()->subDays(rand(1, 10)) : null,
                'rejection_reason' => $this->getRandomStatus($sealType->code) === 'rejected' ? 'Documentação incompleta ou inválida.' : null,
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now()->subDays(rand(0, 5)),
            ]);

            // Criar documentos se necessário
            if ($sealType->requires_manual_approval) {
                $this->createDocumentsForRequest($request, $sealType->code);
            }

            // Criar user_seal baseado no status da solicitação
            if ($request->status === 'approved') {
                UserSeal::create([
                    'user_id' => $user->id,
                    'seal_type_id' => $sealType->id,
                    'status' => 'approved',
                    'approved_at' => $request->reviewed_at ?? now(),
                    'approved_by' => $request->reviewed_by,
                    'expires_at' => $sealType->code === 'telefone' ? null : now()->addDays(365),
                    'validation_data' => $this->getValidationData($sealType->code),
                    'created_at' => $request->created_at,
                    'updated_at' => $request->updated_at,
                ]);
            } elseif ($request->status === 'rejected') {
                UserSeal::create([
                    'user_id' => $user->id,
                    'seal_type_id' => $sealType->id,
                    'status' => 'rejected',
                    'rejection_reason' => $request->rejection_reason,
                    'created_at' => $request->created_at,
                    'updated_at' => $request->updated_at,
                ]);
            }

            $this->command->info("✅ Criado: {$sealType->name} para {$user->name} - Status: {$request->status}");
        }

        // Criar mais solicitações pendentes para testar
        $this->command->info('Criando solicitações adicionais pendentes...');
        
        foreach ($sealTypes->where('requires_manual_approval', true) as $sealType) {
            $user = $users->random();
            
            // Verificar se já existe solicitação para este usuário e tipo
            $existing = SealRequest::where('user_id', $user->id)
                ->where('seal_type_id', $sealType->id)
                ->first();
            
            if (!$existing) {
                $request = SealRequest::create([
                    'user_id' => $user->id,
                    'seal_type_id' => $sealType->id,
                    'status' => 'pending',
                    'notes' => 'Aguardando análise da documentação.',
                    'created_at' => now()->subDays(rand(1, 7)),
                    'updated_at' => now()->subDays(rand(0, 2)),
                ]);

                $this->createDocumentsForRequest($request, $sealType->code);
                $this->command->info("✅ Criada solicitação pendente: {$sealType->name} para {$user->name}");
            }
        }

        // Criar alguns selos aprovados diretamente (sem solicitação)
        $this->command->info('Criando selos aprovados adicionais...');
        
        foreach ($sealTypes as $sealType) {
            $user = $users->random();
            
            // Verificar se já existe selo para este usuário e tipo
            $existing = UserSeal::where('user_id', $user->id)
                ->where('seal_type_id', $sealType->id)
                ->first();
            
            if (!$existing) {
                UserSeal::create([
                    'user_id' => $user->id,
                    'seal_type_id' => $sealType->id,
                    'status' => 'approved',
                    'approved_at' => now()->subDays(rand(10, 60)),
                    'approved_by' => $servicedeskUser ? $servicedeskUser->id : null,
                    'expires_at' => $sealType->code === 'telefone' ? null : now()->addDays(rand(200, 365)),
                    'validation_data' => $this->getValidationData($sealType->code),
                    'created_at' => now()->subDays(rand(10, 60)),
                    'updated_at' => now()->subDays(rand(0, 10)),
                ]);
                
                $this->command->info("✅ Criado selo aprovado: {$sealType->name} para {$user->name}");
            }
        }

        $this->command->info('');
        $this->command->info('✨ Dados de teste criados com sucesso!');
        $this->command->info('');
        $this->command->info('Resumo:');
        $this->command->info('- Solicitações: ' . SealRequest::count());
        $this->command->info('- Documentos: ' . SealDocument::count());
        $this->command->info('- Selos: ' . UserSeal::count());
    }

    private function getRandomStatus($sealTypeCode)
    {
        // Telefone é automático, então sempre aprovado
        if ($sealTypeCode === 'telefone') {
            return 'approved';
        }

        $statuses = ['pending', 'under_review', 'approved', 'rejected'];
        $weights = [30, 20, 40, 10]; // 30% pendente, 20% em revisão, 40% aprovado, 10% rejeitado
        
        $random = rand(1, 100);
        $cumulative = 0;
        
        foreach ($statuses as $index => $status) {
            $cumulative += $weights[$index];
            if ($random <= $cumulative) {
                return $status;
            }
        }
        
        return 'pending';
    }

    private function shouldBeReviewed($sealTypeCode)
    {
        if ($sealTypeCode === 'telefone') {
            return false; // Telefone é automático
        }
        
        return rand(1, 100) > 40; // 60% chance de ter sido revisado
    }

    private function getNotesForSealType($sealTypeCode)
    {
        $notes = [
            'telefone' => 'Telefone e WhatsApp validados automaticamente pelo sistema.',
            'endereco' => 'Enviei comprovante de residência atualizado.',
            'documentos' => 'Enviei cópias dos documentos solicitados: RG, CNH e CTPS.',
            'veiculo' => 'Enviei cópia do CRLV do veículo.',
            'irpf' => 'Enviei declaração de IRPF do último exercício.',
            'empresario' => 'Enviei documentação completa da empresa incluindo CNPJ.',
        ];

        return $notes[$sealTypeCode] ?? 'Solicitação de selo.';
    }

    private function createDocumentsForRequest($request, $sealTypeCode)
    {
        $documentTypes = $this->getDocumentTypesForSealType($sealTypeCode);
        
        foreach ($documentTypes as $docType) {
            SealDocument::create([
                'seal_request_id' => $request->id,
                'document_type' => $docType,
                'file_path' => "seal-documents/{$request->id}/{$docType}_" . uniqid() . ".pdf",
                'file_name' => $this->getDocumentFileName($docType),
                'mime_type' => 'application/pdf',
                'file_size' => rand(50000, 2000000), // 50KB a 2MB
                'notes' => $this->getDocumentNotes($docType),
                'created_at' => $request->created_at,
                'updated_at' => $request->updated_at,
            ]);
        }
    }

    private function getDocumentTypesForSealType($sealTypeCode)
    {
        $types = [
            'endereco' => ['comprovante_residencia'],
            'documentos' => ['rg', 'cnh', 'ctps'],
            'veiculo' => ['crlv'],
            'irpf' => ['irpf'],
            'empresario' => ['cnpj', 'contrato_social'],
        ];

        return $types[$sealTypeCode] ?? [];
    }

    private function getDocumentFileName($docType)
    {
        $names = [
            'rg' => 'RG_Frente_Verso.pdf',
            'cnh' => 'CNH_Frente_Verso.pdf',
            'ctps' => 'CTPS_Paginas.pdf',
            'passaporte' => 'Passaporte.pdf',
            'comprovante_residencia' => 'Comprovante_Residencia.pdf',
            'crlv' => 'CRLV_Veiculo.pdf',
            'irpf' => 'IRPF_2024.pdf',
            'cnpj' => 'CNPJ_Certidao.pdf',
            'contrato_social' => 'Contrato_Social.pdf',
        ];

        return $names[$docType] ?? "Documento_{$docType}.pdf";
    }

    private function getDocumentNotes($docType)
    {
        $notes = [
            'rg' => 'Documento válido e legível.',
            'cnh' => 'CNH dentro do prazo de validade.',
            'ctps' => 'CTPS atualizada.',
            'comprovante_residencia' => 'Comprovante recente (últimos 3 meses).',
            'crlv' => 'CRLV válido e atualizado.',
            'irpf' => 'Declaração do exercício 2024.',
            'cnpj' => 'Certidão de situação cadastral.',
        ];

        return $notes[$docType] ?? null;
    }

    private function getValidationData($sealTypeCode)
    {
        $data = [
            'telefone' => [
                'phone' => '+55 11 98765-4321',
                'whatsapp' => '+55 11 98765-4321',
                'validated_at' => now()->subDays(rand(1, 30))->toIso8601String(),
                'validation_method' => 'sms_code',
            ],
            'endereco' => [
                'address' => 'Rua Exemplo, 123',
                'city' => 'São Paulo',
                'state' => 'SP',
                'zipcode' => '01234-567',
                'validated_documents' => ['comprovante_residencia'],
            ],
            'documentos' => [
                'documents' => ['rg', 'cnh', 'ctps'],
                'rg_number' => '12.345.678-9',
                'cnh_number' => '12345678901',
            ],
            'veiculo' => [
                'plate' => 'ABC-1234',
                'renavam' => '12345678901',
                'crlv_valid' => true,
            ],
            'irpf' => [
                'year' => 2024,
                'income' => rand(50000, 200000),
                'status' => 'validated',
            ],
            'empresario' => [
                'cnpj' => '12.345.678/0001-90',
                'company_name' => 'Empresa Exemplo LTDA',
                'status' => 'active',
            ],
        ];

        return $data[$sealTypeCode] ?? null;
    }
}
