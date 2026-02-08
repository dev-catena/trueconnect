<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Selo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'selos';

    protected $fillable = [
        'codigo',
        'nome',
        'descricao',
        'validade',
        'documentos_evidencias',
        'descricao_como_obter',
        'custo_obtencao',
        'ativo'
    ];

    protected $casts = [
        'documentos_evidencias' => 'array',
        'custo_obtencao' => 'decimal:2',
        'ativo' => 'boolean',
        'validade' => 'integer'
    ];

    protected $dates = [
        'deleted_at',
        'created_at',
        'updated_at'
    ];
}
