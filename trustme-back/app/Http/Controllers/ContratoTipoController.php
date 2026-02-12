<?php

namespace App\Http\Controllers;

use App\Models\ContratoTipo;
use App\Models\Clausula;
use App\Models\ClausulaTipoContrato;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContratoTipoController extends Controller
{
    public function clausulasEPerguntasPorTipo($id)
    {
        $tipo = ContratoTipo::with([
            'clausulaTipoContratos.clausula' => function ($query) {
                $query->select('id', 'codigo', 'nome', 'descricao', 'sexual');
            },
            'perguntas:id,contrato_tipo_id,descricao'
        ])->find($id);

        if (!$tipo) {
            return $this->fail('Tipo de contrato não encontrado', null, 404);
        }

        $clausulas = $tipo->clausulaTipoContratos->pluck('clausula');

        return $this->ok('OK', [
            'tipo_contrato_id' => $tipo->id,
            'tipo_contrato_codigo' => $tipo->codigo,
            'clausulas' => $clausulas,
            'perguntas' => $tipo->perguntas
        ]);
    }

    public function index()
    {
        $tipos = ContratoTipo::withCount('clausulaTipoContratos as clausulas_count')
            ->select('id', 'codigo', 'descricao')
            ->orderBy('codigo')
            ->get();
        return $this->ok('OK', $tipos);
    }

    public function show($id)
    {
        $tipo = ContratoTipo::find($id);
        
        if (!$tipo) {
            return response()->json([
                'success' => false,
                'message' => 'Tipo de contrato não encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $tipo
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'codigo' => 'required|string|max:255|unique:contrato_tipos,codigo',
            'descricao' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $tipo = ContratoTipo::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $tipo,
            'message' => 'Tipo de contrato criado com sucesso'
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $tipo = ContratoTipo::find($id);
        
        if (!$tipo) {
            return response()->json([
                'success' => false,
                'message' => 'Tipo de contrato não encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'codigo' => 'required|string|max:255|unique:contrato_tipos,codigo,' . $id,
            'descricao' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $tipo->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $tipo,
            'message' => 'Tipo de contrato atualizado com sucesso'
        ]);
    }

    public function destroy($id)
    {
        $tipo = ContratoTipo::find($id);
        
        if (!$tipo) {
            return response()->json([
                'success' => false,
                'message' => 'Tipo de contrato não encontrado'
            ], 404);
        }

        // Verificar se há contratos usando este tipo
        $contratosCount = \App\Models\Contrato::where('contrato_tipo_id', $id)->count();
        if ($contratosCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Não é possível excluir este tipo de contrato pois existem {$contratosCount} contrato(s) associado(s) a ele."
            ], 422);
        }

        $tipo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tipo de contrato excluído com sucesso'
        ]);
    }

    /**
     * Lista as cláusulas de um tipo de contrato
     */
    public function getClausulas($id)
    {
        $tipo = ContratoTipo::find($id);
        
        if (!$tipo) {
            return response()->json([
                'success' => false,
                'message' => 'Tipo de contrato não encontrado'
            ], 404);
        }

        $clausulas = $tipo->clausulaTipoContratos()
            ->with('clausula:id,codigo,nome,descricao,sexual')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->clausula->id,
                    'codigo' => $item->clausula->codigo,
                    'nome' => $item->clausula->nome,
                    'descricao' => $item->clausula->descricao,
                    'sexual' => $item->clausula->sexual,
                    'pivot_id' => $item->id, // ID da relação
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $clausulas
        ]);
    }

    /**
     * Adiciona uma cláusula a um tipo de contrato
     */
    public function addClausula(Request $request, $id)
    {
        $tipo = ContratoTipo::find($id);
        
        if (!$tipo) {
            return response()->json([
                'success' => false,
                'message' => 'Tipo de contrato não encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'clausula_id' => 'required|exists:clausulas,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar se já existe a relação
        $exists = ClausulaTipoContrato::where('contrato_tipo_id', $id)
            ->where('clausula_id', $request->clausula_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Esta cláusula já está associada a este tipo de contrato'
            ], 422);
        }

        $relacao = ClausulaTipoContrato::create([
            'contrato_tipo_id' => $id,
            'clausula_id' => $request->clausula_id,
        ]);

        return response()->json([
            'success' => true,
            'data' => $relacao,
            'message' => 'Cláusula adicionada com sucesso'
        ], 201);
    }

    /**
     * Remove uma cláusula de um tipo de contrato
     */
    public function removeClausula($tipoId, $clausulaId)
    {
        $tipo = ContratoTipo::find($tipoId);
        
        if (!$tipo) {
            return response()->json([
                'success' => false,
                'message' => 'Tipo de contrato não encontrado'
            ], 404);
        }

        $relacao = ClausulaTipoContrato::where('contrato_tipo_id', $tipoId)
            ->where('clausula_id', $clausulaId)
            ->first();

        if (!$relacao) {
            return response()->json([
                'success' => false,
                'message' => 'Cláusula não está associada a este tipo de contrato'
            ], 404);
        }

        $relacao->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cláusula removida com sucesso'
        ]);
    }
}
