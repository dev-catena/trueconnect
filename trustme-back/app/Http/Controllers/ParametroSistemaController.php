<?php

namespace App\Http\Controllers;

use App\Models\ParametroSistema;
use Illuminate\Http\Request;

class ParametroSistemaController extends Controller
{
    public function index()
    {
        $params = ParametroSistema::orderBy('chave')->get();
        return $this->ok('Parâmetros recuperados.', $params);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'chave' => 'required|string|exists:parametros_sistema,chave',
            'valor' => 'required|string|max:255',
        ]);

        $param = ParametroSistema::where('chave', $validated['chave'])->first();
        if (!$param) {
            return $this->fail('Parâmetro não encontrado.', null, 404);
        }

        $param->update(['valor' => $validated['valor']]);

        return $this->ok('Parâmetro atualizado.', $param);
    }
}
