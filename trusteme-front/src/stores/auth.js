import { defineStore } from 'pinia'
import api from '@/services/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => {
      console.log('Verificando role do usuário:', state.user)
      return state.user?.role === 'admin'
    },
    isServiceDesk: (state) => {
      return state.user?.role === 'servicedesk'
    },
    getUser: (state) => state.user
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        console.log('Iniciando login...')
        const response = await api.post('/auth/login', credentials)
        const { token, user } = response.data

        // Salvar token
        localStorage.setItem('token', token)
        this.token = token

        // Salvar dados do usuário
        this.user = user

        // Atualizar histórico de login
        try {
          await api.post('/login-history/update')
        } catch (error) {
          console.error('Erro ao atualizar histórico de login:', error)
        }

        console.log('Usuário carregado:', this.user)
        console.log('É admin?', this.isAdmin)
        
        return user
      } catch (error) {
        console.error('Erro no login:', error)
        this.error = error.response?.data?.message || 'Erro ao fazer login'
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.post('/auth/register', userData)
        this.token = response.data.token
        localStorage.setItem('token', this.token)
        
        // Salvar dados do usuário diretamente da resposta
        this.user = response.data.user
        
        return response
      } catch (error) {
        console.log('Erro detalhado do registro:', error.response?.data)
        if (error.response?.data?.errors) {
          console.log('Erros de validação:', error.response.data.errors)
          // Mostrar o primeiro erro encontrado
          const firstError = Object.values(error.response.data.errors)[0]
          this.error = Array.isArray(firstError) ? firstError[0] : firstError
        } else {
          this.error = error.response?.data?.message || 'Erro ao registrar'
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUser() {
      if (!this.token) {
        console.log('Sem token, não é possível buscar usuário')
        return
      }
      
      try {
        console.log('Buscando dados do usuário...')
        const response = await api.get('/auth/me')
        console.log('Dados do usuário recebidos:', response.data)
        this.user = response.data.user
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error)
        if (error.response?.status === 401) {
          this.logout()
        }
      }
    },

    logout() {
      console.log('Fazendo logout...')
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    },

    async forgotPassword(email) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.post('/auth/forgot-password', { email })
        // Retornar dados completos incluindo debug_code se disponível
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erro ao enviar email'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
