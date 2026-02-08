<?php

namespace App\Http\Controllers\Funcionalidade;

use App\Http\Controllers\Controller;
use App\Models\Funcionalidade\Grupo;
use App\Models\User;
use Illuminate\Http\Request;

class GrupoController extends Controller
{

    public function index()
    {
        return response()->json(Grupo::orderBy('nome')->get(), 200);
    }

    public function store(Request $request)
    {
        $validacao = $request->validate([
            'nome' => 'required|string|max:255'
        ]);

        $grupo = Grupo::create($validacao);
        return $this->ok('OK', $grupo, 201);
    }

    public function show(int $id)
    {
        return response()->json(Grupo::findOrFail($id), 200);
    }

    public function update(Request $request, int $id)
    {
        $grupo = Grupo::findOrFail($id);

        $validacao = $request->validate([
            'nome' => 'required|string|max:255'
        ]);

        $grupo->update($validacao);
        return $this->ok('OK', $grupo, 200);
    }

    public function destroy(int $id)
    {
        $grupo = Grupo::findOrFail($id);
        $grupo->delete();
        return  $this->ok( 'Grupo excluído com sucesso', null, 200 );
    }

    public function listaFuncGrupo(int $id)
    {
        $grupo = Grupo::with('funcionalidade')->findOrFail($id);
        return response()->json($grupo->funcionalidade, 200);
    }

    public function usuarioGrupo(Request $request)
    {
        $request->validate([
            'usuario_id' => 'required|exists:users,id',
            'grupo_id' => 'required|exists:grupo,id',
        ]);

        $user = User::findOrFail($request->usuario_id);
        $grupo = Grupo::findOrFail($request->grupo_id);

        if (!$user->grupo()->where('grupo_id', $request->grupo_id)->exists()) {
            $user->grupo()->attach($request->grupo_id);
        }

        return response()->json(['msg' => 'Usuário já associado ao grupo'], 200);
    }


    public function excluiUsuarioGrupo(Request $request)
    {
        $request->validate([
            'usuario_id' => 'required|exists:users,id',
            'grupo_id' => 'required|exists:grupo,id',
        ]);

        $user = User::findOrFail($request->usuario_id);
        $user->grupo()->detach($request->grupo_id);

        return  $this->ok( 'Usuário removido do grupo com sucesso', null, 200 );
    }

    public function listaUsuariosGrupo(int $id)
    {
        $grupo = Grupo::with('user')->findOrFail($id);
        return response()->json($grupo->user, 200);
    }
}
