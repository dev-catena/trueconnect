<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContratoClausula extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'contrato_clausulas';

    protected $fillable = [
        'contrato_id',
        'clausula_id',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    public function contrato()
    {
        return $this->belongsTo(Contrato::class, 'contrato_id');
    }

    public function clausula()
    {
        return $this->belongsTo(Clausula::class, 'clausula_id');
    }

    public function usuarioClausulas()
    {
        return $this->hasMany(ContratoUsuarioClausula::class, 'contrato_clausula_id');
    }
}
