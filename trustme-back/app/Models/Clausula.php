<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Clausula extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'clausulas';

    protected $fillable = [
        'codigo',
        'nome',
        'descricao',
        'sexual' //boolean
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    public function contratoUsuarioClausulas()
    {
        return $this->hasMany(ContratoUsuarioClausula::class, 'clausula_id');
    }

    public function clausulaTipoContratos()
    {
        return $this->hasMany(ClausulaTipoContrato::class, 'clausula_id');
    }
}
