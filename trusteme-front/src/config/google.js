// Configuração do Google OAuth
export const GOOGLE_CONFIG = {
  // Client ID do Google OAuth para produção
  CLIENT_ID: '580799203729-ehnh31mlhgjoqm5jrjf4moj9g8i4s4l7.apps.googleusercontent.com',
  
  // URL de redirecionamento após autenticação (produção)
  REDIRECT_URI: 'https://consentir.catenasystem.com.br/auth/google/callback',
  
  // Escopo das permissões solicitadas
  SCOPE: 'email profile',
  
  // URLs da API
  AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN_URL: 'https://oauth2.googleapis.com/token',
  USER_INFO_URL: 'https://www.googleapis.com/oauth2/v2/userinfo',
}

// Função para gerar URL de autorização do Google
export const generateGoogleAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CONFIG.CLIENT_ID,
    redirect_uri: GOOGLE_CONFIG.REDIRECT_URI,
    scope: GOOGLE_CONFIG.SCOPE,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
  })
  
  return `${GOOGLE_CONFIG.AUTH_URL}?${params.toString()}`
}

// Função para extrair código de autorização da URL
export const extractAuthCode = (url) => {
  const urlParams = new URLSearchParams(url.split('?')[1])
  return urlParams.get('code')
}

export default GOOGLE_CONFIG 