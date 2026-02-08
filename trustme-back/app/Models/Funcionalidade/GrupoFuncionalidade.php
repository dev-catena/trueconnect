<?php

namespace App\Models\Funcionalidade;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GrupoFuncionalidade extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'grupo_funcionalidade';
    protected $fillable = ['funcionalidade_id', 'grupo_id'];
    protected $casts = ['deleted_at' => 'datetime'];

    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'grupo_id');
    }

    public function funcionalidade()
    {
        return $this->belongsTo(Funcionalidade::class, 'funcionalidade_id');
    }
}
