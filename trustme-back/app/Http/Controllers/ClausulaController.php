<?php

namespace App\Http\Controllers;

use App\Models\Clausula;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ClausulaController extends Controller
{
    /**
     * Lista todas as cláusulas
     */
    public function index()
    {
        $clausulas = Clausula::select('id', 'codigo', 'nome', 'descricao', 'sexual')
            ->orderBy('codigo')
            ->get();
        
        return $this->ok('Cláusulas recuperadas com sucesso.', $clausulas);
    }

    /**
     * Cria uma nova cláusula
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'codigo' => 'required|string|max:255|unique:clausulas,codigo',
            'nome' => 'required|string|max:255',
            'descricao' => 'required|string',
            'sexual' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return $this->fail('Erro de validação', null, 422, $validator->errors()->toArray());
        }

        $clausula = Clausula::create($request->all());

        return $this->ok('Cláusula criada com sucesso.', $clausula, 201);
    }

    /**
     * Exibe uma cláusula específica
     */
    public function show($id)
    {
        $clausula = Clausula::find($id);
        
        if (!$clausula) {
            return $this->fail('Cláusula não encontrada', null, 404);
        }

        return $this->ok('Cláusula recuperada com sucesso.', $clausula);
    }

    /**
     * Atualiza uma cláusula existente
     */
    public function update(Request $request, $id)
    {
        $clausula = Clausula::find($id);
        
        if (!$clausula) {
            return $this->fail('Cláusula não encontrada', null, 404);
        }

        $validator = Validator::make($request->all(), [
            'codigo' => 'required|string|max:255|unique:clausulas,codigo,' . $id,
            'nome' => 'required|string|max:255',
            'descricao' => 'required|string',
            'sexual' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return $this->fail('Erro de validação', null, 422, $validator->errors()->toArray());
        }

        $clausula->update($request->all());

        return $this->ok('Cláusula atualizada com sucesso.', $clausula);
    }

    /**
     * Exclui uma cláusula
     */
    public function destroy($id)
    {
        $clausula = Clausula::find($id);
        
        if (!$clausula) {
            return $this->fail('Cláusula não encontrada', null, 404);
        }

        // Verificar se a cláusula está associada a algum tipo de contrato
        if (\App\Models\ClausulaTipoContrato::where('clausula_id', $id)->exists()) {
            return $this->fail('Não é possível excluir esta cláusula, pois está associada a um tipo de contrato.', null, 409);
        }

        // Verificar se há contratos usando esta cláusula
        $contratosCount = \App\Models\ContratoClausula::where('clausula_id', $id)->count();
        if ($contratosCount > 0) {
            return $this->fail(
                "Não é possível excluir esta cláusula pois existem {$contratosCount} contrato(s) associado(s) a ela.",
                null,
                409
            );
        }

        $clausula->delete();

        return $this->ok('Cláusula excluída com sucesso.');
    }
}

