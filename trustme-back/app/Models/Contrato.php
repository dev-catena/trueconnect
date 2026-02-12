<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contrato extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'contratos';

    protected $fillable = [
        'codigo',
        'contrato_tipo_id',
        'descricao',
        'contratante_id',
        'status',
        'duracao',
        'dt_inicio',
        'dt_fim',
        'dt_prazo_assinatura'
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    public function clausulas()
    {
        return $this->hasMany(ContratoClausula::class, 'contrato_id');
    }


    public function tipo()
    {
        return $this->belongsTo(ContratoTipo::class, 'contrato_tipo_id');
    }

    public function contratante()
    {
        return $this->belongsTo(User::class, 'contratante_id');
    }

    public function logs()
    {
        return $this->hasMany(ContratoLog::class, 'contrato_id');
    }

    public function usuarios()
    {
        return $this->belongsToMany(User::class, 'contrato_usuarios', 'contrato_id', 'usuario_id')
            ->withTimestamps()
            ->withPivot('deleted_at'); // se necessário
    }

    public function participantes()
    {
        return $this->hasMany(ContratoUsuario::class, 'contrato_id');
    }

    /**
     * Cláusulas vinculadas ao contrato (sem aceitar ou recusar)
     */
    public function clausulasContrato()
    {
        return $this->hasMany(ContratoClausula::class, 'contrato_id');
    }

    /**
     * Clausulas únicas via relacionamento com a cláusula base (Clausula)
     */
    public function clausulasUnicas()
    {
        return $this->hasManyThrough(
            Clausula::class,
            ContratoClausula::class,
            'contrato_id',
            'id',
            'id',
            'clausula_id'
        )->select('clausulas.id as clausula_id', 'clausulas.codigo', 'clausulas.nome', 'clausulas.descricao', 'clausulas.sexual')->distinct();
    }
}
