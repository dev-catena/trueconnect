<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $subscriptions = Subscription::with(['user', 'plan'])
            ->when($request->user_id, function($query, $userId) {
                return $query->where('user_id', $userId);
            })
            ->when($request->status, function($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $subscriptions
        ]);
    }

    public function show($id)
    {
        $subscription = Subscription::with(['user', 'plan'])->find($id);
        
        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Assinatura não encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $subscription
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|in:monthly,semiannual,annual',
            'payment_method' => 'nullable|string',
            'payment_id' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $plan = Plan::find($request->plan_id);
        $amount = $plan->getPriceForCycle($request->billing_cycle);
        
        $startDate = Carbon::now();
        $endDate = match($request->billing_cycle) {
            'monthly' => $startDate->copy()->addMonth(),
            'semiannual' => $startDate->copy()->addMonths(6),
            'annual' => $startDate->copy()->addYear(),
        };

        $subscription = Subscription::create([
            'user_id' => $request->user_id,
            'plan_id' => $request->plan_id,
            'billing_cycle' => $request->billing_cycle,
            'amount' => $amount,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'payment_method' => $request->payment_method,
            'payment_id' => $request->payment_id,
            'payment_data' => $request->payment_data,
        ]);

        return response()->json([
            'success' => true,
            'data' => $subscription->load(['user', 'plan']),
            'message' => 'Assinatura criada com sucesso'
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $subscription = Subscription::find($id);
        
        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Assinatura não encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'in:active,inactive,cancelled,expired',
            'payment_method' => 'nullable|string',
            'payment_id' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $subscription->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $subscription->load(['user', 'plan']),
            'message' => 'Assinatura atualizada com sucesso'
        ]);
    }

    public function cancel($id)
    {
        $subscription = Subscription::find($id);
        
        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Assinatura não encontrada'
            ], 404);
        }

        $subscription->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Assinatura cancelada com sucesso'
        ]);
    }

    public function userSubscriptions(Request $request)
    {
        $subscriptions = Subscription::with('plan')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $subscriptions
        ]);
    }

    public function cancelUserSubscription(Request $request, $id)
    {
        $subscription = Subscription::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();
        
        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Assinatura não encontrada ou não pertence ao usuário'
            ], 404);
        }

        if ($subscription->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Esta assinatura já foi cancelada'
            ], 400);
        }

        $subscription->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Assinatura cancelada com sucesso'
        ]);
    }

    public function comparePlanChange(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'new_plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|in:monthly,semiannual,annual',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        // Buscar assinatura ativa atual
        $currentSubscription = Subscription::with('plan')
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->where('end_date', '>=', Carbon::today())
            ->first();

        $newPlan = Plan::find($request->new_plan_id);
        $newAmount = $newPlan->getPriceForCycle($request->billing_cycle);

        $response = [
            'success' => true,
            'data' => [
                'new_plan' => $newPlan,
                'new_amount' => $newAmount,
                'billing_cycle' => $request->billing_cycle,
                'requires_payment' => true, // Por padrão, sempre requer pagamento para mudança
                'current_subscription' => $currentSubscription
            ]
        ];

        if ($currentSubscription) {
            $currentAmount = $currentSubscription->amount;
            
            // Comparar preços
            if ($newAmount > $currentAmount) {
                $response['data']['requires_payment'] = true;
                $response['data']['price_difference'] = $newAmount - $currentAmount;
                $response['data']['change_type'] = 'upgrade';
            } elseif ($newAmount < $currentAmount) {
                $response['data']['requires_payment'] = false;
                $response['data']['price_difference'] = $currentAmount - $newAmount;
                $response['data']['change_type'] = 'downgrade';
            } else {
                $response['data']['requires_payment'] = false;
                $response['data']['price_difference'] = 0;
                $response['data']['change_type'] = 'same_price';
            }
        } else {
            $response['data']['change_type'] = 'new_subscription';
        }

        return response()->json($response);
    }

    public function changePlan(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'new_plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|in:monthly,semiannual,annual',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        // Buscar assinatura ativa atual
        $currentSubscription = Subscription::with('plan')
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->where('end_date', '>=', Carbon::today())
            ->first();

        if (!$currentSubscription) {
            return response()->json([
                'success' => false,
                'message' => 'Nenhuma assinatura ativa encontrada'
            ], 404);
        }

        $newPlan = Plan::find($request->new_plan_id);
        $newAmount = $newPlan->getPriceForCycle($request->billing_cycle);
        $currentAmount = $currentSubscription->amount;

        // Se o novo plano é mais caro, não permitir mudança direta
        if ($newAmount > $currentAmount) {
            return response()->json([
                'success' => false,
                'message' => 'Para upgrades, é necessário realizar um novo pagamento',
                'requires_payment' => true
            ], 400);
        }

        // Para downgrades ou mesmo preço, atualizar a assinatura
        $endDate = match($request->billing_cycle) {
            'monthly' => Carbon::now()->addMonth(),
            'semiannual' => Carbon::now()->addMonths(6),
            'annual' => Carbon::now()->addYear(),
        };

        $currentSubscription->update([
            'plan_id' => $request->new_plan_id,
            'billing_cycle' => $request->billing_cycle,
            'amount' => $newAmount,
            'end_date' => $endDate,
        ]);

        return response()->json([
            'success' => true,
            'data' => $currentSubscription->load(['user', 'plan']),
            'message' => 'Plano alterado com sucesso'
        ]);
    }
}
