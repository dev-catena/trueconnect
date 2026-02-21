<?php

namespace App\Http\Controllers;

use App\Events\SealRequestAtualizado;
use App\Models\SealRequest;
use App\Models\UserSeal;
use App\Models\SealType;
use App\Models\UsuarioSelo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SealRequestController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min((int) ($request->get('per_page', 15) ?: 15), 50);
        $perPage = max($perPage, 5);
        $status = $request->get('status'); // 'pending', 'approved', 'rejected' ou vazio para todos

        $query = SealRequest::with(['user', 'sealType'])
            ->withCount('documents')
            ->orderBy('created_at', 'desc');

        if ($status === 'pending' || $status === 'para_aprovar') {
            $query->whereIn('status', ['pending', 'under_review']);
        } elseif ($status === 'approved' || $status === 'aprovados') {
            $query->where('status', 'approved');
        } elseif ($status === 'rejected' || $status === 'rejeitados') {
            $query->where('status', 'rejected');
        }

        $search = trim((string) $request->get('search', ''));
        if ($search !== '') {
            $searchPattern = '%' . addcslashes($search, '%_\\') . '%';
            $query->whereHas('user', function ($q) use ($searchPattern) {
                $q->where('name', 'like', $searchPattern)
                    ->orWhere('nome_completo', 'like', $searchPattern)
                    ->orWhere('email', 'like', $searchPattern);
            });
        }

        $paginator = $query->paginate($perPage);

        // Formato agrupado por usuário (compatível com frontend existente)
        $groupedByUser = $paginator->getCollection()->groupBy('user_id')->map(function ($userRequests, $userId) {
            $firstRequest = $userRequests->first();
            return [
                'user_id' => $userId,
                'user_name' => $firstRequest->user->name,
                'user_email' => $firstRequest->user->email,
                'requests' => $userRequests->map(function ($req) {
                    return [
                        'id' => $req->id,
                        'seal_type_id' => $req->seal_type_id,
                        'seal_type_name' => $req->sealType->name,
                        'seal_type_code' => $req->sealType->code,
                        'seal_type_requires_manual_approval' => $req->sealType->requires_manual_approval,
                        'status' => $req->status,
                        'notes' => $req->notes,
                        'documents_count' => $req->documents_count,
                        'created_at' => $req->created_at,
                        'reviewed_at' => $req->reviewed_at,
                        'rejection_reason' => $req->rejection_reason,
                        'analyst_feedback' => $req->analyst_feedback,
                        'analyst_feedback_at' => $req->analyst_feedback_at,
                    ];
                })->values()
            ];
        })->values();

        $meta = [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
        ];

        if ($request->boolean('include_counts')) {
            $meta['count_pending'] = SealRequest::whereIn('status', ['pending', 'under_review'])->count();
            $meta['count_approved'] = SealRequest::where('status', 'approved')->count();
            $meta['count_rejected'] = SealRequest::where('status', 'rejected')->count();
        }

        return response()->json([
            'success' => true,
            'data' => $groupedByUser,
            'meta' => $meta
        ]);
    }

    /**
     * Serve o arquivo de um documento de solicitação de selo (para admin/servicedesk)
     */
    public function serveDocument($requestId, $documentId)
    {
        $sealRequest = SealRequest::with('documents')->findOrFail($requestId);
        $document = $sealRequest->documents->firstWhere('id', (int) $documentId);
        
        if (!$document || !$document->file_path) {
            abort(404, 'Documento não encontrado');
        }

        $path = storage_path('app/public/' . $document->file_path);
        if (!file_exists($path)) {
            abort(404, 'Arquivo não encontrado');
        }

        return response()->file($path, [
            'Content-Type' => $document->mime_type ?? 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . basename($document->file_name ?? $document->file_path) . '"',
        ]);
    }

    public function show($id)
    {
        $request = SealRequest::with(['user', 'sealType', 'documents'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $request->id,
                'user' => [
                    'id' => $request->user->id,
                    'name' => $request->user->name,
                    'email' => $request->user->email
                ],
                'seal_type' => [
                    'id' => $request->sealType->id,
                    'name' => $request->sealType->name,
                    'code' => $request->sealType->code,
                    'requires_manual_approval' => $request->sealType->requires_manual_approval
                ],
                'status' => $request->status,
                'notes' => $request->notes,
                'analyst_feedback' => $request->analyst_feedback,
                'analyst_feedback_at' => $request->analyst_feedback_at,
                'user_response' => $request->user_response,
                'user_response_at' => $request->user_response_at?->toIso8601String(),
                'documents' => $request->documents->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'document_type' => $doc->document_type,
                        'file_name' => $doc->file_name,
                        'file_path' => $doc->file_path,
                        'file_url' => Storage::url($doc->file_path),
                        'file_size' => $doc->file_size,
                        'mime_type' => $doc->mime_type,
                        'notes' => $doc->notes
                    ];
                }),
                'validation_data' => null
            ]
        ]);
    }

    public function approve(Request $request, $id)
    {
        $sealRequest = SealRequest::with(['sealType'])->findOrFail($id);
        $expiresAt = $this->calcularExpiresAt($sealRequest->sealType);

        // Criar ou atualizar user_seal
        $userSeal = UserSeal::updateOrCreate(
            [
                'user_id' => $sealRequest->user_id,
                'seal_type_id' => $sealRequest->seal_type_id
            ],
            [
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => $request->user()->id,
                'expires_at' => $expiresAt
            ]
        );

        // Atualizar status da solicitação
        $sealRequest->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now()
        ]);

        SealRequestAtualizado::dispatch($sealRequest->fresh(), 'aprovada');

        // Remover UsuarioSelo legado para evitar duplicata (ativo via UserSeal + pendente via UsuarioSelo)
        $this->limparUsuarioSeloLegado($sealRequest->user_id, $sealRequest->seal_type_id);

        return response()->json([
            'success' => true,
            'message' => 'Solicitação aprovada com sucesso'
        ]);
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string'
        ]);

        $sealRequest = SealRequest::findOrFail($id);
        
        $sealRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now()
        ]);

        SealRequestAtualizado::dispatch($sealRequest->fresh(), 'rejeitada');

        // Atualizar user_seal se existir
        UserSeal::where('user_id', $sealRequest->user_id)
            ->where('seal_type_id', $sealRequest->seal_type_id)
            ->update([
                'status' => 'rejected',
                'rejection_reason' => $request->reason
            ]);

        // Limpar UsuarioSelo legado (evita "selo pendente fantasma" no app)
        $this->limparUsuarioSeloLegado($sealRequest->user_id, $sealRequest->seal_type_id);

        return response()->json([
            'success' => true,
            'message' => 'Solicitação rejeitada com sucesso'
        ]);
    }

    /**
     * Pedir mais informações ao solicitante. O selo continua pendente; o solicitante pode complementar a documentação.
     */
    public function requestMoreInfo(Request $request, $id)
    {
        $request->validate([
            'feedback' => 'required|string|max:2000',
        ]);

        $sealRequest = SealRequest::findOrFail($id);

        if (!in_array($sealRequest->status, ['pending', 'under_review'])) {
            return response()->json([
                'success' => false,
                'message' => 'Apenas solicitações pendentes ou em revisão podem ter informações solicitadas.',
            ], 400);
        }

        $sealRequest->update([
            'analyst_feedback' => $request->feedback,
            'analyst_feedback_at' => now(),
            'status' => 'under_review', // Garantir que permaneça em análise
        ]);

        SealRequestAtualizado::dispatch($sealRequest->fresh(), 'informacoes_solicitadas');

        return response()->json([
            'success' => true,
            'message' => 'Solicitação de informações enviada. O solicitante será notificado e poderá complementar a documentação.',
        ]);
    }

    public function revoke(Request $request, $id)
    {
        $sealRequest = SealRequest::with(['sealType'])->findOrFail($id);
        
        if ($sealRequest->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Apenas solicitações aprovadas podem ser revogadas'
            ], 400);
        }

        // Remover ou atualizar user_seal
        UserSeal::where('user_id', $sealRequest->user_id)
            ->where('seal_type_id', $sealRequest->seal_type_id)
            ->where('status', 'approved')
            ->delete();

        // Limpar UsuarioSelo legado para consistência
        $this->limparUsuarioSeloLegado($sealRequest->user_id, $sealRequest->seal_type_id);

        // Atualizar status da solicitação para 'revoked' ou 'pending'
        $sealRequest->update([
            'status' => 'pending',
            'reviewed_by' => null,
            'reviewed_at' => null,
            'rejection_reason' => null
        ]);

        SealRequestAtualizado::dispatch($sealRequest->fresh(), 'revogada');

        return response()->json([
            'success' => true,
            'message' => 'Aprovação revogada com sucesso. O selo foi removido do usuário.'
        ]);
    }

    /**
     * Reverter rejeição: retorna solicitação rejeitada para status "pendente".
     */
    public function revertRejection(Request $request, $id)
    {
        $sealRequest = SealRequest::findOrFail($id);

        if ($sealRequest->status !== 'rejected') {
            return response()->json([
                'success' => false,
                'message' => 'Apenas solicitações rejeitadas podem ter a rejeição revertida'
            ], 400);
        }

        // Remover UserSeal rejeitado se existir
        UserSeal::where('user_id', $sealRequest->user_id)
            ->where('seal_type_id', $sealRequest->seal_type_id)
            ->where('status', 'rejected')
            ->delete();

        $sealRequest->update([
            'status' => 'pending',
            'reviewed_by' => null,
            'reviewed_at' => null,
            'rejection_reason' => null
        ]);

        SealRequestAtualizado::dispatch($sealRequest->fresh(), 'rejeição_revertida');

        return response()->json([
            'success' => true,
            'message' => 'Rejeição revertida com sucesso. A solicitação voltou para análise.'
        ]);
    }

    /**
     * Excluir solicitação rejeitada permanentemente.
     */
    public function destroy(Request $request, $id)
    {
        $sealRequest = SealRequest::findOrFail($id);

        if ($sealRequest->status !== 'rejected') {
            return response()->json([
                'success' => false,
                'message' => 'Apenas solicitações rejeitadas podem ser excluídas'
            ], 400);
        }

        // Remover UserSeal rejeitado se existir
        UserSeal::where('user_id', $sealRequest->user_id)
            ->where('seal_type_id', $sealRequest->seal_type_id)
            ->where('status', 'rejected')
            ->delete();

        // Limpar UsuarioSelo legado (evita "selo pendente fantasma" no app)
        $this->limparUsuarioSeloLegado($sealRequest->user_id, $sealRequest->seal_type_id);

        SealRequestAtualizado::dispatch($sealRequest->fresh(), 'excluída');
        $sealRequest->delete(); // CASCADE remove documentos automaticamente

        return response()->json([
            'success' => true,
            'message' => 'Solicitação excluída com sucesso'
        ]);
    }

    /**
     * Remove UsuarioSelo legado quando um selo é rejeitado/excluído.
     * Evita "selo pendente fantasma" no app (usuário teve selos excluídos mas ainda vê pendente).
     */
    private function limparUsuarioSeloLegado(int $userId, int $sealTypeId): void
    {
        $sealType = SealType::find($sealTypeId);
        if (!$sealType?->code) {
            return;
        }
        $selo = \App\Models\Selo::where('codigo', $sealType->code)->first();
        if (!$selo) {
            return;
        }
        UsuarioSelo::where('usuario_id', $userId)
            ->where('selo_id', $selo->id)
            ->delete(); // SoftDelete - some da lista de pendentes
    }

    /**
     * Calcula expires_at com base na validade (dias) do selo.
     * Validade vem do Selo (codigo = SealType.code). Se validade for null/0, retorna null (sem expiração).
     */
    private function calcularExpiresAt(?SealType $sealType): ?\DateTimeInterface
    {
        if (!$sealType?->code) {
            return null;
        }
        $selo = \App\Models\Selo::where('codigo', $sealType->code)->first();
        if (!$selo || !$selo->validade || $selo->validade <= 0) {
            return null;
        }
        return now()->addDays((int) $selo->validade);
    }
}
