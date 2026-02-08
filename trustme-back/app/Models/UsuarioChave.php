<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsuarioChave extends Model
{
    use HasFactory;

    protected $table = 'usuario_chave';
    protected $fillable = [
        'chave',
        'usuario_id',
        'tipo',
        'expires_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];
}
