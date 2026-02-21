<?php

namespace App\Http\Controllers;

use App\Events\SealRequestAtualizado;
use App\Models\Selo;
use App\Models\SealRequest;
use App\Models\SealDocument;
use App\Models\SealType;
use App\Models\UserSeal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;

class SeloController extends Controller
{
    /**
     * Normaliza documentos_evidencias para formato [{nome, obrigatorio}].
     * Aceita formato legado (array de strings) ou novo (array de objetos).
     */
    private static function normalizeDocumentosEvidencias($raw): array
    {
        if (!is_array($raw) || empty($raw)) {
            return [];
        }
        $result = [];
        foreach ($raw as $item) {
            if (is_string($item) && trim($item) !== '') {
                $result[] = ['nome' => trim($item), 'obrigatorio' => true];
            } elseif (is_array($item) && !empty($item['nome'])) {
                $result[] = [
                    'nome' => trim($item['nome']),
                    'obrigatorio' => (bool)($item['obrigatorio'] ?? true),
                ];
            }
        }
        return $result;
    }

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
            'codigo' => [
                'required',
                'string',
                'max:255',
                Rule::unique('selos', 'codigo')->whereNull('deleted_at'),
            ],
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'validade' => 'nullable|integer|min:0',
            'documentos_evidencias' => 'nullable|array',
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
            'descricao' => $request->descricao ?? $request->nome,
            'validade' => $request->validade !== null && $request->validade !== '' ? (int) $request->validade : 0,
        ];
        
        // Verificar se as colunas existem antes de adicionar
        $columns = Schema::getColumnListing('selos');
        
        if (in_array('nome', $columns) && $request->has('nome')) {
            $data['nome'] = $request->nome;
        }
        if (in_array('documentos_evidencias', $columns) && $request->has('documentos_evidencias')) {
            $raw = is_array($request->documentos_evidencias)
                ? $request->documentos_evidencias
                : json_decode($request->documentos_evidencias, true);
            $data['documentos_evidencias'] = self::normalizeDocumentosEvidencias($raw ?? []);
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
        if (in_array('disponivel', $columns)) {
            $data['disponivel'] = $request->has('disponivel') ? (int)$request->disponivel : 0;
        }
        
        try {
            $selo = Selo::create($data);
            
            return response()->json([
                'success' => true,
                'data' => $selo,
                'message' => 'Selo criado com sucesso'
            ], 201);
        } catch (QueryException $e) {
            if ($e->getCode() === '23000' && str_contains($e->getMessage(), 'Duplicate entry')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Já existe um selo com este código. Por favor, utilize um código único.',
                    'errors' => ['codigo' => ['O código informado já está em uso.']]
                ], 422);
            }
            throw $e;
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
            'codigo' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('selos', 'codigo')->ignore($id)->whereNull('deleted_at'),
            ],
            'nome' => 'sometimes|required|string|max:255',
            'descricao' => 'nullable|string',
            'validade' => 'nullable|integer|min:0',
            'documentos_evidencias' => 'nullable|array',
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
            $raw = is_array($request->documentos_evidencias)
                ? $request->documentos_evidencias
                : json_decode($request->documentos_evidencias, true);
            $data['documentos_evidencias'] = self::normalizeDocumentosEvidencias($raw ?? []);
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
        } catch (QueryException $e) {
            if (str_contains($e->getMessage(), 'Duplicate entry') && str_contains($e->getMessage(), 'codigo')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Já existe um selo com este código. Por favor, utilize um código único.',
                    'errors' => ['codigo' => ['O código informado já está em uso.']]
                ], 422);
            }
            throw $e;
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

        // Obter e normalizar documentos do selo (suporta formato antigo e novo)
        $docItems = self::normalizeDocumentosEvidencias(
            $selo->documentos_evidencias && is_array($selo->documentos_evidencias) ? $selo->documentos_evidencias : []
        );
        if (empty($docItems)) {
            $docItems = [['nome' => 'Frente', 'obrigatorio' => true], ['nome' => 'Trás', 'obrigatorio' => true]];
        }

        // Mapear docKey => { nome exibido, obrigatorio }
        $normalizedDocs = [];
        foreach ($docItems as $item) {
            $nome = $item['nome'];
            $normalized = strtolower($nome);
            if ($normalized === 'frente') {
                $key = 'frente';
            } elseif ($normalized === 'trás' || $normalized === 'tras') {
                $key = 'tras';
            } else {
                $key = strtolower(preg_replace('/\s+/', '_', $nome));
            }
            $normalizedDocs[$key] = ['nome' => $nome, 'obrigatorio' => $item['obrigatorio']];
        }

        // Regras: selo_id + apenas docs obrigatórios como required
        $validationRules = [
            'selo_id' => 'required|exists:selos,id',
        ];
        foreach ($normalizedDocs as $docKey => $meta) {
            $rule = $meta['obrigatorio'] ? 'required|file|mimes:jpeg,png,jpg,pdf|max:10240' : 'nullable|file|mimes:jpeg,png,jpg,pdf|max:10240';
            $validationRules[$docKey] = $rule;
        }

        $validator = Validator::make($request->all(), $validationRules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar documentos obrigatórios
        $missingFiles = [];
        foreach ($normalizedDocs as $docKey => $meta) {
            if ($meta['obrigatorio'] && !$request->hasFile($docKey)) {
                $missingFiles[] = $meta['nome'];
            }
        }

        if (count($missingFiles) > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Os seguintes documentos são obrigatórios e não foram enviados: ' . implode(', ', $missingFiles)
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

        // Impedir nova solicitação se já existe uma do mesmo tipo em andamento (pending ou under_review)
        $existeEmAndamento = SealRequest::where('user_id', $user->id)
            ->where('seal_type_id', $sealType->id)
            ->whereIn('status', ['pending', 'under_review'])
            ->exists();

        if ($existeEmAndamento) {
            return response()->json([
                'success' => false,
                'message' => 'Você já possui uma solicitação deste selo em análise. Aguarde a avaliação antes de solicitar novamente.',
            ], 422);
        }

        try {
            // Criar solicitação de selo
            $sealRequest = SealRequest::create([
                'user_id' => $user->id,
                'seal_type_id' => $sealType->id,
                'status' => 'pending',
            ]);

            // Upload e criação de documentos dinamicamente (obrigatórios e opcionais enviados)
            foreach ($normalizedDocs as $docKey => $meta) {
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

            SealRequestAtualizado::dispatch($sealRequest->fresh(), 'criada');

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

    /**
     * Confirma o pagamento de um selo via loja (App Store / Google Play).
     * Cria UserSeal para o selo aparecer na lista do usuário.
     * Se o selo não requer aprovação manual, aprova automaticamente.
     */
    public function confirmStorePayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'seal_request_id' => 'required|exists:seal_requests,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $sealRequest = SealRequest::with('sealType')->find($request->seal_request_id);

        if (!$sealRequest || $sealRequest->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Solicitação não encontrada'
            ], 404);
        }

        if ($sealRequest->status === 'approved') {
            return response()->json([
                'success' => true,
                'message' => 'Pagamento já confirmado. O selo já está ativo.'
            ]);
        }

        $sealType = $sealRequest->sealType;
        $requiresApproval = !$sealType || $sealType->requires_manual_approval;

        if ($requiresApproval) {
            // Selo requer aprovação manual: criar UserSeal pendente para aparecer na lista
            UserSeal::updateOrCreate(
                [
                    'user_id' => $sealRequest->user_id,
                    'seal_type_id' => $sealRequest->seal_type_id
                ],
                [
                    'status' => 'pending',
                    'approved_at' => null,
                    'approved_by' => null,
                    'expires_at' => null,
                ]
            );
            $sealRequest->update(['status' => 'under_review']);

            return response()->json([
                'success' => true,
                'message' => 'Pagamento confirmado. Seu selo está aguardando análise e aparecerá em "Pendentes".'
            ]);
        }

        // Selo não requer aprovação: aprovar automaticamente
        $expiresAt = $this->calcularExpiresAtSelo($sealRequest->sealType);
        UserSeal::updateOrCreate(
            [
                'user_id' => $sealRequest->user_id,
                'seal_type_id' => $sealRequest->seal_type_id
            ],
            [
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => $user->id,
                'expires_at' => $expiresAt,
            ]
        );
        $sealRequest->update([
            'status' => 'approved',
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pagamento confirmado. Seu selo foi ativado com sucesso!'
        ]);
    }

    /**
     * Calcula expires_at com base na validade (dias) do selo.
     * Validade vem do Selo (codigo = SealType.code).
     */
    private function calcularExpiresAtSelo(?SealType $sealType): ?\DateTimeInterface
    {
        if (!$sealType?->code) {
            return null;
        }
        $selo = Selo::where('codigo', $sealType->code)->first();
        if (!$selo || !$selo->validade || $selo->validade <= 0) {
            return null;
        }
        return now()->addDays((int) $selo->validade);
    }
}
