<?php

namespace App\Http\Controllers;

use App\Models\AdditionalPurchase;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AdditionalPurchaseController extends Controller
{
    /**
     * Retorna os preços e configurações para compras adicionais
     */
    public function getPrices()
    {
        $prices = \App\Models\AdditionalPurchasePrice::getActivePrices();

        // Garantir que contratos e conexões existam com valores padrão
        if (!isset($prices['contracts'])) {
            $prices['contracts'] = [
                'unit_price' => 5.00,
                'min_quantity' => 1,
                'max_quantity' => 100,
            ];
        }
        if (!isset($prices['connections'])) {
            $prices['connections'] = [
                'unit_price' => 3.00,
                'min_quantity' => 1,
                'max_quantity' => 100,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $prices
        ]);
    }

    /**
     * Lista as compras adicionais do usuário
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não autenticado'
            ], 401);
        }

        $purchases = AdditionalPurchase::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $purchases
        ]);
    }

    /**
     * Cria uma nova compra adicional (aguardando pagamento)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:contracts,connections',
            'quantity' => 'required|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não autenticado'
            ], 401);
        }

        // Verificar se o usuário tem plano ativo
        $activeSubscription = $user->activeSubscription;
        if (!$activeSubscription) {
            return response()->json([
                'success' => false,
                'message' => 'Você precisa ter um plano ativo para comprar recursos adicionais'
            ], 400);
        }

        // Buscar preço do banco de dados
        $priceConfig = \App\Models\AdditionalPurchasePrice::getActivePrice($request->type);
        if (!$priceConfig) {
            return response()->json([
                'success' => false,
                'message' => 'Ainda não há um valor ativo configurado para este tipo de compra. ' .
                    'Verifique se os preços (contratos/conexões) estão ativos na área administrativa.',
            ], 400);
        }

        // Validar quantidade
        if ($request->quantity < $priceConfig->min_quantity || $request->quantity > $priceConfig->max_quantity) {
            return response()->json([
                'success' => false,
                'message' => "Quantidade deve estar entre {$priceConfig->min_quantity} e {$priceConfig->max_quantity}"
            ], 422);
        }

        // Calcular preço
        $unitPrice = (float) $priceConfig->unit_price;
        $totalPrice = $unitPrice * $request->quantity;

        $purchase = AdditionalPurchase::create([
            'user_id' => $user->id,
            'type' => $request->type,
            'quantity' => $request->quantity,
            'price' => $totalPrice,
            'payment_method' => 'store',
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'data' => $purchase,
            'message' => 'Compra adicional criada. Complete o pagamento para ativar.'
        ]);
    }

    /**
     * Confirma o pagamento de uma compra adicional (chamado após pagamento na loja)
     */
    public function confirmStorePurchase(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'purchase_id' => 'required|exists:additional_purchases,id',
            'payment_method' => 'required|in:store,pix,card',
            'payment_id' => 'nullable|string',
            'payment_data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não autenticado'
            ], 401);
        }

        $purchase = AdditionalPurchase::where('id', $request->purchase_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$purchase) {
            return response()->json([
                'success' => false,
                'message' => 'Compra adicional não encontrada'
            ], 404);
        }

        if ($purchase->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Esta compra já foi confirmada'
            ], 400);
        }

        $purchase->update([
            'status' => 'completed',
            'payment_method' => $request->payment_method,
            'payment_id' => $request->payment_id,
            'payment_data' => $request->payment_data,
            'purchased_at' => Carbon::now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $purchase,
            'message' => 'Compra adicional confirmada com sucesso'
        ]);
    }

    /**
     * Retorna o limite total disponível (plano + compras adicionais)
     */
    public function getAvailableLimits(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não autenticado'
            ], 401);
        }

        $activeSubscription = $user->activeSubscription;

        $planContractsLimit = $activeSubscription?->plan?->contracts_limit ?? 0;
        $planConnectionsLimit = $activeSubscription?->plan?->connections_limit ?? null;

        $additionalContracts = AdditionalPurchase::getTotalAdditionalContracts($user->id);
        $additionalConnections = AdditionalPurchase::getTotalAdditionalConnections($user->id);

        $userContractsCount = $user->getContratosAssinadosCount();
        $userConnectionsCount = $user->getConnectionsCount(); // pendentes + ativas

        $totalContractsLimit = $planContractsLimit + $additionalContracts;

        if ($planConnectionsLimit !== null) {
            $totalConnectionsLimit = $planConnectionsLimit + $additionalConnections;
        } else {
            $totalConnectionsLimit = $additionalConnections > 0 ? $additionalConnections : null;
        }

        $connectionsAvailable = $totalConnectionsLimit !== null
            ? $totalConnectionsLimit - $userConnectionsCount
            : null;

        return response()->json([
            'success' => true,
            'data' => [
                'contracts' => [
                    'plan_limit' => $planContractsLimit,
                    'additional' => $additionalContracts,
                    'total_limit' => $totalContractsLimit,
                    'used' => $userContractsCount,
                    'available' => $totalContractsLimit - $userContractsCount,
                    'is_unlimited' => $planContractsLimit === null,
                ],
                'connections' => [
                    'plan_limit' => $planConnectionsLimit,
                    'additional' => $additionalConnections,
                    'total_limit' => $totalConnectionsLimit,
                    'used' => $userConnectionsCount,
                    'available' => $connectionsAvailable,
                    'is_unlimited' => $planConnectionsLimit === null && $additionalConnections === 0,
                ],
            ]
        ]);
    }
}
