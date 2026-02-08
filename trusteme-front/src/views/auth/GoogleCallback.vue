<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <router-link to="/" class="text-3xl font-bold text-trust-600">
          TrueConnect
        </router-link>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">
          Processando login com Google...
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Aguarde enquanto processamos sua autenticação
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
        <!-- Loading Spinner -->
        <div v-if="loading" class="flex flex-col items-center space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-600"></div>
          <p class="text-gray-600">Conectando com sua conta Google...</p>
        </div>

        <!-- Success Message -->
        <div v-else-if="success" class="flex flex-col items-center space-y-4">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <p class="text-green-600 font-medium">Login realizado com sucesso!</p>
          <p class="text-gray-600">Redirecionando...</p>
        </div>

        <!-- Error Message -->
        <div v-else-if="error" class="flex flex-col items-center space-y-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <p class="text-red-600 font-medium">Erro na autenticação</p>
          <p class="text-gray-600 text-sm">{{ error }}</p>
          <router-link
            to="/login"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-trust-600 hover:bg-trust-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-trust-500"
          >
            Tentar novamente
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const success = ref(false)
const error = ref(null)

onMounted(async () => {
  try {
    // Extrair o código de autorização da URL
    const code = route.query.code
    
    if (!code) {
      error.value = 'Código de autorização não encontrado'
      loading.value = false
      return
    }

    console.log('Código de autorização recebido:', code)

    // Processar o callback do Google
    await authStore.handleGoogleCallback(code)
    
    success.value = true
    loading.value = false

    // Redirecionar após um breve delay
    setTimeout(() => {
      router.push('/')
    }, 2000)

  } catch (err) {
    console.error('Erro no callback do Google:', err)
    error.value = err.message || 'Erro ao processar autenticação com Google'
    loading.value = false
  }
})
</script> 