<template>
  <div class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Escolha o plano ideal
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Oferecemos planos flexíveis para atender empresas de todos os tamanhos.
          Comece gratuitamente e evolua conforme sua necessidade.
        </p>
      </div>

      <!-- Billing Toggle -->
      <div class="flex justify-center mb-12">
        <div class="bg-white p-1 rounded-lg shadow-sm">
          <button
            @click="billingCycle = 'monthly'"
            class="px-6 py-2 rounded-md font-medium transition-colors"
            :class="billingCycle === 'monthly' 
              ? 'bg-trust-600 text-white' 
              : 'text-gray-600 hover:text-gray-900'"
          >
            Mensal
          </button>
          <button
            @click="billingCycle = 'yearly'"
            class="px-6 py-2 rounded-md font-medium transition-colors"
            :class="billingCycle === 'yearly' 
              ? 'bg-trust-600 text-white' 
              : 'text-gray-600 hover:text-gray-900'"
          >
            Anual
            <span class="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              -20%
            </span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center">
        <Loader text="Carregando planos..." />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center text-red-600 mb-8">
        <p>{{ error }}</p>
        <button @click="fetchPlans" class="btn-primary mt-4">
          Tentar Novamente
        </button>
        <button @click="testLogin" class="btn-secondary mt-4 ml-4">
          Testar Login
        </button>
      </div>

      <!-- Plans Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PlanCard
          v-for="plan in filteredPlans"
          :key="plan.id"
          :plan="plan"
        />
      </div>

      <!-- FAQ Section -->
      <div class="mt-20">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
          Perguntas Frequentes sobre Planos
        </h2>
        <div class="max-w-3xl mx-auto space-y-6">
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="font-semibold text-gray-900 mb-2">
              Posso mudar de plano a qualquer momento?
            </h3>
            <p class="text-gray-600">
              Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
              As alterações são aplicadas imediatamente e o valor é ajustado proporcionalmente.
            </p>
          </div>
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="font-semibold text-gray-900 mb-2">
              Existe período de teste gratuito?
            </h3>
            <p class="text-gray-600">
              Sim! Oferecemos 14 dias de teste gratuito em todos os planos pagos.
              Você pode cancelar a qualquer momento durante o período de teste.
            </p>
          </div>
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="font-semibold text-gray-900 mb-2">
              Quais formas de pagamento são aceitas?
            </h3>
            <p class="text-gray-600">
              Aceitamos cartões de crédito, débito, PIX e boleto bancário.
              Todos os pagamentos são processados de forma segura através do Mercado Pago.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PlanCard from '@/components/PlanCard.vue'
import Loader from '@/components/Loader.vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const plans = ref([])
const loading = ref(true)
const error = ref('')
const billingCycle = ref('monthly')

const filteredPlans = computed(() => {
  return plans.value.filter(plan => plan.billing_cycle === billingCycle.value)
})

const fetchPlans = async () => {
  loading.value = true
  error.value = ''
  
  try {
    console.log('Iniciando busca de planos...')
    console.log('URL da API:', import.meta.env.VITE_API_BASE_URL)
    
    const response = await api.get('/plans')
    console.log('Response da API:', response)
    
    const apiPlans = response.data.data || []
    console.log('Planos da API:', apiPlans)
    
    // Transformar os planos da API para o formato esperado pelo componente
    plans.value = apiPlans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.monthly_price,
      billing_cycle: 'monthly',
      features: plan.features,
      featured: plan.id === 2, // Plano Intermediário como destaque
      is_active: plan.is_active
    }))

    // Adicionar planos anuais
    const yearlyPlans = apiPlans.map(plan => ({
      id: plan.id + 100, // IDs diferentes para planos anuais
      name: plan.name,
      description: plan.description,
      price: plan.annual_price,
      billing_cycle: 'yearly',
      features: plan.features,
      featured: plan.id === 2,
      is_active: plan.is_active
    }))

    plans.value = [...plans.value, ...yearlyPlans]
    console.log('Planos processados:', plans.value)
  } catch (err) {
    error.value = 'Erro ao carregar planos. Tente novamente.'
    console.error('Erro detalhado ao buscar planos:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      config: err.config
    })
    // Usar planos padrão em caso de erro
    plans.value = getDefaultPlans()
  } finally {
    loading.value = false
  }
}

const getDefaultPlans = () => {
  return [
    {
      id: 1,
      name: 'Básico',
      price: '29.90',
      billing_cycle: 'monthly',
      description: 'Ideal para pequenas equipes',
      features: [
        'Até 5 usuários',
        '10 projetos ativos',
        'Suporte por email',
        '5GB de armazenamento',
        'Relatórios básicos'
      ],
      featured: false
    },
    {
      id: 2,
      name: 'Intermediário',
      price: '49.90',
      billing_cycle: 'monthly',
      description: 'Perfeito para equipes em crescimento',
      features: [
        'Até 15 usuários',
        'Projetos ilimitados',
        'Suporte prioritário',
        '50GB de armazenamento',
        'Relatórios avançados',
        'Integrações básicas'
      ],
      featured: true
    },
    {
      id: 3,
      name: 'Plus',
      price: '69.90',
      billing_cycle: 'monthly',
      description: 'Para empresas que precisam do máximo',
      features: [
        'Usuários ilimitados',
        'Projetos ilimitados',
        'Suporte 24/7',
        '200GB de armazenamento',
        'Relatórios personalizados',
        'Todas as integrações',
        'API personalizada'
      ],
      featured: false
    }
  ]
}

const testLogin = async () => {
  try {
    const response = await api.post('/auth/login', {
      email: 'admin@trustme.com',
      password: 'password'
    })
    console.log('Login Response:', response.data)
    const authStore = useAuthStore()
    authStore.token = response.data.token
    localStorage.setItem('token', response.data.token)
    await fetchPlans()
  } catch (err) {
    console.error('Erro no login de teste:', err)
    error.value = 'Erro no login de teste: ' + (err.response?.data?.message || err.message)
  }
}

onMounted(() => {
  fetchPlans()
})
</script>
