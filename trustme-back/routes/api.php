<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SiteSettingController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\LoginHistoryController;
use App\Http\Controllers\ContratoTipoController;
use App\Http\Controllers\SeloController;
use App\Http\Controllers\ServiceDeskController;
use App\Http\Controllers\ServiceDeskUserController;
use App\Http\Controllers\SealRequestController;
use App\Http\Controllers\ServiceDeskSealController;
use App\Http\Controllers\ContratoClausulaController;
use App\Http\Controllers\ContratoController;
use App\Http\Controllers\ContratoUsuarioPerguntaController;
use App\Http\Controllers\Funcionalidade\FuncionalidadeController;
use App\Http\Controllers\Funcionalidade\GrupoController;
use App\Http\Controllers\Funcionalidade\ModuloController;
use App\Http\Controllers\DadosIniciaisController;
use App\Http\Controllers\PerguntaController;
use App\Http\Controllers\UsuarioChaveController;
use App\Http\Controllers\UsuarioConexaoController;
use App\Http\Controllers\UsuarioVerificacaoController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rotas públicas - Web (email)
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Rotas públicas - App (CPF)
Route::post('/login', [AuthController::class, 'login']);
Route::get('/dados-iniciais', [DadosIniciaisController::class, 'dadosIniciais']);
Route::post('/usuario/gravar', [UserController::class, 'store']);
// Listagem de selos pode ser pública (apenas visualização)
Route::get('/selos/listar', [SeloController::class, 'index']);

##### CHAVE E SENHA #####
Route::post('/acesso/enviar-codigo', [UsuarioChaveController::class, 'enviarCodigo']);
Route::post('/acesso/validar-codigo', [UsuarioChaveController::class, 'validarCodigo']);
Route::post('/acesso/redefinir-senha', [UsuarioChaveController::class, 'processarRedefinicaoSenha']);
#####

Route::get('/usuario/verificar-email/{token}', [UsuarioVerificacaoController::class, 'verificar']);
Route::post('/cadastro/verificar-dados', [UserController::class, 'verificarDados']);

// Rotas do Google OAuth
Route::get('/auth/google', [GoogleAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
Route::get('/auth/google/status', [GoogleAuthController::class, 'checkGoogleConnection']);

// Rotas públicas de conteúdo
Route::get('/plans', [PlanController::class, 'index']);
Route::get('/plans/{id}', [PlanController::class, 'show']);
Route::get('/faqs', [FaqController::class, 'index']);
Route::get('/testimonials', [TestimonialController::class, 'index']);
Route::post('/contacts', [ContactController::class, 'store']);
Route::get('/site-content', [SiteSettingController::class, 'getSiteContent']);

// Rotas públicas de pagamento
Route::get('/payment/methods', [PaymentController::class, 'getPaymentMethods']);
Route::post('/payment/webhook', [PaymentController::class, 'webhook']);

// Rotas protegidas por autenticação
Route::middleware('auth:sanctum')->group(function () {

    // Rotas do Service Desk (acessíveis por admin e servicedesk)
    Route::middleware(['auth:sanctum', 'check.servicedesk'])->prefix('servicedesk')->group(function () {
        Route::get('/dashboard', [ServiceDeskController::class, 'dashboard']);
        Route::get('/requests/recent', [ServiceDeskController::class, 'recentRequests']);
        Route::get('/users', [ServiceDeskUserController::class, 'index']);
        Route::get('/users/{id}/financial', [ServiceDeskUserController::class, 'financial']);
        Route::put('/users/{id}/password', [ServiceDeskUserController::class, 'changePassword']);
        Route::put('/users/{id}/block', [ServiceDeskUserController::class, 'block']);
        Route::get('/seals', [ServiceDeskSealController::class, 'index']);
        Route::get('/seal-types', [ServiceDeskSealController::class, 'sealTypes']);
        Route::get('/requests', [SealRequestController::class, 'index']);
        Route::get('/requests/{id}', [SealRequestController::class, 'show']);
        Route::post('/requests/{id}/approve', [SealRequestController::class, 'approve']);
        Route::post('/requests/{id}/reject', [SealRequestController::class, 'reject']);
        Route::post('/requests/{id}/revoke', [SealRequestController::class, 'revoke']);
    });

    // Autenticação
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Rotas do App
    Route::post('/usuario/enviar-verificacao', [UsuarioVerificacaoController::class, 'enviarVerificacao']);
    Route::post('/usuario/alterar-senha', [AuthController::class, 'alterarSenha']);
    // Route::get('/selos/listar', [SeloController::class, 'index']); // Movida para rotas públicas (linha 51)
    Route::post('/selos/solicitar', [SeloController::class, 'solicitar']);
    Route::post('/selos/pagamento', [SeloController::class, 'pagamento']);

    // Perfil do usuário
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);

    // Assinaturas do usuário
    Route::get('/user/subscriptions', [SubscriptionController::class, 'userSubscriptions']);
    Route::put('/user/subscriptions/{id}/cancel', [SubscriptionController::class, 'cancelUserSubscription']);
    Route::post('/user/subscriptions/compare-plan-change', [SubscriptionController::class, 'comparePlanChange']);
    Route::put('/user/subscriptions/change-plan', [SubscriptionController::class, 'changePlan']);

    // Pagamentos
    Route::post('/payment/create-preference', [PaymentController::class, 'createPreference']);
    Route::post('/payment/process', [PaymentController::class, 'processPayment']);

    // Rotas administrativas
    Route::middleware('check.admin')->group(function () {

        // Dashboard
        Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::post('/admin/users/attendant', [AdminController::class, 'createAttendant']);
        Route::get('/admin/subscriptions', [AdminController::class, 'subscriptions']);
        Route::get('/admin/contacts', [AdminController::class, 'contacts']);
        Route::get('/admin/reports', [AdminController::class, 'reports']);

        // Gestão de usuários
        Route::apiResource('users', UserController::class);

        // Gestão de planos
        Route::apiResource('plans', PlanController::class)->except(['index', 'show']);

        // Gestão de assinaturas
        Route::apiResource('subscriptions', SubscriptionController::class);
        Route::put('/subscriptions/{id}/cancel', [SubscriptionController::class, 'cancel']);

        // Gestão de FAQs
        Route::apiResource('faqs', FaqController::class)->except(['index']);

        // Gestão de depoimentos
        Route::apiResource('testimonials', TestimonialController::class)->except(['index']);

        // Gestão de contatos
        Route::apiResource('contacts', ContactController::class)->except(['store']);
        Route::post('/contacts/{id}/respond', [ContactController::class, 'respond']);
        Route::put('/contacts/{id}/status', [ContactController::class, 'updateStatus']);

        // Configurações do site
        Route::apiResource('site-settings', SiteSettingController::class);
        Route::post('/site-settings/bulk-update', [SiteSettingController::class, 'bulkUpdate']);

        // Gestão de Tipos de Contrato
        Route::apiResource('contrato-tipos', ContratoTipoController::class);

        // Gestão de Selos
        Route::apiResource('selos', SeloController::class);
        
        // Solicitações de Selos
        Route::get('/admin/seal-requests', [SealRequestController::class, 'index']);
        Route::get('/admin/seal-requests/{id}', [SealRequestController::class, 'show']);
        Route::post('/admin/seal-requests/{id}/approve', [SealRequestController::class, 'approve']);
        Route::post('/admin/seal-requests/{id}/reject', [SealRequestController::class, 'reject']);
    });

    // Histórico de Login
    Route::post('/login-history/update', [LoginHistoryController::class, 'updateLoginHistory']);
    Route::get('/login-history/all', [LoginHistoryController::class, 'getAllUsersLoginHistory'])->middleware('check.admin');
    
    // Rotas do App - Usuário
    Route::prefix('usuario')->group(function () {
        Route::get('/listar', [UserController::class, 'index']);
        Route::delete('/excluir/{id}', [UserController::class, 'destroy']);
        Route::get('/buscar/{id}', [UserController::class, 'show']);
        Route::put('/atualizar', [UserController::class, 'update']);
        Route::get('/info', [UserController::class, 'usuarioInformacoes']);
        Route::get('/dados', [UserController::class, 'usuarioDados']);
        Route::post('/grupo', [GrupoController::class, 'usuarioGrupo']);
        Route::delete('/grupo', [GrupoController::class, 'excluiUsuarioGrupo']);
        Route::post('/funcionalidades', [AuthController::class, 'usuFunc']);
        Route::get('/contratos/status', [UserController::class, 'contratosPorStatus']);
        Route::get('/contratos', [UserController::class, 'contratosDoUsuario']);
        Route::get('/{id}/selos', [UserController::class, 'selosDoUsuario']);
        Route::get('/conexoes', [UserController::class, 'conexoesDoUsuario']);
    });
    
    // Rotas do App - Grupo
    Route::prefix('grupo')->group(function () {
        Route::get('/', [GrupoController::class, 'index']);
        Route::post('/', [GrupoController::class, 'store']);
        Route::get('/{id}', [GrupoController::class, 'show']);
        Route::put('/{id}', [GrupoController::class, 'update']);
        Route::delete('/{id}', [GrupoController::class, 'destroy']);
        Route::get('/{id}/funcionalidades', [GrupoController::class, 'listaFuncGrupo']);
        Route::get('/{id}/usuarios', [GrupoController::class, 'listaUsuariosGrupo']);
    });
    
    // Rotas do App - Conexão
    Route::prefix('conexao')->group(function () {
        Route::post('/solicitar', [UsuarioConexaoController::class, 'solicitarConexao']);
        Route::post('/responder', [UsuarioConexaoController::class, 'responderConexao']);
        Route::delete('/excluir/{id}', [UsuarioConexaoController::class, 'excluirConexao']);
    });
    
    // Rotas do App - Contrato
    Route::middleware(['verifica.contratos'])->prefix('contrato')->group(function () {
        Route::get('/listar', [ContratoController::class, 'index']);
        Route::post('/gravar', [ContratoController::class, 'store']);
        Route::get('/buscar-completo/{id}', [ContratoController::class, 'showCompleto']);
        Route::patch('/atualizar/{id}', [ContratoController::class, 'update']);
        Route::delete('/excluir/{id}', [ContratoController::class, 'destroy']);
        Route::post('/clausula/aceitar', [ContratoClausulaController::class, 'aceitarClausula']);
        Route::post('/pergunta/responder', [ContratoUsuarioPerguntaController::class, 'responder']);
        Route::post('/{id}/responder', [ContratoController::class, 'responderContrato']);
        Route::post('/alterar/status', [ContratoController::class, 'alterarStatusContrato']);
    });
    
    // Rotas do App - Contrato Tipos
    Route::prefix('contrato-tipos')->group(function () {
        Route::get('/listar', [ContratoTipoController::class, 'index']);
        Route::get('/{id}/clausulas-perguntas', [ContratoTipoController::class, 'clausulasEPerguntasPorTipo']);
    });
    
    // Rotas do App - Funcionalidade
    Route::prefix('funcionalidade')->group(function () {
        Route::post('/cards/usuario', [ModuloController::class, 'ListarModulosUsuario']);
        Route::get('/', [FuncionalidadeController::class, 'index']);
        Route::post('/grupo', [FuncionalidadeController::class, 'funcionalidadeGrupo']);
        Route::post('/', [FuncionalidadeController::class, 'store']);
        Route::get('/{id}/grupos', [FuncionalidadeController::class, 'listaGruposFuncionalidade']);
        Route::delete('/grupo', [FuncionalidadeController::class, 'excluiFuncGrupo']);
    });
    
    // Rotas do App - Perguntas
    Route::prefix('perguntas')->group(function () {
        Route::get('/listar', [PerguntaController::class, 'index']);
    });
});

/**
 * Rotas de callback do Mercado Pago
 */
// Rota para sucesso no pagamento
Route::get('/payment/success', [PaymentController::class, 'success'])->name('payment.success');

// Rota para falha no pagamento
Route::get('/payment/failure', [PaymentController::class, 'failure'])->name('payment.failure');

// Rota para pagamento pendente
Route::get('/payment/pending', [PaymentController::class, 'pending'])->name('payment.pending');



// Middleware para verificar se é admin
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/check-admin', function (Request $request) {
        return response()->json([
            'is_admin' => $request->user()->isAdmin()
        ]);
    });
});
