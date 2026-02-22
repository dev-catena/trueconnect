<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'monthly_price',
        'semiannual_price',
        'annual_price',
        'one_time_price',
        'seals_limit',
        'contracts_limit',
        'connections_limit',
        'connections_period_allowance',
        'connections_accumulation_limit',
        'contracts_period_allowance',
        'contracts_accumulation_limit',
        'pending_requests_limit',
        'features',
        'is_active',
        'is_default',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'monthly_price' => 'decimal:2',
        'semiannual_price' => 'decimal:2',
        'annual_price' => 'decimal:2',
        'one_time_price' => 'decimal:2',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function getPriceForCycle($cycle)
    {
        return (double) match($cycle) {
            'monthly' => $this->monthly_price,
            'semiannual' => $this->semiannual_price,
            'annual' => $this->annual_price,
            'one_time' => $this->one_time_price ?? 0,
            default => $this->monthly_price,
        };
    }

    public function isUnlimited()
    {
        return is_null($this->seals_limit)
            && is_null($this->contracts_limit)
            && is_null($this->connections_limit)
            && is_null($this->connections_period_allowance)
            && is_null($this->contracts_period_allowance);
    }

    /** Plano usa modelo acumulativo para conexões (cota por período + teto). */
    public function usesConnectionsAccumulation(): bool
    {
        return $this->connections_period_allowance !== null;
    }

    /** Plano usa modelo acumulativo para contratos. */
    public function usesContractsAccumulation(): bool
    {
        return $this->contracts_period_allowance !== null;
    }
}
