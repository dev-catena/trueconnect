
<template>
  <div class="bg-white rounded-lg shadow-lg p-6 relative" :class="{ 'ring-2 ring-trust-500': plan.featured }">
    <div v-if="plan.featured" class="absolute -top-3 left-1/2 transform -translate-x-1/2">
      <span class="bg-trust-500 text-white px-4 py-1 rounded-full text-sm font-medium">
        Mais Popular
      </span>
    </div>
    
    <div class="text-center">
      <h3 class="text-xl font-bold text-gray-900 mb-2">{{ plan.name }}</h3>
      <div class="mb-4">
        <span class="text-3xl font-bold text-trust-600">R$ {{ formatPrice(plan.price) }}</span>
        <span class="text-gray-600">/{{ plan.billing_cycle === 'monthly' ? 'mês' : 'ano' }}</span>
      </div>
      <p class="text-gray-600 mb-6">{{ plan.description }}</p>
    </div>
    
    <ul class="space-y-3 mb-6">
      <li v-for="feature in plan.features" :key="feature" class="flex items-center">
        <svg class="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="text-gray-700">{{ feature }}</span>
      </li>
    </ul>
    
    <button
      @click="selectPlan"
      class="w-full py-3 px-4 rounded-lg font-medium transition-colors"
      :class="plan.featured 
        ? 'bg-trust-600 hover:bg-trust-700 text-white' 
        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'"
      :disabled="loading"
    >
      <span v-if="loading" class="flex items-center justify-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processando...
      </span>
      <span v-else>
        Escolher Plano
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const props = defineProps({
  plan: {
    type: Object,
    required: true
  }
})

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2).replace('.', ',')
}

const selectPlan = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  loading.value = true
  
  try {
    const response = await api.post('/payment/create-preference', {
      plan_id: props.plan.id,
      billing_cycle: 'monthly' // Pode ser dinâmico baseado na seleção do usuário
    })
    
    if (response.data.success && response.data.data) {
      const preference = response.data.data
      
      // Redirecionar para o Mercado Pago
      const checkoutUrl = import.meta.env.VITE_MERCADO_PAGO_ENV === 'sandbox'
        ? preference.sandbox_init_point 
        : preference.init_point
      
      window.location.href = checkoutUrl
    } else {
      throw new Error('Erro ao criar preferência de pagamento')
    }
  } catch (error) {
    console.error('Erro ao processar pagamento:', error)
    alert('Erro ao processar pagamento. Tente novamente.')
  } finally {
    loading.value = false
  }
}
</script>
