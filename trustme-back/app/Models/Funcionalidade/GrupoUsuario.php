<?php

namespace App\Models\Funcionalidade;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GrupoUsuario extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'grupo_usuario';
    protected $fillable = ['usuario_id', 'grupo_id'];
    protected $casts = ['deleted_at' => 'datetime'];

    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'grupo_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
