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

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)->where('status', 'active');
    }

    public function additionalPurchases()
    {
        return $this->hasMany(AdditionalPurchase::class);
    }

    /**
     * Retorna o limite total de contratos (plano + compras adicionais)
     */
    public function getTotalContractsLimit()
    {
        $activeSubscription = $this->activeSubscription;
        $planLimit = $activeSubscription?->plan?->contracts_limit ?? 0;
        
        // Se o plano é ilimitado, retorna null
        if ($planLimit === null) {
            return null;
        }

        $additionalContracts = AdditionalPurchase::getTotalAdditionalContracts($this->id);
        return $planLimit + $additionalContracts;
    }

    /**
     * Retorna o limite total de conexões (plano + compras adicionais)
     * Por enquanto, conexões são ilimitadas, mas podemos adicionar limite no futuro
     */
    public function getTotalConnectionsLimit()
    {
        // Por enquanto, conexões são ilimitadas
        return null;
    }

    /**
     * Verifica se o usuário pode criar mais contratos
     */
    public function canCreateContract()
    {
        $limit = $this->getTotalContractsLimit();
        
        // Se ilimitado, sempre pode criar
        if ($limit === null) {
            return true;
        }

        $currentCount = $this->contratosContratante()
            ->whereIn('status', ['Ativo', 'Pendente'])
            ->count();

        return $currentCount < $limit;
    }

    /**
     * Verifica se o usuário pode criar mais conexões
     */
    public function canCreateConnection()
    {
        $limit = $this->getTotalConnectionsLimit();
        
        // Se ilimitado, sempre pode criar
        if ($limit === null) {
            return true;
        }

        $currentCount = \App\Models\UsuarioConexao::where(function($query) {
            $query->where('solicitante_id', $this->id)
                  ->orWhere('destinatario_id', $this->id);
        })
        ->where('aceito', true)
        ->whereNull('deleted_at')
        ->count();

        return $currentCount < $limit;
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
