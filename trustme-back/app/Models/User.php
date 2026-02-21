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

    /**
     * Gera um código único de 6 dígitos para o usuário
     */
    public static function generateUniqueCode(): string
    {
        do {
            // Gera um número aleatório de 6 dígitos (000000 a 999999)
            $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            // Verifica se o código já existe
            $exists = self::where('codigo', $code)->exists();
        } while ($exists);
        
        return $code;
    }

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

    /**
     * Accessor para garantir que o código seja sempre formatado com 6 dígitos
     */
    public function getCodigoAttribute($value)
    {
        if (!$value) {
            return null;
        }
        
        // Converter para string e formatar com 6 dígitos
        $codeStr = trim((string)$value);
        
        // Se já tem 6 dígitos, retornar como está
        if (strlen($codeStr) === 6 && ctype_digit($codeStr)) {
            return $codeStr;
        }
        
        // Se tem mais de 6 dígitos, retornar os últimos 6 dígitos
        if (strlen($codeStr) > 6) {
            return substr($codeStr, -6);
        }
        
        // Se tem menos de 6 dígitos, preencher com zeros à esquerda
        return str_pad($codeStr, 6, '0', STR_PAD_LEFT);
    }

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

    /**
     * Assinatura ativa preferencial: Infinit (plan_id 2) sobre Core (plan_id 1).
     */
    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->orderByDesc('plan_id'); // Infinit (2) antes de Core (1)
    }

    public function additionalPurchases()
    {
        return $this->hasMany(AdditionalPurchase::class);
    }

    /**
     * Retorna o limite total de contratos (plano + compras adicionais)
     * null = ilimitado (ex: plano Infinit)
     * 0 = sem plano ativo que permita contratos
     */
    public function getTotalContractsLimit()
    {
        $activeSubscription = $this->activeSubscription;
        if (!$activeSubscription || !$activeSubscription->plan) {
            $additionalContracts = AdditionalPurchase::getTotalAdditionalContracts($this->id);
            return $additionalContracts > 0 ? $additionalContracts : 0;
        }

        $planLimit = $activeSubscription->plan->contracts_limit; // null = ilimitado no Infinit
        if ($planLimit === null) {
            return null; // Ilimitado
        }

        $additionalContracts = AdditionalPurchase::getTotalAdditionalContracts($this->id);
        return $planLimit + $additionalContracts;
    }

    /**
     * Retorna o limite total de conexões (plano + compras adicionais)
     * null = ilimitado
     * Sem assinatura ativa e sem compras de conexões = 0 (nenhuma conexão permitida)
     */
    public function getTotalConnectionsLimit()
    {
        $activeSubscription = $this->activeSubscription;
        $plan = $activeSubscription?->plan;
        $planLimit = $plan?->connections_limit;

        $additionalConnections = \App\Models\AdditionalPurchase::getTotalAdditionalConnections($this->id);

        // Sem assinatura ativa: só compras adicionais
        if (!$activeSubscription) {
            return $additionalConnections > 0 ? $additionalConnections : 0;
        }
        // Plano ilimitado (connections_limit = null): sem restrição
        if ($planLimit === null) {
            return null;
        }

        return $planLimit + $additionalConnections;
    }

    /**
     * Conta conexões ativas (aceitas) do usuário
     */
    public function getActiveConnectionsCount(): int
    {
        return \App\Models\UsuarioConexao::where(function($query) {
            $query->where('solicitante_id', $this->id)
                  ->orWhere('destinatario_id', $this->id);
        })
        ->where('aceito', true)
        ->whereNull('deleted_at')
        ->count();
    }

    /**
     * Conta total de conexões (pendentes + ativas) do usuário.
     * Usado para o limite único: cada conexão (pendente ou ativa) consome 1 slot.
     */
    public function getConnectionsCount(): int
    {
        return \App\Models\UsuarioConexao::where(function($query) {
            $query->where('solicitante_id', $this->id)
                  ->orWhere('destinatario_id', $this->id);
        })
        ->whereNull('deleted_at')
        ->count();
    }

    /**
     * Verifica se o usuário tem pelo menos 1 slot de conexão disponível.
     */
    public function hasConnectionSlotAvailable(): bool
    {
        $limit = $this->getTotalConnectionsLimit();
        if ($limit === null) {
            return true;
        }
        return $this->getConnectionsCount() < $limit;
    }

    /**
     * Conta contratos assinados (consumindo cota), EXCLUINDO apenas expirados.
     * Saldo = franquia do plano + compras adicionais - contratos assinados
     *
     * REGRA: Contratos "excluídos" (removidos da lista do usuário) CONTINUAM abatendo no saldo.
     * Uma vez criado, o contrato consumiu uma cota - remover da vista não libera a cota.
     * Usa withTrashed() para incluir Contratos soft-deleted (se algum dia forem deletados).
     */
    public function getContratosAssinadosCount(): int
    {
        return Contrato::where('contratante_id', $this->id)
            ->withTrashed()
            ->whereNot('status', 'Expirado')
            ->whereDoesntHave('alteracoes', fn ($q) => $q->where('tipo', 'rescindir'))
            ->count();
    }

    /**
     * Verifica se o usuário pode criar mais contratos.
     * Saldo = franquia + compras adicionais - contratos assinados (excluindo expirados)
     */
    public function canCreateContract()
    {
        $limit = $this->getTotalContractsLimit();
        
        // Se ilimitado, sempre pode criar
        if ($limit === null) {
            return true;
        }

        $contratosAssinados = $this->getContratosAssinadosCount();
        return $contratosAssinados < $limit;
    }

    /**
     * Verifica se o usuário pode solicitar nova conexão.
     * Regra única: limite de conexões (pendentes + ativas) não pode ser excedido.
     */
    public function canSendConnectionRequest(): array
    {
        $limit = $this->getTotalConnectionsLimit();
        $count = $this->getConnectionsCount();

        if ($limit !== null && $count >= $limit) {
            return [
                'can' => false,
                'block_reason' => 'conexoes',
                'resource' => 'conexões',
                'current' => $count,
                'limit' => $limit,
            ];
        }

        return ['can' => true, 'block_reason' => null];
    }

    /**
     * Verifica se o usuário pode aceitar mais conexões (mesmo critério: slots disponíveis).
     */
    public function canCreateConnection(bool $onlyAccepted = false): bool
    {
        return $this->hasConnectionSlotAvailable();
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
