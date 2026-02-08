<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContratoUsuario extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'contrato_usuarios';

    protected $fillable = [
        'contrato_id',
        'usuario_id',
        'aceito',
        'dt_aceito',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    public function contrato()
    {
        return $this->belongsTo(Contrato::class, 'contrato_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function clausulas()
    {
        return $this->hasMany(ContratoUsuarioClausula::class, 'contrato_usuario_id');
    }

    public function perguntas()
    {
        return $this->hasMany(ContratoUsuarioPergunta::class, 'usuario_id', 'usuario_id')
            ->whereHas('pergunta', function ($q) {
                $q->whereColumn('contrato_tipo_id', 'contratos.contrato_tipo_id');
            });
    }
}
