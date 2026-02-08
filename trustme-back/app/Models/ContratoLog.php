<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContratoLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'contrato_logs';

    protected $fillable = [
        'contrato_id',
        'usuario_id',
        'tabela',
        'coluna',
        'valor_antigo',
        'valor_novo'
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    public function contrato()
    {
        return $this->belongsTo(Contrato::class, 'contrato_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
