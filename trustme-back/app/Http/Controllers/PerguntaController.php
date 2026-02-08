<?php

namespace App\Http\Controllers;

use App\Models\Pergunta;
use Illuminate\Http\Request;

class PerguntaController extends Controller
{
    public function index()
    {
        $perguntas = Pergunta::get();

        if ($perguntas->isEmpty()) {
            return $this->fail('OK', ['msg' => 'Nenhum valor encontrado.'], 404);
        }

        return $this->ok('OK', $perguntas, 200);
    }
}
