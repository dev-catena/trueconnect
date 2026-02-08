<?php

namespace App\Models;

use App\Models\Funcionalidade\Funcionalidade;
use App\Models\Funcionalidade\Grupo;
use App\Models\Funcionalidade\GrupoFuncionalidade;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        // Campos do App
        'codigo',
        'nome_completo',
        'CPF',
        'pais',
        'estado',
        'cidade',
        'endereco',
        'profissao',
        'dt_nascimento',
        'caminho_foto',
        'renda_classe',
        'bairro',
        'cep',
        'endereco_numero',
        'complemento',
        // Campos da Web
        'name',
        'email',
        'password',
        'role',
        'google_id',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'dt_nascimento'     => 'datetime',
        'deleted_at'        => 'datetime',
        'password'          => 'hashed',
    ];

    // Relacionamentos do App
    public function respostasPerguntasContrato()
    {
        return $this->hasMany(ContratoUsuarioPergunta::class, 'usuario_id');
    }

    public function grupo()
    {
        return $this->belongsToMany(Grupo::class, 'grupo_usuario', 'usuario_id', 'grupo_id');
    }

    public function funcionalidade()
    {
        return $this->hasManyThrough(
            Funcionalidade::class,
            GrupoFuncionalidade::class,
            'grupo_id',
            'id',
            'id',
            'funcionalidade_id'
        );
    }

    public function usuarioSelos()
    {
        return $this->hasMany(UsuarioSelo::class, 'usuario_id');
    }

    public function selosAtivos()
    {
        return $this->hasMany(UsuarioSelo::class, 'usuario_id')
            ->where('verificado', true)
            ->where(function ($query) {
                $query->whereNull('expira_em')->orWhere('expira_em', '>', now());
            });
    }

    public function selosPendentes()
    {
        return $this->hasMany(UsuarioSelo::class, 'usuario_id')
            ->where(function ($query) {
                $query->whereNull('verificado')->orWhere('verificado', false);
            })
            ->where(function ($query) {
                $query->whereNull('expira_em')->orWhere('expira_em', '>', now());
            });
    }

    public function selosExpirados()
    {
        return $this->hasMany(UsuarioSelo::class, 'usuario_id')
            ->whereNotNull('expira_em')
            ->where('expira_em', '<=', now());
    }

    public function selosCancelados()
    {
        return $this->hasMany(UsuarioSelo::class, 'usuario_id')
            ->onlyTrashed();
    }

    public function conexoesRecebidasAtivas()
    {
        return $this->hasMany(UsuarioConexao::class, 'destinatario_id')
            ->where('aceito', true);
    }

    public function conexoesRecebidasPendentes()
    {
        return $this->hasMany(UsuarioConexao::class, 'destinatario_id')
            ->whereNull('aceito');
    }

    public function contratosContratante()
    {
        return $this->hasMany(Contrato::class, 'contratante_id');
    }

    public function contratosParticipante()
    {
        return $this->hasMany(ContratoUsuario::class, 'usuario_id')
            ->with('contrato');
    }

    public function contratoLogs()
    {
        return $this->hasMany(ContratoLog::class, 'usuario_id');
    }

    public function contratoUsuarios()
    {
        return $this->hasMany(ContratoUsuario::class, 'usuario_id');
    }

    public function contarContratosPorStatus()
    {
        $comoContratante = $this->contratosContratante
            ->groupBy('status')
            ->map(fn($group) => $group->count());

        $comoParticipante = $this->contratosParticipante
            ->pluck('contrato')
            ->filter()
            ->groupBy('status')
            ->map(fn($group) => $group->count());

        return collect(['Pendente', 'Ativo', 'Concluído', 'Suspenso'])->mapWithKeys(function ($status) use ($comoContratante, $comoParticipante) {
            return [
                $status => ($comoContratante[$status] ?? 0) + ($comoParticipante[$status] ?? 0)
            ];
        });
    }

    public function contratos()
    {
        return $this->belongsToMany(Contrato::class, 'contrato_usuarios', 'usuario_id', 'contrato_id')
            ->withTimestamps();
    }

    // Relacionamentos da Web
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)->where('status', 'active');
    }

    public function loginHistories()
    {
        return $this->hasMany(LoginHistory::class);
    }

    public function userSeals()
    {
        return $this->hasMany(UserSeal::class);
    }

    public function sealRequests()
    {
        return $this->hasMany(SealRequest::class);
    }

    // Métodos auxiliares
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isServiceDesk()
    {
        return $this->role === 'servicedesk';
    }
}
