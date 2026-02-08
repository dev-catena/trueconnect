<?php

namespace App\Models\Funcionalidade;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Funcionalidade extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'funcionalidade';
    protected $fillable = ['nome', 'ordem', 'descricao', 'modulo_id'];
    protected $casts = ['deleted_at' => 'datetime'];

    public function grupo()
    {
        return $this->belongsToMany(Grupo::class, 'grupo_funcionalidade');
    }

    public function grupoFuncionalidades()
    {
        return $this->hasMany(GrupoFuncionalidade::class, 'funcionalidade_id');
    }
}
