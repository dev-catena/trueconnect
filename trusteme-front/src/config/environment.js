// Configuração de ambiente
const ENV = {
  // Desenvolvimento local - usa proxy do Vite
  DEVELOPMENT: {
    API_BASE_URL: '/api',
    APP_NAME: 'Trust-me (Dev)',
  },
  
  // Produção - URL da Digital Ocean
  PRODUCTION: {
    API_BASE_URL: 'https://consentir.catenasystem.com.br/api',
    APP_NAME: 'Trust-me',
  },
  
  // Staging/Teste
  STAGING: {
    API_BASE_URL: 'https://staging.seu-dominio.com/api',
    APP_NAME: 'Trust-me (Staging)',
  }
}

// Detecta o ambiente automaticamente
const hostname = window.location.hostname
const isProduction = hostname === 'consentir.catenasystem.com.br' || hostname.includes('catenasystem.com.br')
const isStaging = hostname.includes('staging') && !isProduction
const isDevelopment = !isProduction && !isStaging

// Seleciona a configuração baseada no ambiente
let currentEnv = ENV.DEVELOPMENT // Por padrão, sempre desenvolvimento local
if (isProduction) {
  currentEnv = ENV.PRODUCTION
} else if (isStaging) {
  currentEnv = ENV.STAGING
}

// Configuração atual
export const CONFIG = {
  API_BASE_URL: currentEnv.API_BASE_URL,
  APP_NAME: currentEnv.APP_NAME,
  IS_PRODUCTION: isProduction,
  IS_DEVELOPMENT: !isProduction,
}

// Log da configuração atual (útil para debug)
console.log('%c🔧 CONFIGURAÇÃO DO AMBIENTE', 'background: #222; color: #bada55; font-size: 16px; padding: 5px;')
console.log('🔧 Ambiente detectado:', {
  hostname: hostname,
  port: window.location.port,
  environment: isProduction ? 'PRODUÇÃO' : isStaging ? 'STAGING' : 'DESENVOLVIMENTO',
  apiUrl: CONFIG.API_BASE_URL,
  appName: CONFIG.APP_NAME,
  fullApiUrl: CONFIG.API_BASE_URL.startsWith('http') ? CONFIG.API_BASE_URL : window.location.origin + CONFIG.API_BASE_URL
})
console.log('%c⚠️ Se apiUrl não for "/api", recarregue a página com Ctrl+Shift+R', 'background: #ff6b6b; color: white; padding: 5px;')

export default CONFIG 