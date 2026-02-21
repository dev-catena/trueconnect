// Configuração de ambiente - 100% local (sem servidores externos)
const ENV = {
  // Sempre local - usa proxy do Vite (backend em localhost:8000)
  LOCAL: {
    API_BASE_URL: '/api',
    STORAGE_BASE_URL: 'http://localhost:8000',
    APP_NAME: 'Trust-me (Local)',
  },
}

// 100% local - sempre usa configuração local
const hostname = window.location.hostname
const currentEnv = ENV.LOCAL
const isProduction = false
const isStaging = false

// URL base para arquivos estáticos (storage) - prioriza env, depois config
const getStorageBaseUrl = () => {
  const envOverride = import.meta.env.VITE_STORAGE_BASE_URL
  if (envOverride) return envOverride
  const apiUrl = currentEnv.API_BASE_URL
  // Se API é relativa (/api), backend está no mesmo host com porta 8000
  if (!apiUrl.startsWith('http')) {
    return `${window.location.protocol}//${window.location.hostname}:8000`
  }
  if (apiUrl.startsWith('http')) {
    try {
      const url = new URL(apiUrl)
      return `${url.protocol}//${url.host}`
    } catch {
      return apiUrl.replace(/\/api\/?$/, '')
    }
  }
  return window.location.origin
}

// Reverb (WebSocket) - host/port para conexão do Echo
const getReverbConfig = () => ({
  host: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
  port: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
  scheme: import.meta.env.VITE_REVERB_SCHEME || 'http',
  appKey: import.meta.env.VITE_REVERB_APP_KEY || 'imxxjvrqkkqflvbcppeo',
})

// Configuração atual
export const CONFIG = {
  API_BASE_URL: currentEnv.API_BASE_URL,
  STORAGE_BASE_URL: getStorageBaseUrl(),
  APP_NAME: currentEnv.APP_NAME,
  IS_PRODUCTION: isProduction,
  IS_DEVELOPMENT: !isProduction,
  REVERB: getReverbConfig(),
}

// Log da configuração atual (útil para debug)
console.log('%c🔧 CONFIGURAÇÃO DO AMBIENTE', 'background: #222; color: #bada55; font-size: 16px; padding: 5px;')
console.log('🔧 Ambiente detectado:', {
  hostname: hostname,
  port: window.location.port,
  environment: 'LOCAL (100% sem servidores externos)',
  apiUrl: CONFIG.API_BASE_URL,
  appName: CONFIG.APP_NAME,
  fullApiUrl: CONFIG.API_BASE_URL.startsWith('http') ? CONFIG.API_BASE_URL : window.location.origin + CONFIG.API_BASE_URL
})
console.log('%c⚠️ Se apiUrl não for "/api", recarregue a página com Ctrl+Shift+R', 'background: #ff6b6b; color: white; padding: 5px;')

export default CONFIG 