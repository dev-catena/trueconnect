<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

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
            'codigo' => User::generateUniqueCode(), // Gerar código de 6 dígitos
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
            'codigo' => str_pad((string)$usuario->codigo, 6, '0', STR_PAD_LEFT),
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

        // Garantir que o usuário tenha um código de 6 dígitos
        if (!$usuario->codigo) {
            $usuario->codigo = User::generateUniqueCode();
            $usuario->save();
        } else {
            $codigoStr = trim((string)$usuario->codigo);
            
            // Se tem mais de 6 dígitos, gerar um novo código
            if (strlen($codigoStr) > 6) {
                $usuario->codigo = User::generateUniqueCode();
                $usuario->save();
            } else {
                // Garantir que o código tenha 6 dígitos (preencher com zeros à esquerda se necessário)
                $codigoFormatado = str_pad($codigoStr, 6, '0', STR_PAD_LEFT);
                if ($codigoFormatado !== $codigoStr) {
                    // Verificar se o código formatado já existe
                    $existe = User::where('codigo', $codigoFormatado)
                        ->where('id', '!=', $usuario->id)
                        ->exists();
                    
                    if (!$existe) {
                        $usuario->codigo = $codigoFormatado;
                        $usuario->save();
                    } else {
                        // Se o código formatado já existe, gerar um novo
                        $usuario->codigo = User::generateUniqueCode();
                        $usuario->save();
                    }
                }
            }
        }

        $createdAtLocal = \Carbon\Carbon::parse($usuario->created_at)
            ->timezone('America/Sao_Paulo')
            ->format('d/m/Y H:i');

        $usuarioDados = $usuario->toArray();
        $usuarioDados['created_at_local'] = $createdAtLocal;
        // Garantir que o código seja sempre formatado com 6 dígitos na resposta
        if (isset($usuarioDados['codigo'])) {
            $usuarioDados['codigo'] = str_pad($usuarioDados['codigo'], 6, '0', STR_PAD_LEFT);
        }
        // Não modificar o caminho_foto - deixar o frontend construir a URL completa
        // O caminho_foto será retornado como está no banco (/storage/user_photos/...)

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
                'dt_prazo_assinatura' => $contrato->dt_prazo_assinatura,
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
                'dt_prazo_assinatura' => $contrato->dt_prazo_assinatura,
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
        try {
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

            $formatar = function($selo) {
                if (!$selo || !$selo->selo) {
                    return null;
                }
                return [
                    'id'         => $selo->id ?? null,
                    'verificado' => $selo->verificado ?? false,
                    'expira_em'  => $selo->expira_em ?? null,
                    'obtido_em'  => $selo->obtido_em ?? null,
                    'selo'       => [
                        'id'         => $selo->selo->id ?? null,
                        'codigo'     => $selo->selo->codigo ?? null,
                        'descricao'  => $selo->selo->descricao ?? null,
                        'disponivel' => $selo->selo->disponivel ?? null,
                        'validade'   => $selo->selo->validade ?? null,
                    ]
                ];
            };

        // Processar UserSeal (novo modelo) e converter para formato compatível
        $userSealsAtivos = [];
        $userSealsPendentes = [];
        $userSealsRejeitados = [];
        $userSealsExpirados = [];

        foreach ($usuario->userSeals as $userSeal) {
            // Buscar o Selo correspondente pelo código do SealType
            if (!$userSeal->sealType) {
                \Log::warning("UserSeal {$userSeal->id} não tem SealType");
                continue;
            }
            
            $sealTypeCode = $userSeal->sealType->code ?? null;
            if (!$sealTypeCode) {
                \Log::warning("UserSeal {$userSeal->id} não tem código no SealType");
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
                'nome_completo' => $usuario->nome_completo ?? null,
                'ativos'       => array_merge(
                    $usuario->selosAtivos->map($formatar)->filter()->toArray(), 
                    $userSealsAtivos
                ),
                'pendentes'    => array_merge(
                    $usuario->selosPendentes->map($formatar)->filter()->toArray(), 
                    $userSealsPendentes
                ),
                'expirados'    => array_merge(
                    $usuario->selosExpirados->map($formatar)->filter()->toArray(), 
                    $userSealsExpirados
                ),
                'cancelados'   => array_merge(
                    $usuario->selosCancelados->map($formatar)->filter()->toArray(), 
                    $userSealsRejeitados
                ),
            ];

            return $this->ok('Selos do usuário recuperados com sucesso.', $result);
        } catch (\Exception $e) {
            \Log::error('Erro ao recuperar selos do usuário: ' . $e->getMessage(), [
                'user_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);
            return $this->fail('Erro ao recuperar selos do usuário.', null, 500);
        }
    }

    /**
     * Formata o código do usuário para sempre ter 6 dígitos
     */
    private function formatUserCode($code)
    {
        if (!$code) {
            return null;
        }
        $codeStr = trim((string)$code);
        // Se tem mais de 6 dígitos, retornar os últimos 6
        if (strlen($codeStr) > 6) {
            return substr($codeStr, -6);
        }
        // Se tem menos de 6 dígitos, preencher com zeros à esquerda
        return str_pad($codeStr, 6, '0', STR_PAD_LEFT);
    }

    public function conexoesDoUsuario()
    {
        try {
            $usuario = \Illuminate\Support\Facades\Auth::user();
            if (!$usuario) {
                return $this->fail('Usuário não autenticado.', null, 401);
            }

            $conexoes = \App\Models\UsuarioConexao::with([
                'solicitante:id,codigo,nome_completo,email,pais,cidade,estado,dt_nascimento,profissao,renda_classe,created_at,caminho_foto',
                'destinatario:id,codigo,nome_completo,email,pais,cidade,estado,dt_nascimento,profissao,renda_classe,created_at,caminho_foto'
            ])
                ->where(function ($query) use ($usuario) {
                    $query->where('destinatario_id', $usuario->id)
                        ->orWhere('solicitante_id', $usuario->id);
                })
                ->whereNull('deleted_at')
                ->get()
                ->filter(function($c) {
                    // Filtrar apenas conexões onde ambos os relacionamentos existem
                    return $c->solicitante && $c->destinatario;
                });

            // pendentes (usuário precisa aceitar)
            $pendentes = $conexoes->filter(function($c) use ($usuario) {
                return is_null($c->aceito) 
                    && $c->destinatario_id === $usuario->id;
            })
                ->map(function($c) {
                    return [
                        'id'              => $c->id,
                        'solicitante_id'  => $c->solicitante_id,
                        'destinatario_id' => $c->destinatario_id,
                        'aceito'          => $c->aceito,
                        'created_at'      => $c->created_at ? $c->created_at->timezone('America/Sao_Paulo')->toIso8601String() : null,
                        'solicitante'     => [
                            'id'            => $c->solicitante->id ?? null,
                            'codigo'        => $this->formatUserCode($c->solicitante->codigo ?? null),
                            'nome_completo' => $c->solicitante->nome_completo ?? null,
                            'email'         => $c->solicitante->email ?? null,
                            'caminho_foto'  => $c->solicitante->caminho_foto ?? null,
                            'pais'          => $c->solicitante->pais ?? null,
                            'cidade'        => $c->solicitante->cidade ?? null,
                            'estado'        => $c->solicitante->estado ?? null,
                            'dt_nascimento' => $c->solicitante->dt_nascimento ?? null,
                            'profissao'     => $c->solicitante->profissao ?? null,
                            'renda_classe'  => $c->solicitante->renda_classe ?? null,
                            'created_at'    => $c->solicitante->created_at ? $c->solicitante->created_at->timezone('America/Sao_Paulo')->toIso8601String() : null,
                        ],
                        'destinatario'    => [
                            'id'            => $c->destinatario->id ?? null,
                            'codigo'        => $this->formatUserCode($c->destinatario->codigo ?? null),
                            'nome_completo' => $c->destinatario->nome_completo ?? null,
                            'email'         => $c->destinatario->email ?? null,
                            'caminho_foto'  => $c->destinatario->caminho_foto ?? null,
                            'pais'          => $c->destinatario->pais ?? null,
                            'cidade'        => $c->destinatario->cidade ?? null,
                            'estado'        => $c->destinatario->estado ?? null,
                            'dt_nascimento' => $c->destinatario->dt_nascimento ?? null,
                            'profissao'     => $c->destinatario->profissao ?? null,
                            'renda_classe'  => $c->destinatario->renda_classe ?? null,
                            'created_at'    => $c->destinatario->created_at ? $c->destinatario->created_at->timezone('America/Sao_Paulo')->toIso8601String() : null,
                        ]
                    ];
                });

            // ativas (aceitas)
            $ativas = $conexoes->filter(function($c) {
                return $c->aceito === true;
            })
                ->map(function ($c) use ($usuario) {
                    return [
                        'id'              => $c->id,
                        'solicitante_id'  => $c->solicitante_id,
                        'destinatario_id' => $c->destinatario_id,
                        'aceito'          => $c->aceito,
                        'created_at'      => $c->created_at ? $c->created_at->timezone('America/Sao_Paulo')->toIso8601String() : null,
                        'solicitante'     => [
                            'id'            => $c->solicitante->id ?? null,
                            'codigo'        => $this->formatUserCode($c->solicitante->codigo ?? null),
                            'nome_completo' => $c->solicitante->nome_completo ?? null,
                            'email'         => $c->solicitante->email ?? null,
                            'caminho_foto'  => $c->solicitante->caminho_foto ?? null,
                            'pais'          => $c->solicitante->pais ?? null,
                            'cidade'        => $c->solicitante->cidade ?? null,
                            'estado'        => $c->solicitante->estado ?? null,
                            'dt_nascimento' => $c->solicitante->dt_nascimento ?? null,
                            'profissao'     => $c->solicitante->profissao ?? null,
                            'renda_classe'  => $c->solicitante->renda_classe ?? null,
                            'created_at'    => $c->solicitante->created_at ? $c->solicitante->created_at->timezone('America/Sao_Paulo')->toIso8601String() : null,
                        ],
                        'destinatario'    => [
                            'id'            => $c->destinatario->id ?? null,
                            'codigo'        => $this->formatUserCode($c->destinatario->codigo ?? null),
                            'nome_completo' => $c->destinatario->nome_completo ?? null,
                            'email'         => $c->destinatario->email ?? null,
                            'caminho_foto'  => $c->destinatario->caminho_foto ?? null,
                            'pais'          => $c->destinatario->pais ?? null,
                            'cidade'        => $c->destinatario->cidade ?? null,
                            'estado'        => $c->destinatario->estado ?? null,
                            'dt_nascimento' => $c->destinatario->dt_nascimento ?? null,
                            'profissao'     => $c->destinatario->profissao ?? null,
                            'renda_classe'  => $c->destinatario->renda_classe ?? null,
                            'created_at'    => $c->destinatario->created_at ? $c->destinatario->created_at->timezone('America/Sao_Paulo')->toIso8601String() : null,
                        ]
                    ];
                });

            // aguardando resposta (usuário solicitou)
            $aguardandoResposta = $conexoes->filter(function($c) use ($usuario) {
                return is_null($c->aceito) 
                    && $c->solicitante_id === $usuario->id;
            })
                ->map(function($c) {
                    return [
                        'id'              => $c->id,
                        'solicitante_id'  => $c->solicitante_id,
                        'destinatario_id' => $c->destinatario_id,
                        'aceito'          => $c->aceito,
                        'created_at'      => $c->created_at ? $c->created_at->timezone('America/Sao_Paulo')->toIso8601String() : null,
                        'solicitante'     => [
                            'id'            => $c->solicitante->id ?? null,
                            'codigo'        => $this->formatUserCode($c->solicitante->codigo ?? null),
                            'nome_completo' => $c->solicitante->nome_completo ?? null,
                            'email'         => $c->solicitante->email ?? null,
                            'caminho_foto'  => $c->solicitante->caminho_foto ?? null,
                            'pais'          => $c->solicitante->pais ?? null,
                            'cidade'        => $c->solicitante->cidade ?? null,
                            'estado'        => $c->solicitante->estado ?? null,
                            'dt_nascimento' => $c->solicitante->dt_nascimento ?? null,
                            'profissao'     => $c->solicitante->profissao ?? null,
                            'renda_classe'  => $c->solicitante->renda_classe ?? null,
                            'created_at'    => $c->solicitante->created_at ? $c->solicitante->created_at->timezone('America/Sao_Paulo')->toIso8601String() : null,
                        ],
                        'destinatario'    => [
                            'id'            => $c->destinatario->id ?? null,
                            'codigo'        => $this->formatUserCode($c->destinatario->codigo ?? null),
                            'nome_completo' => $c->destinatario->nome_completo ?? null,
                            'email'         => $c->destinatario->email ?? null,
                            'caminho_foto'  => $c->destinatario->caminho_foto ?? null,
                            'pais'          => $c->destinatario->pais ?? null,
                            'cidade'        => $c->destinatario->cidade ?? null,
                            'estado'        => $c->destinatario->estado ?? null,
                            'dt_nascimento' => $c->destinatario->dt_nascimento ?? null,
                            'profissao'     => $c->destinatario->profissao ?? null,
                            'renda_classe'  => $c->destinatario->renda_classe ?? null,
                            'created_at'    => $c->destinatario->created_at ? $c->destinatario->created_at->timezone('America/Sao_Paulo')->toIso8601String() : null,
                        ]
                    ];
                });

            $result = [
                'aguardando_resposta' => $aguardandoResposta->values(),
                'pendentes'           => $pendentes->values(),
                'ativas'              => $ativas->values(),
            ];

            return $this->ok('Conexões do usuário recuperadas com sucesso.', $result);
        } catch (\Exception $e) {
            \Log::error('Erro ao recuperar conexões do usuário: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->fail('Erro ao recuperar conexões do usuário.', null, 500);
        }
    }

    /**
     * Upload de foto de perfil do usuário
     */
    public function uploadFoto(Request $request)
    {
        try {
            $usuario = \Illuminate\Support\Facades\Auth::user();
            if (!$usuario) {
                return $this->fail('Usuário não autenticado.', null, 401);
            }

            $validated = $request->validate([
                'foto' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
            ]);

            // Deletar foto antiga se existir
            if ($usuario->caminho_foto) {
                $oldPath = str_replace('/storage/', '', $usuario->caminho_foto);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            // Fazer upload da nova foto
            $file = $request->file('foto');
            $fileName = 'user_' . $usuario->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('user_photos', $fileName, 'public');

            // Atualizar caminho da foto no banco
            $caminhoFoto = '/storage/' . $path;
            $usuario->caminho_foto = $caminhoFoto;
            $usuario->save();

            // Recarregar o usuário para garantir que temos os dados atualizados
            $usuario->refresh();

            return $this->ok('Foto atualizada com sucesso.', [
                'caminho_foto' => $caminhoFoto,
                'foto_url' => asset('storage/' . $path),
                'user' => [
                    'id' => $usuario->id,
                    'caminho_foto' => $caminhoFoto,
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Erro ao fazer upload de foto: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->fail('Erro ao fazer upload da foto.', null, 500);
        }
    }

    /**
     * Remove a foto de perfil do usuário
     */
    public function removerFoto()
    {
        try {
            $usuario = \Illuminate\Support\Facades\Auth::user();
            if (!$usuario) {
                return $this->fail('Usuário não autenticado.', null, 401);
            }

            if ($usuario->caminho_foto) {
                $oldPath = str_replace('/storage/', '', $usuario->caminho_foto);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $usuario->caminho_foto = null;
            $usuario->save();

            return $this->ok('Foto removida com sucesso.');
        } catch (\Exception $e) {
            \Log::error('Erro ao remover foto: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->fail('Erro ao remover foto.', null, 500);
        }
    }

}
