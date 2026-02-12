<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::where('is_active', true)->get();
        
        return response()->json([
            'success' => true,
            'data' => $plans
        ]);
    }

    public function show($id)
    {
        $plan = Plan::find($id);
        
        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'Plano não encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $plan
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'monthly_price' => 'required|numeric|min:0',
            'semiannual_price' => 'required|numeric|min:0',
            'annual_price' => 'required|numeric|min:0',
            'one_time_price' => 'nullable|numeric|min:0',
            'seals_limit' => 'nullable|integer|min:0',
            'contracts_limit' => 'nullable|integer|min:0',
            'features' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        // Garantir que one_time_price seja null se não fornecido
        if (!isset($data['one_time_price']) || $data['one_time_price'] === '') {
            $data['one_time_price'] = null;
        }
        
        $plan = Plan::create($data);

        return response()->json([
            'success' => true,
            'data' => $plan,
            'message' => 'Plano criado com sucesso'
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $plan = Plan::find($id);
        
        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'Plano não encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'description' => 'string',
            'monthly_price' => 'numeric|min:0',
            'semiannual_price' => 'numeric|min:0',
            'annual_price' => 'numeric|min:0',
            'one_time_price' => 'nullable|numeric|min:0',
            'seals_limit' => 'nullable|integer|min:0',
            'contracts_limit' => 'nullable|integer|min:0',
            'features' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        
        // Preparar dados para atualização de forma mais segura
        $dataToUpdate = [];
        
        // Campos básicos
        if (isset($data['name'])) $dataToUpdate['name'] = $data['name'];
        if (isset($data['description'])) $dataToUpdate['description'] = $data['description'];
        if (isset($data['is_active'])) $dataToUpdate['is_active'] = (bool)$data['is_active'];
        if (isset($data['features'])) $dataToUpdate['features'] = $data['features'];
        
        // Preços obrigatórios
        if (isset($data['monthly_price'])) {
            $dataToUpdate['monthly_price'] = is_numeric($data['monthly_price']) ? (float)$data['monthly_price'] : 0;
        }
        if (isset($data['semiannual_price'])) {
            $dataToUpdate['semiannual_price'] = is_numeric($data['semiannual_price']) ? (float)$data['semiannual_price'] : 0;
        }
        if (isset($data['annual_price'])) {
            $dataToUpdate['annual_price'] = is_numeric($data['annual_price']) ? (float)$data['annual_price'] : 0;
        }
        
        // one_time_price - pode ser null (tratamento especial)
        $oneTimePriceToSet = null;
        if (array_key_exists('one_time_price', $data)) {
            if ($data['one_time_price'] === '' || $data['one_time_price'] === null || $data['one_time_price'] === 'null') {
                $oneTimePriceToSet = null;
            } else {
                $oneTimePriceToSet = is_numeric($data['one_time_price']) ? (float)$data['one_time_price'] : null;
            }
        }
        
        // Limites - podem ser null
        if (array_key_exists('seals_limit', $data)) {
            $dataToUpdate['seals_limit'] = ($data['seals_limit'] === '' || $data['seals_limit'] === null) ? null : (int)$data['seals_limit'];
        }
        if (array_key_exists('contracts_limit', $data)) {
            $dataToUpdate['contracts_limit'] = ($data['contracts_limit'] === '' || $data['contracts_limit'] === null) ? null : (int)$data['contracts_limit'];
        }
        
        try {
            // Atualizar campos normais
            if (!empty($dataToUpdate)) {
                $plan->update($dataToUpdate);
            }
            
            // Atualizar one_time_price separadamente para garantir que null seja tratado corretamente
            if (array_key_exists('one_time_price', $data) && isset($oneTimePriceToSet)) {
                DB::table('plans')
                    ->where('id', $plan->id)
                    ->update(['one_time_price' => $oneTimePriceToSet]);
            }
            
            // Recarregar o modelo para refletir todas as mudanças
            $plan->refresh();
        } catch (\Exception $e) {
            \Log::error('Erro ao atualizar plano: ' . $e->getMessage(), [
                'plan_id' => $id,
                'data' => $data,
                'dataToUpdate' => $dataToUpdate ?? null,
                'trace' => $e->getTraceAsString()
            ]);
            
            // Verificar se o erro é relacionado à coluna one_time_price
            if (strpos($e->getMessage(), 'one_time_price') !== false || 
                strpos($e->getMessage(), "Unknown column 'one_time_price'") !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'A coluna one_time_price não existe na tabela. Execute a migration: php artisan migrate --path=database/migrations/2026_02_08_000000_add_one_time_price_to_plans_table.php'
                ], 500);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar plano: ' . $e->getMessage() . ' (Verifique os logs do servidor para mais detalhes)'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $plan,
            'message' => 'Plano atualizado com sucesso'
        ]);
    }

    public function destroy($id)
    {
        $plan = Plan::find($id);
        
        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'Plano não encontrado'
            ], 404);
        }

        $plan->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Plano desativado com sucesso'
        ]);
    }
}
