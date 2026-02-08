<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContratoUsuarioClausula extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'contrato_usuario_clausulas';

    protected $fillable = [
        'contrato_usuario_id',
        'contrato_clausula_id',
        'aceito',
    ];

    protected $casts = [
        'aceito' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    public function contratoUsuario()
    {
        return $this->belongsTo(ContratoUsuario::class, 'contrato_usuario_id');
    }

    public function contratoClausula()
    {
        return $this->belongsTo(ContratoClausula::class, 'contrato_clausula_id');
    }

    public function clausula()
    {
        // Acesso direto à cláusula original
        return $this->hasOneThrough(
            Clausula::class,
            ContratoClausula::class,
            'id',                  // Foreign key on contrato_clausulas
            'id',                  // Foreign key on clausulas
            'contrato_clausula_id', // Local key on contrato_usuario_clausulas
            'clausula_id'           // Local key on contrato_clausulas
        );
    }
}
