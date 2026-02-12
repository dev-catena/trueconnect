<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdditionalPurchasePrice extends Model
{
    use HasFactory;

    protected $table = 'additional_purchase_prices';

    protected $fillable = [
        'type',
        'unit_price',
        'min_quantity',
        'max_quantity',
        'is_active',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'min_quantity' => 'integer',
        'max_quantity' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Retorna o preço ativo para um tipo específico
     */
    public static function getActivePrice(string $type): ?self
    {
        return self::where('type', $type)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Retorna todos os preços ativos
     */
    public static function getActivePrices(): array
    {
        $prices = self::where('is_active', true)->get();
        
        $result = [];
        foreach ($prices as $price) {
            $result[$price->type] = [
                'unit_price' => (float) $price->unit_price,
                'min_quantity' => $price->min_quantity,
                'max_quantity' => $price->max_quantity,
            ];
        }

        return $result;
    }
}
