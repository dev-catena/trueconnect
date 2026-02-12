<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdditionalPurchasePrice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdditionalPurchasePriceController extends Controller
{
    /**
     * Lista todos os preços
     * Garante que retorna apenas um registro de cada tipo (contracts e connections)
     */
    public function index()
    {
        // Buscar apenas registros ativos (não soft-deleted) e agrupar por tipo
        $prices = AdditionalPurchasePrice::all();
        
        // Garantir que temos apenas um registro de cada tipo
        $pricesByType = [];
        foreach ($prices as $price) {
            // Se já existe um registro deste tipo, manter apenas o primeiro encontrado
            if (!isset($pricesByType[$price->type])) {
                $pricesByType[$price->type] = $price;
            }
        }
        
        // Converter para array e garantir ordem: contracts primeiro, depois connections
        $result = [];
        if (isset($pricesByType['contracts'])) {
            $result[] = $pricesByType['contracts'];
        }
        if (isset($pricesByType['connections'])) {
            $result[] = $pricesByType['connections'];
        }
        
        return $this->ok('Preços recuperados com sucesso.', $result);
    }

    /**
     * Atualiza um preço existente
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'unit_price' => 'required|numeric|min:0',
            'min_quantity' => 'required|integer|min:1',
            'max_quantity' => 'required|integer|min:1|gte:min_quantity',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return $this->fail('Dados inválidos.', null, 422, $validator->errors()->toArray());
        }

        $price = AdditionalPurchasePrice::find($id);
        if (!$price) {
            return $this->fail('Preço não encontrado.', null, 404);
        }

        $price->update([
            'unit_price' => $request->unit_price,
            'min_quantity' => $request->min_quantity,
            'max_quantity' => $request->max_quantity,
            'is_active' => $request->has('is_active') ? $request->is_active : $price->is_active,
        ]);

        return $this->ok('Preço atualizado com sucesso.', $price);
    }
}
