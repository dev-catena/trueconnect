# Configuração do Google OAuth para Trust-me

Este documento explica como configurar o login social com Google para o projeto Trust-me.

## 1. Configuração no Google Cloud Console

### 1.1 Criar Projeto
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google+ (se necessário)

### 1.2 Configurar OAuth 2.0
1. Vá para "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure o tipo de aplicação:
   - **Application type**: Web application
   - **Name**: Trust-me OAuth Client
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (desenvolvimento)
     - `https://consentir.catenasystem.com.br` (produção)
   - **Authorized redirect URIs**:
     - `http://localhost:8000/api/auth/google/callback` (desenvolvimento)
     - `https://consentir.catenasystem.com.br:8000/api/auth/google/callback` (produção)

### 1.3 Obter Credenciais
Após criar, você receberá:
- **Client ID**
- **Client Secret**

## 2. Configuração do Backend (Laravel)

### 2.1 Variáveis de Ambiente
Adicione no arquivo `.env` do backend:

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=https://consentir.catenasystem.com.br:8000/api/auth/google/callback
```

### 2.2 Verificar Configuração
Acesse: `GET /api/auth/google/status`

## 3. Configuração do Frontend (Vue.js)

### 3.1 Variáveis de Ambiente
Crie um arquivo `.env` no frontend:

```env
VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

### 3.2 URLs de Redirecionamento
- **Desenvolvimento**: `http://localhost:5173/auth/google/callback`
- **Produção**: `https://consentir.catenasystem.com.br/auth/google/callback`

## 4. Fluxo de Autenticação

### 4.1 Login com Google
1. Usuário clica em "Continuar com Google"
2. Frontend redireciona para `/api/auth/google`
3. Backend redireciona para Google OAuth
4. Usuário autoriza no Google
5. Google redireciona para `/api/auth/google/callback`
6. Backend processa e retorna token
7. Frontend recebe token e redireciona usuário

### 4.2 Estrutura de URLs
```
Frontend: /auth/google/callback
Backend: /api/auth/google/callback
Google: https://accounts.google.com/o/oauth2/v2/auth
```

## 5. Testando a Implementação

### 5.1 Desenvolvimento Local
1. Inicie o backend: `php artisan serve --port=8000`
2. Inicie o frontend: `npm run dev`
3. Teste o login com Google

### 5.2 Produção
1. Configure as variáveis de ambiente no servidor
2. Verifique se as portas estão abertas
3. Teste o fluxo completo

## 6. Solução de Problemas

### 6.1 Erro de Redirecionamento
- Verifique se as URLs estão corretas no Google Console
- Confirme se as portas estão abertas no firewall

### 6.2 Erro de Permissões
- Verifique as permissões das pastas `storage` e `bootstrap/cache`
- Execute: `chmod -R 775 storage bootstrap/cache`

### 6.3 Erro de CORS
- Configure o CORS no Laravel se necessário
- Verifique se as origens estão permitidas

## 7. Segurança

### 7.1 Boas Práticas
- Nunca exponha o Client Secret no frontend
- Use HTTPS em produção
- Valide sempre os tokens recebidos
- Implemente rate limiting se necessário

### 7.2 Validação
- O Google já valida o email do usuário
- Implemente validações adicionais se necessário
- Considere implementar verificação de domínio

## 8. Manutenção

### 8.1 Monitoramento
- Logs de autenticação
- Métricas de uso
- Alertas de erro

### 8.2 Atualizações
- Mantenha o Laravel Socialite atualizado
- Monitore mudanças na API do Google
- Teste regularmente o fluxo de autenticação 