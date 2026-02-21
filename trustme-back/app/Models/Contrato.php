<?php

namespace App\Models;

use Carbon\Carbon;
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

    public function alteracoes()
    {
        return $this->hasMany(ContratoAlteracao::class, 'contrato_id');
    }

    public function alteracaoRescisao()
    {
        return $this->hasOne(ContratoAlteracao::class, 'contrato_id')->where('tipo', 'rescindir');
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
     * Atualiza status de contratos expirados para o usuário (Ativo->Concluído, Pendente->Expirado).
     * Considera dt_fim para Ativo e dt_fim ou dt_prazo_assinatura para Pendente.
     */
    public static function atualizarExpiradosParaUsuario(User $usuario): void
    {
        $agora = Carbon::now('America/Sao_Paulo');

        // Ativos com dt_fim vencida -> Concluído
        Contrato::query()
            ->whereHas('participantes', fn ($q) => $q->where('usuario_id', $usuario->id))
            ->where('status', 'Ativo')
            ->where('dt_fim', '<=', $agora)
            ->update(['status' => 'Concluído']);

        // Pendentes: expira por dt_fim OU por dt_prazo_assinatura (tempo de assinatura)
        $idsPendentesExpirados = Contrato::query()
            ->whereHas('participantes', fn ($q) => $q->where('usuario_id', $usuario->id))
            ->where('status', 'Pendente')
            ->where(function ($q) use ($agora) {
                $q->where('dt_fim', '<=', $agora)
                    ->orWhere(function ($sub) use ($agora) {
                        $sub->whereNotNull('dt_prazo_assinatura')
                            ->where('dt_prazo_assinatura', '<=', $agora);
                    });
            })
            ->pluck('id');

        if ($idsPendentesExpirados->isNotEmpty()) {
            Contrato::whereIn('id', $idsPendentesExpirados)->update(['status' => 'Expirado']);
        }
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
