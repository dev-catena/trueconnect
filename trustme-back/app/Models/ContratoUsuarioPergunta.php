<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContratoUsuarioPergunta extends Model
{
    protected $table = 'contrato_usuario_perguntas';
    protected $fillable = [
        'contrato_id',
        'pergunta_id',
        'usuario_id',
        'resposta'
    ];

    public function pergunta()
    {
        return $this->belongsTo(Pergunta::class, 'pergunta_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
