<?php

namespace App\Http\Controllers;

use App\Models\Selo;
use App\Models\SealRequest;
use App\Models\SealDocument;
use App\Models\SealType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class SeloController extends Controller
{
    public function index()
    {
        // Verificar quais colunas existem na tabela
        $columns = Schema::getColumnListing('selos');
        $hasAtivoColumn = in_array('ativo', $columns);
        $hasDisponivelColumn = in_array('disponivel', $columns);
        
        // Retornar selos ativos, ou todos se nenhuma coluna de status existir
        $query = Selo::query();
        
        if ($hasAtivoColumn) {
            // Se a coluna 'ativo' existe, usar ela
            $query->where(function($q) {
                $q->where('ativo', true)
                  ->orWhereNull('ativo');
            });
        } elseif ($hasDisponivelColumn) {
            // Se não tem 'ativo' mas tem 'disponivel', usar 'disponivel'
            $query->where(function($q) {
                $q->where('disponivel', 1)
                  ->orWhereNull('disponivel');
            });
        }
        // Se nenhuma das colunas existir, retorna todos os selos
        
        $selos = $query->orderBy('codigo')->get();

        // Garantir que custo_obtencao seja retornado como número
        $selos->transform(function ($selo) {
            if (isset($selo->custo_obtencao)) {
                $selo->custo_obtencao = (float)$selo->custo_obtencao;
            }
            return $selo;
        });

        return response()->json([
            'success' => true,
            'data' => $selos
        ]);
    }

    public function show($id)
    {
        $selo = Selo::find($id);
        
        if (!$selo) {
            return response()->json([
                'success' => false,
                'message' => 'Selo não encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $selo
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'codigo' => 'required|string|max:255|unique:selos,codigo',
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'validade' => 'nullable|integer|min:0',
            'documentos_evidencias' => 'nullable|array',
            'documentos_evidencias.*' => 'string',
            'descricao_como_obter' => 'nullable|string',
            'custo_obtencao' => 'nullable|numeric|min:0',
            'ativo' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Preparar dados - apenas campos que existem na tabela
        $data = [
            'codigo' => $request->codigo,
            'descricao' => $request->descricao ?? $request->nome, // Usar nome como descricao se descricao não existir
            'validade' => $request->validade,
        ];
        
        // Verificar se as colunas existem antes de adicionar
        $columns = Schema::getColumnListing('selos');
        
        if (in_array('nome', $columns) && $request->has('nome')) {
            $data['nome'] = $request->nome;
        }
        if (in_array('documentos_evidencias', $columns) && $request->has('documentos_evidencias')) {
            // O modelo já tem cast para array, então podemos passar o array diretamente
            $data['documentos_evidencias'] = is_array($request->documentos_evidencias) 
                ? $request->documentos_evidencias 
                : json_decode($request->documentos_evidencias, true);
        }
        if (in_array('descricao_como_obter', $columns) && $request->has('descricao_como_obter')) {
            $data['descricao_como_obter'] = $request->descricao_como_obter;
        }
        if (in_array('custo_obtencao', $columns)) {
            // Sempre definir custo_obtencao, mesmo se não fornecido (default 0)
            $data['custo_obtencao'] = $request->has('custo_obtencao') && $request->custo_obtencao !== null && $request->custo_obtencao !== ''
                ? (float)$request->custo_obtencao 
                : 0;
        }
        if (in_array('ativo', $columns)) {
            $data['ativo'] = $request->has('ativo') ? (bool)$request->ativo : true;
        }
        
        try {
            $selo = Selo::create($data);
            
            return response()->json([
                'success' => true,
                'data' => $selo,
                'message' => 'Selo criado com sucesso'
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Erro ao criar selo: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'data' => $data
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar selo. Verifique os dados e tente novamente.',
                'error' => config('app.debug') ? $e->getMessage() : 'Erro interno do servidor',
                'detail' => config('app.debug') ? [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ] : null
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $selo = Selo::find($id);
        
        if (!$selo) {
            return response()->json([
                'success' => false,
                'message' => 'Selo não encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'codigo' => 'sometimes|required|string|max:255|unique:selos,codigo,' . $id,
            'nome' => 'sometimes|required|string|max:255',
            'descricao' => 'nullable|string',
            'validade' => 'nullable|integer|min:0',
            'documentos_evidencias' => 'nullable|array',
            'documentos_evidencias.*' => 'string',
            'descricao_como_obter' => 'nullable|string',
            'custo_obtencao' => 'nullable|numeric|min:0',
            'ativo' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Preparar dados - apenas campos que existem na tabela
        $data = [];
        
        // Verificar se as colunas existem antes de adicionar
        $columns = Schema::getColumnListing('selos');
        
        if ($request->has('codigo')) {
            $data['codigo'] = $request->codigo;
        }
        if ($request->has('descricao')) {
            $data['descricao'] = $request->descricao;
        }
        if ($request->has('validade')) {
            $data['validade'] = $request->validade;
        }
        if (in_array('nome', $columns) && $request->has('nome')) {
            $data['nome'] = $request->nome;
        }
        if (in_array('documentos_evidencias', $columns) && $request->has('documentos_evidencias')) {
            // O modelo já tem cast para array, então podemos passar o array diretamente
            $data['documentos_evidencias'] = is_array($request->documentos_evidencias) 
                ? $request->documentos_evidencias 
                : json_decode($request->documentos_evidencias, true);
        }
        if (in_array('descricao_como_obter', $columns) && $request->has('descricao_como_obter')) {
            $data['descricao_como_obter'] = $request->descricao_como_obter;
        }
        if (in_array('custo_obtencao', $columns)) {
            // Sempre definir custo_obtencao, mesmo se não fornecido (default 0)
            $data['custo_obtencao'] = $request->has('custo_obtencao') && $request->custo_obtencao !== null && $request->custo_obtencao !== ''
                ? (float)$request->custo_obtencao 
                : 0;
        }
        if (in_array('ativo', $columns) && $request->has('ativo')) {
            $data['ativo'] = (bool)$request->ativo;
        }
        
        try {
            $selo->update($data);
            
            return response()->json([
                'success' => true,
                'data' => $selo,
                'message' => 'Selo atualizado com sucesso'
            ]);
        } catch (\Exception $e) {
            \Log::error('Erro ao atualizar selo: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'data' => $data,
                'selo_id' => $id,
                'request' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar selo',
                'error' => config('app.debug') ? $e->getMessage() : 'Erro interno do servidor',
                'detail' => config('app.debug') ? [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ] : null
            ], 500);
        }
    }

    public function destroy($id)
    {
        $selo = Selo::find($id);
        
        if (!$selo) {
            return response()->json([
                'success' => false,
                'message' => 'Selo não encontrado'
            ], 404);
        }

        $selo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Selo excluído com sucesso'
        ]);
    }

    public function solicitar(Request $request)
    {
        $user = Auth::user();
        $selo = Selo::find($request->selo_id);

        if (!$selo || !$selo->ativo) {
            return response()->json([
                'success' => false,
                'message' => 'Selo não encontrado ou indisponível'
            ], 404);
        }

        // Obter documentos necessários do selo
        $requiredDocuments = $selo->documentos_evidencias && is_array($selo->documentos_evidencias) && count($selo->documentos_evidencias) > 0
            ? $selo->documentos_evidencias
            : ['Frente', 'Trás']; // Fallback para compatibilidade

        // Normalizar nomes dos documentos para validação (frente, tras, etc)
        $normalizedDocs = [];
        foreach ($requiredDocuments as $doc) {
            $normalized = strtolower($doc);
            if ($normalized === 'frente') {
                $normalizedDocs['frente'] = $doc;
            } elseif ($normalized === 'trás' || $normalized === 'tras') {
                $normalizedDocs['tras'] = $doc;
            } else {
                // Para outros documentos, usar o nome normalizado (sem espaços, com underscore)
                $key = strtolower(preg_replace('/\s+/', '_', $doc));
                $normalizedDocs[$key] = $doc;
            }
        }

        // Criar regras de validação dinâmicas
        $validationRules = [
            'selo_id' => 'required|exists:selos,id',
        ];

        foreach (array_keys($normalizedDocs) as $docKey) {
            $validationRules[$docKey] = 'required|file|mimes:jpeg,png,jpg,pdf|max:10240';
        }

        $validator = Validator::make($request->all(), $validationRules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar se todos os arquivos foram enviados corretamente
        $missingFiles = [];
        foreach (array_keys($normalizedDocs) as $docKey) {
            if (!$request->hasFile($docKey)) {
                $missingFiles[] = $normalizedDocs[$docKey];
            }
        }

        if (count($missingFiles) > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Os seguintes documentos não foram enviados: ' . implode(', ', $missingFiles)
            ], 422);
        }

        // Buscar ou criar um seal_type correspondente ao selo
        // Usar o código do selo para encontrar o seal_type correspondente
        $sealType = SealType::where('code', $selo->codigo)->first();
        
        // Se não encontrar, criar um seal_type baseado no selo
        if (!$sealType) {
            $sealType = SealType::create([
                'code' => $selo->codigo ?? 'selo_' . $selo->id,
                'name' => $selo->nome ?? $selo->descricao ?? 'Selo ' . $selo->id,
                'description' => $selo->descricao ?? null,
                'requires_manual_approval' => true,
                'is_active' => true,
            ]);
        }

        try {
            // Criar solicitação de selo
            $sealRequest = SealRequest::create([
                'user_id' => $user->id,
                'seal_type_id' => $sealType->id,
                'status' => 'pending',
            ]);

            // Upload e criação de documentos dinamicamente
            foreach ($normalizedDocs as $docKey => $docName) {
                if ($request->hasFile($docKey)) {
                    $file = $request->file($docKey);
                    $filePath = $file->store('seal_documents', 'public');

                    SealDocument::create([
                        'seal_request_id' => $sealRequest->id,
                        'document_type' => $docKey, // Usar a chave normalizada (frente, tras, ou nome normalizado)
                        'file_path' => $filePath,
                        'file_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $sealRequest->id,
                    'request_id' => $sealRequest->id,
                ],
                'message' => 'Solicitação criada com sucesso'
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Erro ao criar solicitação de selo:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user->id,
                'selo_id' => $request->selo_id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao processar solicitação de selo',
                'error' => config('app.debug') ? $e->getMessage() : 'Erro interno do servidor'
            ], 500);
        }
    }

    public function pagamento(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'seal_request_id' => 'required|exists:seal_requests,id',
            'payment_method' => 'required|in:pix,credit_card',
            'amount' => 'required|numeric|min:0',
            'card_data' => 'required_if:payment_method,credit_card|array',
            'card_data.cardNumber' => 'required_if:payment_method,credit_card|string',
            'card_data.cardHolder' => 'required_if:payment_method,credit_card|string',
            'card_data.expiryDate' => 'required_if:payment_method,credit_card|string',
            'card_data.cvv' => 'required_if:payment_method,credit_card|string',
            'card_data.installments' => 'required_if:payment_method,credit_card|integer|min:1|max:12',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $sealRequest = SealRequest::find($request->seal_request_id);

        if (!$sealRequest || $sealRequest->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Solicitação não encontrada'
            ], 404);
        }

        // Atualizar status da solicitação para "under_review" (aguardando análise)
        $sealRequest->update(['status' => 'under_review']);
        
        // Aqui você integraria com o gateway de pagamento (Mercado Pago, etc)
        // Por enquanto, apenas simular o pagamento
        if ($request->payment_method === 'pix') {
            // Gerar dados PIX (QR Code, código, etc)
            // Em produção, isso viria de um gateway de pagamento real
            $pixCode = '00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540' . 
                       str_pad((int)($request->amount * 100), 2, '0', STR_PAD_LEFT) . 
                       '5802BR5925TrueConnect Sistema6009SAO PAULO62070503***6304';
            
            return response()->json([
                'success' => true,
                'data' => [
                    'pix_data' => [
                        'qr_code' => $pixCode,
                        'code' => '12345678901234567890123456789012345678901234567890',
                        'expires_at' => now()->addHours(24)->toIso8601String(),
                    ],
                ],
                'message' => 'Pagamento PIX gerado com sucesso. Seu selo está aguardando análise.'
            ]);
        } else {
            // Processar pagamento com cartão
            // Aqui você integraria com o gateway de pagamento (Mercado Pago, Stripe, etc)
            // Por enquanto, apenas simular o pagamento
            
            // Validar dados do cartão (em produção, isso seria feito pelo gateway)
            $cardData = $request->card_data;
            
            // Simular processamento do pagamento
            // Em produção, você faria a chamada para o gateway aqui
            return response()->json([
                'success' => true,
                'data' => [
                    'payment_id' => 'PAY_' . time(),
                    'status' => 'approved',
                ],
                'message' => 'Pagamento processado com sucesso. Seu selo está aguardando análise.'
            ]);
        }
    }
}
