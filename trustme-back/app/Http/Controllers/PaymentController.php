<?php

namespace App\Http\Controllers;

use App\Services\MercadoPagoService;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class PaymentController extends Controller
{
    public function createPreference(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|in:monthly,semiannual,annual',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $plan = Plan::find($request->plan_id);
        $amount = $plan->getPriceForCycle($request->billing_cycle);

        $cycleName = match($request->billing_cycle) {
            'monthly' => 'Mensal',
            'semiannual' => 'Semestral',
            'annual' => 'Anual',
        };

        $data = [
            'items' => [
                [
                    'id' => $plan->id,
                    'title' => $plan->name . ' - ' . $cycleName,
                    'quantity' => 1,
                    'unit_price' => $amount,
                    'category_id' => 'software_subscription',
                ],
            ],
            // 'back_urls' => [
            //     'success' => route('payment.success'),
            //     'failure' => route('payment.failure'),
            //     'pending' => route('payment.pending'),
            // ],
            'auto_return' => 'all',
            'back_urls' => [
                'success' => config('services.mercadopago.back_urls.success'),
                'failure' => config('services.mercadopago.back_urls.failure'),
                'pending' => config('services.mercadopago.back_urls.pending'),
            ],
            'external_reference' => json_encode([
                'plan_id' => $plan->id,
                'billing_cycle' => $request->billing_cycle,
                'user_id' => auth()->id()
            ]),
            'payment_methods' => [
                'excluded_payment_methods' => [
                    ['id' => 'ticket'], // Excluir boleto
                ],
                'excluded_payment_types' => [
                    ['id' => 'ticket'], // Excluir boleto
                ],
                'installments' => 1, // Pagamento à vista
            ],
        ];


        $service = new MercadoPagoService();
        $preference = $service->createPreference($data);

        return response()->json([
            'success' => true,
            'data' => $preference
        ]);
    }

    public function processPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'payment_id' => 'required|string',
            'status' => 'required|string',
            'external_reference' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $externalReference = json_decode($request->external_reference, true);

        if ($request->status === 'approved') {
            $plan = Plan::find($externalReference['plan_id']);
            $amount = $plan->getPriceForCycle($externalReference['billing_cycle']);

            $startDate = Carbon::now();
            $endDate = match($externalReference['billing_cycle']) {
                'monthly' => $startDate->copy()->addMonth(),
                'semiannual' => $startDate->copy()->addMonths(6),
                'annual' => $startDate->copy()->addYear(),
                'one_time' => null, // Pagamento único não tem data de fim
                default => $startDate->copy()->addMonth(),
            };

            $subscription = Subscription::create([
                'user_id' => $externalReference['user_id'],
                'plan_id' => $externalReference['plan_id'],
                'billing_cycle' => $externalReference['billing_cycle'],
                'amount' => $amount,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'payment_method' => 'mercado_pago',
                'payment_id' => $request->payment_id,
                'payment_data' => $request->all(),
                'status' => 'active',
            ]);

            return response()->json([
                'success' => true,
                'data' => $subscription,
                'message' => 'Pagamento processado com sucesso'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Pagamento não aprovado'
        ], 400);
    }

    public function webhook(Request $request)
    {
        // Webhook para receber notificações do Mercado Pago
        // Em produção, aqui seria implementada a lógica para processar
        // as notificações de pagamento do Mercado Pago

        \Log::info('Mercado Pago Webhook:', $request->all());

        return response()->json(['status' => 'ok']);
    }

    public function getPaymentMethods()
    {
        // Retorna os métodos de pagamento disponíveis
        $methods = [
            [
                'id' => 'mercado_pago',
                'name' => 'Mercado Pago',
                'description' => 'Cartão de crédito, débito, PIX e boleto',
                'enabled' => true,
            ],
            [
                'id' => 'pix',
                'name' => 'PIX',
                'description' => 'Pagamento instantâneo via PIX',
                'enabled' => true,
            ],
            [
                'id' => 'credit_card',
                'name' => 'Cartão de Crédito',
                'description' => 'Visa, Mastercard, Elo, etc.',
                'enabled' => true,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $methods
        ]);
    }


    public function success(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'payment_id' => 'required|string',
            'status' => 'required|string',
            'external_reference' => 'required|string',
            'merchant_order_id' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $externalReference = json_decode($request->external_reference, true);

        if ($request->status === 'approved') {
            $plan = Plan::find($externalReference['plan_id']);
            $amount = $plan->getPriceForCycle($externalReference['billing_cycle']);

            $startDate = Carbon::now();
            $endDate = match($externalReference['billing_cycle']) {
                'monthly' => $startDate->copy()->addMonth(),
                'semiannual' => $startDate->copy()->addMonths(6),
                'annual' => $startDate->copy()->addYear(),
                'one_time' => null, // Pagamento único não tem data de fim
                default => $startDate->copy()->addMonth(),
            };

            $subscription = Subscription::create([
                'user_id' => $externalReference['user_id'],
                'plan_id' => $externalReference['plan_id'],
                'billing_cycle' => $externalReference['billing_cycle'],
                'amount' => $amount,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'payment_method' => 'mercado_pago',
                'payment_id' => $request->payment_id,
                'payment_data' => $request->all(),
                'status' => 'active',
            ]);

            return redirect()->away('/payment/success')->with('success', 'Pagamento processado com sucesso');

        }

        return redirect()->away('/payment/failure')->with('failure', 'Pagamento não processado');
    }

    public function failure(Request $request)
    {
        return redirect()->away('/payment/failure')->with('failure', 'Pagamento não processado');
    }

    public function pending(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'payment_id' => 'required|string',
            'status' => 'required|string',
            'external_reference' => 'required|string',
            'merchant_order_id' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $externalReference = json_decode($request->external_reference, true);

        if ($request->status === 'pending') {
            $plan = Plan::find($externalReference['plan_id']);
            $amount = $plan->getPriceForCycle($externalReference['billing_cycle']);

            $startDate = Carbon::now();
            $endDate = match($externalReference['billing_cycle']) {
                'monthly' => $startDate->copy()->addMonth(),
                'semiannual' => $startDate->copy()->addMonths(6),
                'annual' => $startDate->copy()->addYear(),
                'one_time' => null, // Pagamento único não tem data de fim
                default => $startDate->copy()->addMonth(),
            };

            $subscription = Subscription::create([
                'user_id' => $externalReference['user_id'],
                'plan_id' => $externalReference['plan_id'],
                'billing_cycle' => $externalReference['billing_cycle'],
                'amount' => $amount,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'payment_method' => 'mercado_pago',
                'payment_id' => $request->payment_id,
                'payment_data' => $request->all(),
                'status' => 'active',
            ]);

            // return response()->json([
            //     'success' => true,
            //     'data' => $subscription,
            //     'message' => 'Pagamento pendente'
            // ]);
            return redirect()->away('/payment/pending')->with('pending', 'Pagamento pendente');
        }

        return redirect()->away('/payment/pending')->with('pending', 'Pagamento pendente');

        // return response()->json([
        //     'success' => false,
        //     'message' => 'Pagamento pendente'
        // ], 400);

    }
}
