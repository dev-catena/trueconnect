import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { API_CONFIG } from '@/config/api'

// Log da URL base da API para debug
console.log('🔗 API Base URL configurada:', API_CONFIG.BASE_URL)
console.log('🔗 URL completa será:', API_CONFIG.BASE_URL + '/endpoint-exemplo')

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: API_CONFIG.DEFAULT_HEADERS,
  timeout: API_CONFIG.TIMEOUT,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log da requisição para debug
    const fullUrl = config.baseURL + config.url
    console.log('📤 Requisição:', config.method?.toUpperCase(), fullUrl)
    
    const token = localStorage.getItem('token')
    
    // Lista de rotas públicas que não precisam de token
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']
    const isPublicRoute = publicRoutes.some(route => config.url.includes(route))
    
    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 Token enviado para:', config.url)
      console.log('📝 Token length:', token.length)
    } else if (!token && !isPublicRoute) {
      console.warn('⚠️ Token não encontrado para rota:', config.url)
    }
    
    return config
  },
  (error) => {
    console.error('Erro no interceptor de request:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta recebida:', response.config.method?.toUpperCase(), response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('❌ Erro na requisição:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      baseURL: error.config?.baseURL
    })
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      const url = error.config?.url || ''
      if (url.includes('/auth/me') || url.includes('/auth/login') || url.includes('/auth/register')) {
        authStore.logout()
      }
      // Caso contrário, não fazemos logout automático
    }
    return Promise.reject(error)
  }
)

export default api
