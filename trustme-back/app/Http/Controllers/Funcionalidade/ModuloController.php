<?php

namespace App\Http\Controllers\Funcionalidade;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Funcionalidade\Modulo;

class ModuloController extends Controller
{
    public function ListarModulosUsuario()
    {
        $usuario = Auth::user();

        if (!$usuario) {
            return $this->fail('Usuário não autenticado.', null, 401);
        }

        $modulos = Modulo::whereHas('funcionalidades.grupoFuncionalidades.grupo.grupoUsuarios', function ($query) use ($usuario) {
            $query->where('usuario_id', $usuario->id);
        })
            ->select('id', 'nome', 'URL', 'caminho_img', 'ordem')
            ->orderBy('ordem')
            ->distinct()
            ->get();

        return $this->ok('OK', $modulos, 200);
    }
}
