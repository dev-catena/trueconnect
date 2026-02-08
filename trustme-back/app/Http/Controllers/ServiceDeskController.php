<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SealRequest;
use App\Models\UserSeal;
use App\Models\Subscription;
use Illuminate\Http\Request;

class ServiceDeskController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'totalUsers' => User::withoutTrashed()->where('role', 'user')->count(), // Exclui usuários deletados
            'pendingRequests' => SealRequest::where('status', 'pending')->count(),
            'approvedSeals' => UserSeal::where('status', 'approved')->count(),
            'totalRevenue' => Subscription::where('status', 'active')->sum('amount')
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function recentRequests()
    {
        $requests = SealRequest::with(['user', 'sealType'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'user_name' => $request->user->name,
                    'user_email' => $request->user->email,
                    'seal_type_name' => $request->sealType->name,
                    'status' => $request->status,
                    'created_at' => $request->created_at
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $requests
        ]);
    }
}
