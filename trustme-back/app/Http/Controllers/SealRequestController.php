<?php

namespace App\Http\Controllers;

use App\Models\SealRequest;
use App\Models\UserSeal;
use App\Models\SealType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SealRequestController extends Controller
{
    public function index()
    {
        $requests = SealRequest::with(['user', 'sealType'])
            ->withCount('documents')
            ->orderBy('created_at', 'desc')
            ->get();

        // Agrupar por usuário
        $groupedByUser = $requests->groupBy('user_id')->map(function ($userRequests, $userId) {
            $firstRequest = $userRequests->first();
            return [
                'user_id' => $userId,
                'user_name' => $firstRequest->user->name,
                'user_email' => $firstRequest->user->email,
                'requests' => $userRequests->map(function ($request) {
                    return [
                        'id' => $request->id,
                        'seal_type_id' => $request->seal_type_id,
                        'seal_type_name' => $request->sealType->name,
                        'seal_type_code' => $request->sealType->code,
                        'seal_type_requires_manual_approval' => $request->sealType->requires_manual_approval,
                        'status' => $request->status,
                        'notes' => $request->notes,
                        'documents_count' => $request->documents_count,
                        'created_at' => $request->created_at,
                        'reviewed_at' => $request->reviewed_at,
                        'rejection_reason' => $request->rejection_reason
                    ];
                })->values()
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $groupedByUser
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
                'expires_at' => null // Pode ser configurado baseado no tipo de selo
            ]
        );

        // Atualizar status da solicitação
        $sealRequest->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now()
        ]);

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

        // Atualizar user_seal se existir
        UserSeal::where('user_id', $sealRequest->user_id)
            ->where('seal_type_id', $sealRequest->seal_type_id)
            ->update([
                'status' => 'rejected',
                'rejection_reason' => $request->reason
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Solicitação rejeitada com sucesso'
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

        // Atualizar status da solicitação para 'revoked' ou 'pending'
        $sealRequest->update([
            'status' => 'pending',
            'reviewed_by' => null,
            'reviewed_at' => null,
            'rejection_reason' => null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Aprovação revogada com sucesso. O selo foi removido do usuário.'
        ]);
    }
}
