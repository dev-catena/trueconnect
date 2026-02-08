<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pergunta extends Model
{
    use SoftDeletes;

    protected $table = 'perguntas';
    protected $fillable = [
        'contrato_tipo_id',
        'descricao',
        'alternativas',
        'tipo_alternativa'
    ];
    protected $casts = ['deleted_at' => 'datetime'];

    public function tipoContrato()
    {
        return $this->belongsTo(ContratoTipo::class, 'contrato_tipo_id');
    }

    public function respostas()
    {
        return $this->hasMany(ContratoUsuarioPergunta::class, 'pergunta_id');
    }
}
