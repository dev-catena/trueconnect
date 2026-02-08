<?php

namespace App\Http\Controllers;

use App\Models\UserSeal;
use App\Models\SealType;
use Illuminate\Http\Request;

class ServiceDeskSealController extends Controller
{
    public function index()
    {
        $seals = UserSeal::with(['user', 'sealType', 'approvedBy'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($seal) {
                return [
                    'id' => $seal->id,
                    'user_id' => $seal->user_id,
                    'user_name' => $seal->user->name,
                    'user_email' => $seal->user->email,
                    'seal_type_id' => $seal->seal_type_id,
                    'seal_type_name' => $seal->sealType->name,
                    'status' => $seal->status,
                    'approved_at' => $seal->approved_at,
                    'approved_by_name' => $seal->approvedBy ? $seal->approvedBy->name : null,
                    'rejection_reason' => $seal->rejection_reason,
                    'expires_at' => $seal->expires_at,
                    'validation_data' => $seal->validation_data
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $seals
        ]);
    }

    public function sealTypes()
    {
        $types = SealType::where('is_active', true)->get();

        return response()->json([
            'success' => true,
            'data' => $types
        ]);
    }
}
