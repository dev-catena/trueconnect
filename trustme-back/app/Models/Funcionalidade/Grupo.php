<?php

namespace App\Models\Funcionalidade;

use App\Models\Funcionalidade\Funcionalidade;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Grupo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'grupo';
    protected $fillable = ['nome'];
    protected $casts = ['deleted_at' => 'datetime'];

    public function user()
    {
        return $this->belongsToMany(User::class, 'grupo_usuario', 'grupo_id', 'usuario_id');
    }

    public function funcionalidade()
    {
        return $this->belongsToMany(Funcionalidade::class, 'grupo_funcionalidade');
    }

    public function grupoFuncionalidades()
    {
        return $this->hasMany(GrupoFuncionalidade::class, 'grupo_id');
    }

    public function grupoUsuarios()
    {
        return $this->hasMany(GrupoUsuario::class, 'grupo_id');
    }
}
