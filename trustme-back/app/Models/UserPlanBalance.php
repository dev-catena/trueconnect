<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPlanBalance extends Model
{
    protected $table = 'user_plan_balances';

    protected $fillable = [
        'user_id',
        'connections_balance',
        'contracts_balance',
        'last_topup_at',
    ];

    protected $casts = [
        'last_topup_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Recarrega o saldo do usuário com a cota do período (respeitando teto de acúmulo).
     * Chamado quando assinatura é criada ou renovada.
     */
    public static function topUpForUser(User $user): void
    {
        $subscription = $user->activeSubscription;
        if (!$subscription || !$subscription->plan) {
            return;
        }

        $plan = $subscription->plan;

        // Plano ilimitado: não usa balance
        if ($plan->connections_period_allowance === null && $plan->contracts_period_allowance === null) {
            return;
        }

        $balance = self::firstOrCreate(
            ['user_id' => $user->id],
            ['connections_balance' => 0, 'contracts_balance' => 0]
        );

        if ($plan->connections_period_allowance !== null) {
            $toAdd = (int) $plan->connections_period_allowance;
            $limit = $plan->connections_accumulation_limit;
            $newBalance = $limit !== null
                ? min($balance->connections_balance + $toAdd, $limit)
                : $balance->connections_balance + $toAdd;
            $balance->connections_balance = $newBalance;
        }

        if ($plan->contracts_period_allowance !== null) {
            $toAdd = (int) $plan->contracts_period_allowance;
            $limit = $plan->contracts_accumulation_limit;
            $newBalance = $limit !== null
                ? min($balance->contracts_balance + $toAdd, $limit)
                : $balance->contracts_balance + $toAdd;
            $balance->contracts_balance = $newBalance;
        }

        $balance->last_topup_at = now();
        $balance->save();
    }

    /**
     * Debita 1 conexão do saldo do usuário.
     * Retorna true se conseguiu debitar (saldo >= 1).
     */
    public static function debitConnection(User $user): bool
    {
        $balance = self::where('user_id', $user->id)->first();
        if (!$balance || $balance->connections_balance < 1) {
            return false;
        }
        $balance->decrement('connections_balance');
        return true;
    }

    /**
     * Debita 1 contrato do saldo do usuário.
     */
    public static function debitContract(User $user): bool
    {
        $balance = self::where('user_id', $user->id)->first();
        if (!$balance || $balance->contracts_balance < 1) {
            return false;
        }
        $balance->decrement('contracts_balance');
        return true;
    }

    /**
     * Credita 1 conexão de volta ao saldo (respeitando teto de acúmulo).
     */
    public static function creditConnection(User $user, ?Plan $plan = null): void
    {
        $plan = $plan ?? $user->activeSubscription?->plan;
        if (!$plan || $plan->connections_period_allowance === null) {
            return;
        }

        $balance = self::firstOrCreate(
            ['user_id' => $user->id],
            ['connections_balance' => 0, 'contracts_balance' => 0]
        );

        $newBalance = $balance->connections_balance + 1;
        $limit = $plan->connections_accumulation_limit;
        if ($limit !== null) {
            $newBalance = min($newBalance, $limit);
        }
        $balance->update(['connections_balance' => $newBalance]);
    }

    /**
     * Credita 1 contrato de volta ao saldo.
     */
    public static function creditContract(User $user, ?Plan $plan = null): void
    {
        $plan = $plan ?? $user->activeSubscription?->plan;
        if (!$plan || $plan->contracts_period_allowance === null) {
            return;
        }

        $balance = self::firstOrCreate(
            ['user_id' => $user->id],
            ['connections_balance' => 0, 'contracts_balance' => 0]
        );

        $newBalance = $balance->contracts_balance + 1;
        $limit = $plan->contracts_accumulation_limit;
        if ($limit !== null) {
            $newBalance = min($newBalance, $limit);
        }
        $balance->update(['contracts_balance' => $newBalance]);
    }
}
