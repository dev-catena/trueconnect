<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div class="mb-6">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="mt-4 text-2xl font-bold text-gray-900">Pagamento Aprovado!</h2>
        <p class="mt-2 text-gray-600">
          Seu pagamento foi processado com sucesso. Você já pode começar a usar sua assinatura.
        </p>
      </div>
      
      <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h3 class="text-lg font-semibold text-green-800 mb-2">Detalhes da Assinatura</h3>
        <div class="text-sm text-green-700">
          <p><strong>Plano:</strong> {{ subscription?.plan?.name || 'Carregando...' }}</p>
          <p><strong>Valor:</strong> R$ {{ formatPrice(subscription?.amount) || '0,00' }}</p>
          <p><strong>Status:</strong> <span class="text-green-600 font-medium">Ativo</span></p>
        </div>
      </div>
      
      <div class="space-y-3">
        <button
          @click="goToDashboard"
          class="w-full bg-trust-600 hover:bg-trust-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Ir para o Dashboard
        </button>
        
        <button
          @click="goToPlans"
          class="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Ver Outros Planos
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const subscription = ref(null)
const loading = ref(true)

const formatPrice = (price) => {
  if (!price) return '0,00'
  return parseFloat(price).toFixed(2).replace('.', ',')
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const goToPlans = () => {
  router.push('/planos')
}

const loadSubscription = async () => {
  try {
    const response = await api.get('/user/subscriptions')
    if (response.data.success && response.data.data.length > 0) {
      subscription.value = response.data.data[0] // Assumindo que é a mais recente
    }
  } catch (error) {
    console.error('Erro ao carregar assinatura:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    loadSubscription()
  } else {
    router.push('/login')
  }
})
</script> 