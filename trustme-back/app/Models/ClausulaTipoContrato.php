<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClausulaTipoContrato extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'clausula_tipo_contrato';

    protected $fillable = [
        'contrato_tipo_id',
        'clausula_id'
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    public function contratoTipo()
    {
        return $this->belongsTo(ContratoTipo::class, 'contrato_tipo_id');
    }

    public function clausula()
    {
        return $this->belongsTo(Clausula::class, 'clausula_id');
    }
}
