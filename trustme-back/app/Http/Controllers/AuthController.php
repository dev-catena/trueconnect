<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use App\Models\LoginHistory;
use App\Models\Contrato;
use App\Models\UsuarioChave;
use App\Mail\ChaveAcesso;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Suporta login por email (web) ou CPF (app)
        $validator = Validator::make($request->all(), [
            'email' => 'sometimes|email',
            'CPF' => 'sometimes|string',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Determina se é login por email ou CPF
        if ($request->has('email')) {
            $user = User::where('email', $request->email)->first();
        } elseif ($request->has('CPF')) {
            // Normalizar CPF: remover pontos, traços e espaços
            $cpf = preg_replace('/[^0-9]/', '', $request->CPF);
            
            // Buscar usuário por CPF normalizado ou com formatação
            $user = User::where(function($query) use ($cpf, $request) {
                $query->where('CPF', $cpf)
                      ->orWhere('CPF', $request->CPF); // Também tenta com formatação original
            })->first();
            
            // Log para debug (apenas em desenvolvimento)
            if (config('app.debug')) {
                \Log::info('Login attempt', [
                    'cpf_received' => $request->CPF,
                    'cpf_normalized' => $cpf,
                    'user_found' => $user ? $user->id : null
                ]);
            }
        } else {
            return response()->json(['message' => 'Email ou CPF é obrigatório'], 422);
        }

        if (!$user) {
            return response()->json(['message' => 'Credenciais inválidas'], 401);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciais inválidas'], 401);
        }

        // Atualiza contratos expirados (para app)
        if ($request->has('CPF')) {
            $this->atualizarContratosExpiradosDoUsuario($user);
        }

        // Expiração em 14 dias (app) ou sem expiração (web)
        $expires_at = $request->has('CPF') ? now()->addDays(14) : null;
        $tokenName = $request->has('CPF') ? 'usuarioLogado' : 'auth_token';

        $token = $user->createToken($tokenName)->plainTextToken;

        // Atualiza expiração do token se necessário
        if ($expires_at) {
            $user->tokens()
                ->where('name', $tokenName)
                ->latest()
                ->first()
                ->update(['expires_at' => $expires_at]);
        }

        // Atualiza o histórico de login (web)
        if ($request->has('email') && class_exists(LoginHistory::class)) {
            $loginHistory = LoginHistory::firstOrNew(['user_id' => $user->id]);
            if (!$loginHistory->first_login_at) {
                $loginHistory->first_login_at = Carbon::now();
            }
            $loginHistory->last_login_at = Carbon::now();
            $loginHistory->save();
        }

        // Resposta para app
        if ($request->has('CPF')) {
            return $this->ok('Login realizado com sucesso.', [
                'token' => $token,
                'expires_at' => $expires_at->toIso8601String()
            ]);
        }

        // Resposta para web - garantir que ambos os campos estejam presentes
        $userName = $user->name ?: $user->nome_completo;
        $userNomeCompleto = $user->nome_completo ?: $user->name;
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $userName,
                'nome_completo' => $userNomeCompleto,
                'email' => $user->email,
                'role' => $user->role
            ],
            'token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    public function usuFunc()
    {
        $usuario = Auth::user();

        if (!$usuario) {
            return $this->fail('Usuário não autenticado.', null, 401);
        }

        $funcionalidadeIds = $usuario->funcionalidade()
            ->select('funcionalidade.id')
            ->pluck('funcionalidade.id')
            ->unique()
            ->values();

        return response()->json([
            'usuario' => ['nome_completo' => $usuario->nome_completo],
            'funcionalidade_id' => $funcionalidadeIds,
        ]);
    }

    public function alterarSenha(Request $request)
    {
        $usuario = auth()->user();

        if (!$usuario) {
            return $this->fail('Usuário não autenticado', null, 401);
        }

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed|different:current_password',
        ]);

        // Verifica se a senha atual está correta
        if (!Hash::check($request->input('current_password'), $usuario->password)) {
            return $this->fail('Senha atual incorreta', null, 400);
        }

        // Atualiza a senha do usuário
        $usuario->update([
            'password' => Hash::make($request->input('new_password')),
        ]);

        return $this->ok('Senha alterada com sucesso', null, 200);
    }

    private function atualizarContratosExpiradosDoUsuario(User $usuario)
    {
        if (!class_exists(Contrato::class)) {
            return;
        }

        $agora = Carbon::now('America/Sao_Paulo');

        $vencidos = Contrato::query()
            ->whereHas('participantes', fn($q) => $q->where('usuario_id', $usuario->id))
            ->where('dt_fim', '<=', $agora)
            ->whereIn('status', ['Ativo', 'Pendente'])
            ->get()
            ->groupBy('status');

        if (isset($vencidos['Ativo'])) {
            Contrato::whereIn('id', $vencidos['Ativo']->pluck('id'))
                ->update(['status' => 'Concluído']);
        }
        if (isset($vencidos['Pendente'])) {
            Contrato::whereIn('id', $vencidos['Pendente']->pluck('id'))
                ->update(['status' => 'Expirado']);
        }
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nome_completo' => 'required|string|max:255',
            'CPF' => 'required|string|max:255|unique:users,CPF',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'dt_nascimento' => 'nullable|date',
            'cep' => 'nullable|string|max:255',
            'endereco' => 'nullable|string|max:255',
            'endereco_numero' => 'nullable|string|max:255',
            'complemento' => 'nullable|string|max:255',
            'bairro' => 'nullable|string|max:255',
            'cidade' => 'nullable|string|max:255',
            'estado' => 'nullable|string|max:255',
            'pais' => 'nullable|string|max:255',
            'profissao' => 'nullable|string|max:255',
            'renda_classe' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userData = [
            'nome_completo' => $request->nome_completo,
            'name' => $request->nome_completo, // Mantém compatibilidade com web
            'CPF' => $request->CPF,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
        ];

        // Adiciona campos opcionais se fornecidos
        if ($request->has('dt_nascimento') && $request->dt_nascimento) {
            try {
                // Converte para Carbon e depois para formato timestamp do MySQL
                // Usa toDateTimeString() que retorna o formato correto Y-m-d H:i:s
                $date = Carbon::parse($request->dt_nascimento)->startOfDay();
                $userData['dt_nascimento'] = $date->toDateTimeString();
            } catch (\Exception $e) {
                // Se falhar o parse, tenta extrair apenas a data da string ISO e adicionar hora
                $dateStr = $request->dt_nascimento;
                if (strpos($dateStr, 'T') !== false) {
                    $dateParts = explode('T', $dateStr);
                    $dateOnly = $dateParts[0];
                    $userData['dt_nascimento'] = $dateOnly . ' 00:00:00';
                } else {
                    $userData['dt_nascimento'] = $dateStr . ' 00:00:00';
                }
            }
        }
        if ($request->has('cep')) {
            $userData['cep'] = $request->cep;
        }
        if ($request->has('endereco')) {
            $userData['endereco'] = $request->endereco;
        }
        if ($request->has('endereco_numero')) {
            $userData['endereco_numero'] = $request->endereco_numero;
        }
        if ($request->has('complemento')) {
            $userData['complemento'] = $request->complemento;
        }
        if ($request->has('bairro')) {
            $userData['bairro'] = $request->bairro;
        }
        if ($request->has('cidade')) {
            $userData['cidade'] = $request->cidade;
        }
        if ($request->has('estado')) {
            $userData['estado'] = $request->estado;
        }
        if ($request->has('pais')) {
            $userData['pais'] = $request->pais;
        }
        if ($request->has('profissao')) {
            $userData['profissao'] = $request->profissao;
        }
        if ($request->has('renda_classe')) {
            $userData['renda_classe'] = $request->renda_classe;
        }

        $user = User::create($userData);

        $token = $user->createToken('usuarioLogado')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'nome_completo' => $user->nome_completo,
                'name' => $user->name ?? $user->nome_completo,
                'email' => $user->email,
                'CPF' => $user->CPF,
                'role' => $user->role
            ],
            'token' => $token,
            'token_type' => 'Bearer'
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout realizado com sucesso']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        // Garantir que name esteja preenchido (usando nome_completo se necessário)
        $name = $user->name ?: $user->nome_completo;
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $name,
                'nome_completo' => $user->nome_completo ?: $user->name,
                'email' => $user->email,
                'role' => $user->role
            ]
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $usuario = User::where('email', $request->input('email'))->first();

            if (!$usuario) {
                // Por segurança, não revelar se o email existe ou não
                return response()->json([
                    'success' => true,
                    'message' => 'Se o email estiver cadastrado, você receberá um código de recuperação.'
                ], 200);
            }

            // Usar o mesmo sistema de códigos que funciona no app
            $chaveAleatoria = str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);

            // Remover códigos anteriores do usuário
            try {
                UsuarioChave::where('usuario_id', $usuario->id)
                    ->where('tipo', 'redefinicao')
                    ->delete();
            } catch (\Exception $deleteException) {
                \Log::warning('Erro ao deletar códigos anteriores:', [
                    'error' => $deleteException->getMessage(),
                    'usuario_id' => $usuario->id
                ]);
                // Continuar mesmo se falhar ao deletar códigos antigos
            }

            // Criar novo código
            try {
                UsuarioChave::create([
                    'usuario_id' => $usuario->id,
                    'chave' => $chaveAleatoria,
                    'expires_at' => now()->addMinutes(15),
                    'tipo' => 'redefinicao'
                ]);
            } catch (\Exception $createException) {
                \Log::error('Erro ao criar código de recuperação:', [
                    'error' => $createException->getMessage(),
                    'usuario_id' => $usuario->id
                ]);
                throw $createException; // Re-lançar para ser capturado pelo catch externo
            }

            // Enviar email com código usando Laravel Mail
            try {
                Mail::to($usuario->email)
                    ->send(new ChaveAcesso($chaveAleatoria, 'redefinicao'));
                
                \Log::info('Email de recuperação enviado com sucesso:', [
                    'email' => $usuario->email,
                    'mailer' => config('mail.default')
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Código de recuperação enviado com sucesso! Verifique sua caixa de entrada e a pasta de spam.'
                ], 200);

            } catch (\Exception $mailException) {
                \Log::error('Erro ao enviar email de recuperação de senha:', [
                    'error' => $mailException->getMessage(),
                    'trace' => $mailException->getTraceAsString(),
                    'email' => $usuario->email,
                    'mailer' => config('mail.default'),
                    'host' => config('mail.mailers.smtp.host')
                ]);

                // Em desenvolvimento, logar o código para facilitar testes
                if (config('app.debug')) {
                    \Log::info('Código de recuperação gerado (email falhou):', [
                        'email' => $usuario->email,
                        'codigo' => $chaveAleatoria,
                        'erro' => $mailException->getMessage()
                    ]);
                }

                // Retornar erro específico sobre o email
                return response()->json([
                    'success' => false,
                    'message' => 'Não foi possível enviar o email. Por favor, verifique a configuração de email do servidor ou tente novamente mais tarde.'
                ], 500);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Erros de validação já são tratados acima
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Erro ao processar recuperação de senha:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'email' => $request->input('email')
            ]);

            // Em caso de erro, ainda retornar sucesso por segurança (não revelar se email existe)
            return response()->json([
                'success' => true,
                'message' => 'Se o email estiver cadastrado, você receberá um código de recuperação.'
            ], 200);
        }
    }

    public function resetPassword(Request $request)
    {
        // Aceitar tanto token (sistema antigo) quanto código (sistema novo)
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
            'token' => 'required_without:codigo',
            'codigo' => 'required_without:token',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $usuario = User::where('email', $request->input('email'))->first();

            if (!$usuario) {
                return response()->json(['message' => 'Usuário não encontrado'], 404);
            }

            // Se usar código (sistema novo)
            if ($request->has('codigo')) {
                $chave = UsuarioChave::where('chave', $request->input('codigo'))
                    ->where('usuario_id', $usuario->id)
                    ->where('tipo', 'redefinicao')
                    ->where('expires_at', '>', now()->setTimezone('America/Sao_Paulo'))
                    ->first();

                if (!$chave) {
                    return response()->json([
                        'message' => 'Código inválido ou expirado'
                    ], 422);
                }

                // Atualizar senha
                $usuario->update([
                    'password' => Hash::make($request->input('password'))
                ]);

                // Remover código usado
                $chave->delete();

                return response()->json([
                    'success' => true,
                    'message' => 'Senha alterada com sucesso'
                ], 200);
            }

            // Se usar token (sistema antigo do Laravel)
            if ($request->has('token')) {
                $status = Password::reset(
                    $request->only('email', 'password', 'password_confirmation', 'token'),
                    function ($user, $password) {
                        $user->forceFill([
                            'password' => Hash::make($password)
                        ])->setRememberToken(Str::random(60));

                        $user->save();

                        event(new PasswordReset($user));
                    }
                );

                return $status === Password::PASSWORD_RESET
                    ? response()->json(['message' => 'Senha alterada com sucesso'])
                    : response()->json(['message' => 'Erro ao alterar senha'], 400);
            }

        } catch (\Exception $e) {
            \Log::error('Erro ao redefinir senha:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erro ao alterar senha. Por favor, tente novamente.'
            ], 500);
        }
    }
}
