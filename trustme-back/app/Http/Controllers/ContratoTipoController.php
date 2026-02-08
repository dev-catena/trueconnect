<?php

namespace App\Http\Controllers;

use App\Models\ContratoTipo;
use Illuminate\Http\Request;

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
        $tipos = ContratoTipo::select('id', 'codigo', 'descricao')->orderBy('codigo')->get();
        return $this->ok('OK', $tipos);
    }
}
