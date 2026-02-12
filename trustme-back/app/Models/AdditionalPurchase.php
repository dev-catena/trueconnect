<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdditionalPurchase extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'type',
        'quantity',
        'price',
        'payment_method',
        'payment_id',
        'payment_data',
        'status',
        'purchased_at',
    ];

    protected $casts = [
        'payment_data' => 'array',
        'quantity' => 'integer',
        'price' => 'decimal:2',
        'purchased_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    /**
     * Retorna a quantidade total de contratos adicionais comprados e ativos
     */
    public static function getTotalAdditionalContracts($userId)
    {
        return self::where('user_id', $userId)
            ->where('type', 'contracts')
            ->where('status', 'completed')
            ->sum('quantity');
    }

    /**
     * Retorna a quantidade total de conexões adicionais compradas e ativas
     */
    public static function getTotalAdditionalConnections($userId)
    {
        return self::where('user_id', $userId)
            ->where('type', 'connections')
            ->where('status', 'completed')
            ->sum('quantity');
    }
}
