<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ServiceDeskUserController extends Controller
{
    public function index()
    {
        $users = User::with(['activeSubscription.plan'])
            ->where('role', 'user')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $user->status ?? 'ativo',
                    'active_plan' => $user->activeSubscription ? [
                        'id' => $user->activeSubscription->plan->id,
                        'name' => $user->activeSubscription->plan->name
                    ] : null,
                    'created_at' => $user->created_at
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function financial($userId)
    {
        $user = User::findOrFail($userId);
        
        $subscriptions = Subscription::where('user_id', $userId)
            ->with('plan')
            ->orderBy('created_at', 'desc')
            ->get();

        $totalPaid = $subscriptions->sum('amount');
        $totalPayments = $subscriptions->count();

        $payments = $subscriptions->map(function ($subscription) {
            return [
                'id' => $subscription->id,
                'plan_name' => $subscription->plan->name,
                'amount' => $subscription->amount,
                'status' => $subscription->status,
                'payment_method' => $subscription->payment_method,
                'created_at' => $subscription->created_at
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'totalPaid' => $totalPaid,
                'totalPayments' => $totalPayments,
                'payments' => $payments
            ]
        ]);
    }

    public function changePassword(Request $request, $userId)
    {
        $request->validate([
            'password' => 'required|min:6'
        ]);

        $user = User::findOrFail($userId);
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Senha alterada com sucesso'
        ]);
    }

    public function block(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $user->status = $request->blocked ? 'bloqueado' : 'ativo';
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Status do usuário atualizado com sucesso'
        ]);
    }
}
