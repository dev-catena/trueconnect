<?php

namespace App\Http\Controllers\Funcionalidade;

use App\Http\Controllers\Controller;
use App\Models\Funcionalidade\Funcionalidade;
use App\Models\Funcionalidade\Grupo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FuncionalidadeController extends Controller
{
    public function index()
    {
        $funcionalidades = Funcionalidade::orderBy('nome')->get();
        return $funcionalidades->isEmpty()
            ? response()->json(['msg' => 'Nenhuma funcionalidade cadastrada'], 200)
            : response()->json($funcionalidades, 200);
    }

    public function store(Request $request)
    {
        $funcionalidade = Funcionalidade::create($request->validated());
        return $this->ok('OK', $funcionalidade, 201);
    }

    public function funcionalidadeGrupo(Request $request)
    {
        $request->validate([
            'funcionalidade_id' => 'required|exists:funcionalidade,id',
            'grupo_id' => 'required|exists:grupo,id',
        ]);

        $funcionalidade = Funcionalidade::findOrFail($request->funcionalidade_id);
        $grupo = Grupo::findOrFail($request->grupo_id);

        if (!$funcionalidade->grupo()->where('grupo_id', $request->grupo_id)->exists()) {
            $funcionalidade->grupo()->attach($request->grupo_id);
            return response()->json(['funcionalidade' => $funcionalidade->nome, 'grupo' => $grupo->nome], 200);
        }

        return response()->json(['msg' => 'Já associados'], 200);
    }

    public function listaGruposFuncionalidade(int $id)
    {
        $funcionalidade = Funcionalidade::with('grupo')->findOrFail($id);
        return response()->json($funcionalidade->grupo, 200);
    }

    public function excluiFuncGrupo(Request $request)
    {
        $request->validate([
            'funcionalidade_id' => 'required|exists:funcionalidade,id',
            'grupo_id' => 'required|exists:grupo,id',
        ]);

        $funcionalidade = Funcionalidade::findOrFail($request->funcionalidade_id);
        $funcionalidade->grupo()->detach($request->grupo_id);

        return response()->json(['msg' => 'Excluído com sucesso'], 200);
    }
}
