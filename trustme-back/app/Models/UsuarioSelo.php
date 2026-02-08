<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UsuarioSelo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'usuario_selos';

    protected $fillable = [
        'selo_id',
        'usuario_id',
        'verificado',
        'obtido_em',
        'expira_em',
    ];

    protected $casts = [
        'verificado' => 'boolean',
        'obtido_em' => 'datetime',
        'expira_em' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function selo()
    {
        return $this->belongsTo(Selo::class, 'selo_id');
    }
}
