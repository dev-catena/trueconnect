<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::when($request->role, function($query, $role) {
                return $query->where('role', $role);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function show($id)
    {
        $user = User::with(['subscriptions.plan'])->find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'in:admin,user,servicedesk',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Garantir que ambos name e nome_completo sejam preenchidos para compatibilidade
        $user = User::create([
            'name' => $request->name,
            'nome_completo' => $request->name, // Garante compatibilidade com app
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'user',
        ]);

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'Usuário criado com sucesso'
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'email' => 'string|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'in:admin,user,servicedesk',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only(['name', 'email', 'role']);
        
        // Garantir que ambos name e nome_completo sejam sincronizados
        if ($request->has('name')) {
            $data['nome_completo'] = $request->name; // Sincroniza nome_completo com name
        } elseif ($request->has('nome_completo')) {
            $data['name'] = $request->nome_completo; // Sincroniza name com nome_completo
        }
        
        if ($request->password) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'Usuário atualizado com sucesso'
        ]);
    }

    public function destroy($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não encontrado'
            ], 404);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuário excluído com sucesso'
        ]);
    }

    public function profile(Request $request)
    {
        $user = $request->user()->load(['subscriptions.plan']);

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'email' => 'string|email|max:255|unique:users,email,' . $user->id,
            'current_password' => 'nullable|string|required_with:password',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Se está tentando alterar a senha, validar a senha atual
        if ($request->password) {
            if (!$request->current_password) {
                return response()->json([
                    'success' => false,
                    'message' => 'Senha atual é obrigatória para alterar a senha'
                ], 422);
            }

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Senha atual incorreta'
                ], 422);
            }
        }

        $data = $request->only(['name', 'email']);
        
        // Garantir que ambos name e nome_completo sejam sincronizados
        if ($request->has('name')) {
            $data['nome_completo'] = $request->name; // Sincroniza nome_completo com name
        } elseif ($request->has('nome_completo')) {
            $data['name'] = $request->nome_completo; // Sincroniza name com nome_completo
        }
        
        if ($request->password) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'Perfil atualizado com sucesso'
        ]);
    }

    // Métodos do App
    public function verificarDados(Request $request)
    {
        // token manual
        $token = $request->bearerToken();
        $usuario = null;

        if ($token) {
            $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

            if ($accessToken) {
                $usuario = $accessToken->tokenable;
            }
        }

        // Validação
        $validated = $request->validate([
            'email' => 'sometimes|email',
            'CPF'   => 'sometimes|string|max:255',
        ]);

        $email = $validated['email'] ?? null;
        $cpf   = $validated['CPF']   ?? null;

        if (!$email && !$cpf) {
            return $this->fail('Informe CPF ou e-mail para verificação.', null, 422);
        }

        // Se usuário autenticado, excluir ele da verificação
        if ($usuario) {
            $result = [
                'email_exists' => $email
                    ? User::where('email', $email)
                    ->whereNull('deleted_at')
                    ->where('id', '!=', $usuario->id)
                    ->exists()
                    : false,

                'cpf_exists' => $cpf
                    ? User::where('CPF', $cpf)
                    ->whereNull('deleted_at')
                    ->where('id', '!=', $usuario->id)
                    ->exists()
                    : false,
            ];

            return $this->ok('OK', $result);
        }

        // verificação normal
        $result = [
            'email_exists' => $email
                ? User::where('email', $email)
                ->whereNull('deleted_at')
                ->exists()
                : false,

            'cpf_exists' => $cpf
                ? User::where('CPF', $cpf)
                ->whereNull('deleted_at')
                ->exists()
                : false,
        ];

        return $this->ok('OK', $result);
    }

    public function usuarioInformacoes()
    {
        $usuario = \Illuminate\Support\Facades\Auth::user();
        if (!$usuario) {
            return $this->fail('Usuário não autenticado.', null, 401);
        }

        $usuario->load([
            'contratosContratante',
            'contratosParticipante.contrato',
            'usuarioSelos',
            'conexoesRecebidasAtivas',
            'conexoesRecebidasPendentes',
        ]);

        $result = [
            'usuario_id' => $usuario->id,
            'codigo' => $usuario->codigo,
            'CPF' => $usuario->CPF,
            'nome_completo' => $usuario->nome_completo,
            'caminho_foto' => $usuario->caminho_foto,

            'contratos_por_status' => $usuario->contarContratosPorStatus(),
            'selos_por_status' => [
                'ativos'     => $usuario->selosAtivos()->count(),
                'pendentes'  => $usuario->selosPendentes()->count(),
                'expirados'  => $usuario->selosExpirados()->count(),
                'cancelados' => $usuario->selosCancelados()->count(),
            ],
            'conexoes' => [
                'ativas'    => $usuario->conexoesRecebidasAtivas->count(),
                'pendentes' => $usuario->conexoesRecebidasPendentes->count(),
            ]
        ];

        return $this->ok('Informações do usuário recuperadas com sucesso.', $result);
    }

    public function usuarioDados()
    {
        $usuario = \Illuminate\Support\Facades\Auth::user();
        if (!$usuario) {
            return $this->fail('Usuário não autenticado.', null, 401);
        }

        $createdAtLocal = \Carbon\Carbon::parse($usuario->created_at)
            ->timezone('America/Sao_Paulo')
            ->format('d/m/Y H:i');

        $usuarioDados = $usuario->toArray();
        $usuarioDados['created_at_local'] = $createdAtLocal;

        return $this->ok('Dados do usuário recuperados com sucesso.', $usuarioDados);
    }

    public function contratosPorStatus()
    {
        $usuario = \Illuminate\Support\Facades\Auth::user();
        if (!$usuario) {
            return $this->fail('Usuário não autenticado.', null, 401);
        }

        return $this->ok('OK', $usuario->contarContratosPorStatus());
    }

    public function contratosDoUsuario()
    {
        $usuario = \Illuminate\Support\Facades\Auth::user();
        if (!$usuario) {
            return $this->fail('Usuário não autenticado.', null, 401);
        }

        // Contratos onde é contratante
        $contratosContratante = $usuario->contratosContratante()
            ->with([
                'tipo:id,codigo,descricao',
                'contratante:id,nome_completo,email,CPF',
                'participantes.usuario:id,nome_completo,email,CPF'
            ])
            ->get();

        foreach ($contratosContratante as $contrato) {
            $this->verificarExpiracaoContrato($contrato);
        }

        $contratosContratanteTransformado = $contratosContratante->map(function ($contrato) {
            return [
                'id'          => $contrato->id,
                'codigo'      => $contrato->codigo,
                'descricao'   => $contrato->descricao,
                'status'      => $contrato->status,
                'duracao'     => $contrato->duracao,
                'dt_inicio'   => $contrato->dt_inicio,
                'dt_fim'      => $contrato->dt_fim,
                'tipo'        => $contrato->tipo,
                'contratante' => $contrato->contratante,
                'participantes' => $contrato->participantes->map(function ($p) {
                    return [
                        'id'           => $p->usuario->id,
                        'nome_completo' => $p->usuario->nome_completo,
                        'email'        => $p->usuario->email,
                        'CPF'          => $p->usuario->CPF,
                        'aceito'       => $p->aceito,
                        'dt_aceito'    => $p->dt_aceito,
                    ];
                }),
            ];
        });

        $idsContratante = $contratosContratante->pluck('id')->toArray();

        // Contratos onde é participante (mas não contratante)
        $contratosParticipante = $usuario->contratosParticipante()
            ->with([
                'contrato.tipo:id,codigo,descricao',
                'contrato.contratante:id,nome_completo,email,CPF',
                'contrato.participantes.usuario:id,nome_completo,email,CPF'
            ])
            ->get()
            ->pluck('contrato')
            ->filter(fn($contrato) => !in_array($contrato->id, $idsContratante));

        foreach ($contratosParticipante as $contrato) {
            $this->verificarExpiracaoContrato($contrato);
        }

        $contratosParticipanteTransformado = $contratosParticipante->map(function ($contrato) {
            return [
                'id'          => $contrato->id,
                'codigo'      => $contrato->codigo,
                'descricao'   => $contrato->descricao,
                'status'      => $contrato->status,
                'duracao'     => $contrato->duracao,
                'dt_inicio'   => $contrato->dt_inicio,
                'dt_fim'      => $contrato->dt_fim,
                'tipo'        => $contrato->tipo,
                'contratante' => $contrato->contratante,
                'participantes' => $contrato->participantes->map(function ($p) {
                    return [
                        'id'           => $p->usuario->id,
                        'nome_completo' => $p->usuario->nome_completo,
                        'email'        => $p->usuario->email,
                        'CPF'          => $p->usuario->CPF,
                        'aceito'       => $p->aceito,
                        'dt_aceito'    => $p->dt_aceito,
                    ];
                }),
            ];
        })->values();

        $result = [
            'contratos_como_contratante'  => $contratosContratanteTransformado,
            'contratos_como_participante' => $contratosParticipanteTransformado,
        ];

        return $this->ok('Contratos do usuário recuperados com sucesso.', $result);
    }

    private function verificarExpiracaoContrato($contrato)
    {
        if (!class_exists(\App\Models\Contrato::class)) {
            return;
        }

        $agora = now('America/Sao_Paulo');
        $dtFim = \Carbon\Carbon::parse($contrato->dt_fim, 'America/Sao_Paulo');

        if ($dtFim <= $agora) {
            if ($contrato->status === 'Ativo') {
                $contrato->update(['status' => 'Concluído']);
            } elseif ($contrato->status === 'Pendente') {
                $contrato->update(['status' => 'Expirado']);
            }
        }
    }

    public function selosDoUsuario($id)
    {
        $usuario = User::find($id);
        if (!$usuario) {
            return $this->fail('Usuário não encontrado.', null, 404);
        }

        $usuario->load([
            'selosAtivos.selo',
            'selosPendentes.selo',
            'selosExpirados.selo',
            'selosCancelados.selo',
            'userSeals.sealType', // Carregar UserSeal (novo modelo)
        ]);

        $formatar = fn($selo) => [
            'id'         => $selo->id,
            'verificado' => $selo->verificado,
            'expira_em'  => $selo->expira_em,
            'obtido_em'  => $selo->obtido_em,
            'selo'       => [
                'id'         => $selo->selo->id ?? null,
                'codigo'     => $selo->selo->codigo ?? null,
                'descricao'  => $selo->selo->descricao ?? null,
                'disponivel' => $selo->selo->disponivel ?? null,
                'validade'   => $selo->selo->validade ?? null,
            ]
        ];

        // Processar UserSeal (novo modelo) e converter para formato compatível
        $userSealsAtivos = [];
        $userSealsPendentes = [];
        $userSealsRejeitados = [];
        $userSealsExpirados = [];

        foreach ($usuario->userSeals as $userSeal) {
            // Buscar o Selo correspondente pelo código do SealType
            $sealTypeCode = $userSeal->sealType->code ?? null;
            if (!$sealTypeCode) {
                \Log::warning("UserSeal {$userSeal->id} não tem SealType ou código");
                continue;
            }
            
            $selo = \App\Models\Selo::where('codigo', $sealTypeCode)->first();
            
            if ($selo) {
                \Log::debug("Mapeando UserSeal {$userSeal->id} (status: {$userSeal->status}) para Selo {$selo->id} (código: {$selo->codigo})");
                $formattedSeal = [
                    'id' => $userSeal->id,
                    'selo_id' => $selo->id,
                    'verificado' => $userSeal->status === 'approved',
                    'expira_em' => $userSeal->expires_at ? $userSeal->expires_at->toIso8601String() : null,
                    'obtido_em' => $userSeal->approved_at ? $userSeal->approved_at->toIso8601String() : null,
                    'selo' => [
                        'id' => $selo->id,
                        'codigo' => $selo->codigo,
                        'descricao' => $selo->descricao ?? null,
                        'disponivel' => $selo->disponivel ?? null,
                        'validade' => $selo->validade ?? null,
                    ]
                ];

                // Classificar por status
                switch ($userSeal->status) {
                    case 'approved':
                        $userSealsAtivos[] = $formattedSeal;
                        break;
                    case 'pending':
                    case 'under_review':
                        $userSealsPendentes[] = $formattedSeal;
                        break;
                    case 'rejected':
                        $userSealsRejeitados[] = $formattedSeal;
                        break;
                    case 'expired':
                        $userSealsExpirados[] = $formattedSeal;
                        break;
                }
            }
        }

        // Combinar selos antigos (UsuarioSelo) com novos (UserSeal)
        $result = [
            'usuario_id'   => $usuario->id,
            'nome_completo' => $usuario->nome_completo,
            'ativos'       => array_merge($usuario->selosAtivos->map($formatar)->toArray(), $userSealsAtivos),
            'pendentes'    => array_merge($usuario->selosPendentes->map($formatar)->toArray(), $userSealsPendentes),
            'expirados'    => array_merge($usuario->selosExpirados->map($formatar)->toArray(), $userSealsExpirados),
            'cancelados'   => array_merge($usuario->selosCancelados->map($formatar)->toArray(), $userSealsRejeitados),
        ];

        return $this->ok('Selos do usuário recuperados com sucesso.', $result);
    }

    public function conexoesDoUsuario()
    {
        $usuario = \Illuminate\Support\Facades\Auth::user();
        if (!$usuario) {
            return $this->fail('Usuário não autenticado.', null, 401);
        }

        $conexoes = \App\Models\UsuarioConexao::with([
            'solicitante:id,codigo,nome_completo,email,pais,cidade,estado,dt_nascimento,profissao,renda_classe,created_at',
            'destinatario:id,codigo,nome_completo,email,pais,cidade,estado,dt_nascimento,profissao,renda_classe,created_at'
        ])
            ->where(function ($query) use ($usuario) {
                $query->where('destinatario_id', $usuario->id)
                    ->orWhere('solicitante_id', $usuario->id);
            })
            ->get();

        // pendentes (usuário precisa aceitar)
        $pendentes = $conexoes->filter(fn($c) => is_null($c->aceito) && $c->destinatario_id === $usuario->id)
            ->map(fn($c) => [
                'id'              => $c->id,
                'solicitante_id'  => $c->solicitante_id,
                'destinatario_id' => $c->destinatario_id,
                'created_at'      => $c->created_at->timezone('America/Sao_Paulo')->toIso8601String(),
                'conectado_com'   => [
                    'id'            => $c->solicitante->id,
                    'codigo'        => $c->solicitante->codigo,
                    'nome_completo' => $c->solicitante->nome_completo,
                    'email'         => $c->solicitante->email,
                    'pais'          => $c->solicitante->pais,
                    'cidade'        => $c->solicitante->cidade,
                    'estado'        => $c->solicitante->estado,
                    'dt_nascimento' => $c->solicitante->dt_nascimento,
                    'profissao'     => $c->solicitante->profissao,
                    'renda_classe'  => $c->solicitante->renda_classe,
                    'created_at'    => $c->solicitante->created_at->timezone('America/Sao_Paulo')->toIso8601String(),
                ]
            ]);

        // ativas (aceitas)
        $ativas = $conexoes->filter(fn($c) => $c->aceito === true)
            ->map(function ($c) use ($usuario) {
                $outro = $c->solicitante_id === $usuario->id ? $c->destinatario : $c->solicitante;

                return [
                    'id'              => $c->id,
                    'solicitante_id'  => $c->solicitante_id,
                    'destinatario_id' => $c->destinatario_id,
                    'created_at'      => $c->created_at->timezone('America/Sao_Paulo')->toIso8601String(),
                    'conectado_com'   => [
                        'id'            => $outro->id,
                        'codigo'        => $outro->codigo,
                        'nome_completo' => $outro->nome_completo,
                        'email'         => $outro->email,
                        'pais'          => $outro->pais,
                        'cidade'        => $outro->cidade,
                        'estado'        => $outro->estado,
                        'dt_nascimento' => $outro->dt_nascimento,
                        'profissao'     => $outro->profissao,
                        'renda_classe'  => $outro->renda_classe,
                        'created_at'    => $outro->created_at->timezone('America/Sao_Paulo')->toIso8601String(),
                    ]
                ];
            });

        // aguardando resposta (usuário solicitou)
        $aguardandoResposta = $conexoes->filter(fn($c) => is_null($c->aceito) && $c->solicitante_id === $usuario->id)
            ->map(fn($c) => [
                'id'              => $c->id,
                'solicitante_id'  => $c->solicitante_id,
                'destinatario_id' => $c->destinatario_id,
                'created_at'      => $c->created_at->timezone('America/Sao_Paulo')->toIso8601String(),
                'conectado_com'   => [
                    'id'            => $c->destinatario->id,
                    'codigo'        => $c->destinatario->codigo,
                    'nome_completo' => $c->destinatario->nome_completo,
                    'email'         => $c->destinatario->email,
                    'pais'          => $c->destinatario->pais,
                    'cidade'        => $c->destinatario->cidade,
                    'estado'        => $c->destinatario->estado,
                    'dt_nascimento' => $c->destinatario->dt_nascimento,
                    'profissao'     => $c->destinatario->profissao,
                    'renda_classe'  => $c->destinatario->renda_classe,
                    'created_at'    => $c->destinatario->created_at->timezone('America/Sao_Paulo')->toIso8601String(),
                ]
            ]);

        $result = [
            'aguardando_resposta' => $aguardandoResposta->values(),
            'pendentes'           => $pendentes->values(),
            'ativas'              => $ativas->values(),
        ];

        return $this->ok('Conexões do usuário recuperadas com sucesso.', $result);
    }
}
