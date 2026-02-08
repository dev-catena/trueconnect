<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UsuarioConexao extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'usuario_conexoes';

    protected $fillable = [
        'solicitante_id',
        'destinatario_id',
        'aceito'
    ];

    protected $casts = [
        'aceito' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    public function solicitante()
    {
        return $this->belongsTo(User::class, 'solicitante_id');
    }

    public function destinatario()
    {
        return $this->belongsTo(User::class, 'destinatario_id');
    }
}
