<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContratoAlteracao extends Model
{
    public $timestamps = false;

    protected $table = 'contrato_alteracoes';

    protected $fillable = [
        'contrato_id',
        'usuario_id',
        'tipo',
        'manifestacao',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function contrato(): BelongsTo
    {
        return $this->belongsTo(Contrato::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
