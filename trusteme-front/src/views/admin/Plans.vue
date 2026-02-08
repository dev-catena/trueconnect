<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Gerenciar Planos</h1>
      <p class="text-gray-600">Configure os planos de assinatura disponíveis</p>
    </div>

    <!-- Plans Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        :class="{ 'ring-2 ring-trust-500': plan.featured }"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-900">{{ plan.name }}</h3>
            <p class="text-gray-600">{{ plan.description }}</p>
          </div>
          <div class="flex space-x-2">
            <button
              @click="editPlan(plan)"
              class="text-trust-600 hover:text-trust-900"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button
              @click="deletePlan(plan)"
              class="text-red-600 hover:text-red-900"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="mb-4">
          <span class="text-3xl font-bold text-trust-600">R$ {{ formatPrice(plan.price) }}</span>
          <span class="text-gray-600">/{{ plan.billing_cycle === 'monthly' ? 'mês' : 'ano' }}</span>
        </div>

        <div class="mb-4">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="plan.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
          >
            {{ plan.active ? 'Ativo' : 'Inativo' }}
          </span>
          <span
            v-if="plan.featured"
            class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-trust-100 text-trust-800"
          >
            Destaque
          </span>
        </div>

        <ul class="space-y-2 text-sm text-gray-600">
          <li v-for="feature in plan.features" :key="feature" class="flex items-center">
            <svg class="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ feature }}
          </li>
        </ul>
      </div>

      <!-- Add New Plan Card -->
      <div class="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center">
        <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Novo Plano</h3>
        <button @click="showCreateModal = true" class="btn-primary">
          Criar Plano
        </button>
      </div>
    </div>

    <!-- Create/Edit Plan Modal -->
    <Modal :show="showCreateModal || showEditModal" @close="closeModal" :title="editingPlan ? 'Editar Plano' : 'Novo Plano'">
      <form @submit.prevent="savePlan" class="space-y-4">
        <FormInput
          id="name"
          label="Nome do Plano"
          v-model="planForm.name"
          required
          :error="errors.name"
        />
        
        <div class="mb-4">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            Descrição <span class="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            v-model="planForm.description"
            rows="3"
            required
            class="input-field resize-none"
            :class="{ 'border-red-500 focus:ring-red-500': errors.description }"
          ></textarea>
          <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
        </div>
        
        <FormInput
          id="price"
          label="Preço"
          type="number"
          step="0.01"
          v-model="planForm.price"
          required
          :error="errors.price"
        />
        
        <div class="mb-4">
          <label for="billing_cycle" class="block text-sm font-medium text-gray-700 mb-2">
            Ciclo de Cobrança <span class="text-red-500">*</span>
          </label>
          <select
            id="billing_cycle"
            v-model="planForm.billing_cycle"
            required
            class="input-field"
          >
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Funcionalidades
          </label>
          <div class="space-y-2">
            <div
              v-for="(feature, index) in planForm.features"
              :key="index"
              class="flex items-center space-x-2"
            >
              <input
                v-model="planForm.features[index]"
                type="text"
                class="input-field flex-1"
                placeholder="Digite uma funcionalidade"
              />
              <button
                type="button"
                @click="removeFeature(index)"
                class="text-red-600 hover:text-red-900"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
            <button
              type="button"
              @click="addFeature"
              class="text-trust-600 hover:text-trust-900 text-sm"
            >
              + Adicionar funcionalidade
            </button>
          </div>
        </div>
        
        <div class="flex items-center space-x-6">
          <div class="flex items-center">
            <input
              id="active"
              type="checkbox"
              v-model="planForm.active"
              class="h-4 w-4 text-trust-600 focus:ring-trust-500 border-gray-300 rounded"
            />
            <label for="active" class="ml-2 block text-sm text-gray-900">
              Plano ativo
            </label>
          </div>
          
          <div class="flex items-center">
            <input
              id="featured"
              type="checkbox"
              v-model="planForm.featured"
              class="h-4 w-4 text-trust-600 focus:ring-trust-500 border-gray-300 rounded"
            />
            <label for="featured" class="ml-2 block text-sm text-gray-900">
              Plano em destaque
            </label>
          </div>
        </div>
      </form>
      
      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="closeModal" class="btn-secondary">
            Cancelar
          </button>
          <button @click="savePlan" :disabled="saving" class="btn-primary">
            {{ saving ? 'Salvando...' : (editingPlan ? 'Atualizar' : 'Criar') }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Modal from '@/components/Modal.vue'
import FormInput from '@/components/FormInput.vue'
import api from '@/services/api'

const plans = ref([])
const saving = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingPlan = ref(null)
const errors = ref({})

const planForm = reactive({
  name: '',
  description: '',
  price: '',
  billing_cycle: 'monthly',
  features: [''],
  active: true,
  featured: false
})

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2).replace('.', ',')
}

const fetchPlans = async () => {
  try {
    const response = await api.get('/plans')
    const apiPlans = response.data.data || []
    
    // Transformar os planos da API para o formato esperado pelo componente
    plans.value = apiPlans.map(plan => ({
      id: plan.id,
      origId: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.monthly_price,
      billing_cycle: 'monthly',
      features: plan.features,
      active: plan.is_active,
      featured: plan.id === 2 // Plano Intermediário como destaque
    }))

    // Adicionar planos anuais
    const yearlyPlans = apiPlans.map(plan => ({
      id: plan.id + 100, // IDs diferentes para planos anuais
      origId: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.annual_price,
      billing_cycle: 'yearly',
      features: plan.features,
      active: plan.is_active,
      featured: plan.id === 2
    }))

    plans.value = [...plans.value, ...yearlyPlans]

    // Se não houver planos, usar os planos padrão
    if (!plans.value.length) {
      plans.value = [
        {
          id: 1,
          name: 'Básico',
          description: 'Ideal para pequenas equipes',
          price: '29.90',
          billing_cycle: 'monthly',
          features: ['Até 5 usuários', '10 projetos ativos', 'Suporte por email'],
          active: true,
          featured: false
        },
        {
          id: 2,
          name: 'Intermediário',
          description: 'Perfeito para equipes em crescimento',
          price: '49.90',
          billing_cycle: 'monthly',
          features: ['Até 15 usuários', 'Projetos ilimitados', 'Suporte prioritário'],
          active: true,
          featured: true
        },
        {
          id: 3,
          name: 'Plus',
          description: 'Para empresas que precisam do máximo',
          price: '69.90',
          billing_cycle: 'monthly',
          features: ['Usuários ilimitados', 'Todas as funcionalidades', 'Suporte 24/7'],
          active: true,
          featured: false
        }
      ]
    }
  } catch (error) {
    console.error('Erro ao carregar planos:', error)
  }
}

const editPlan = (plan) => {
  editingPlan.value = plan
  planForm.name = plan.name
  planForm.description = plan.description
  planForm.price = plan.price
  planForm.billing_cycle = plan.billing_cycle
  planForm.features = [...plan.features]
  planForm.active = plan.active
  planForm.featured = plan.featured
  showEditModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingPlan.value = null
  Object.keys(planForm).forEach(key => {
    if (key === 'features') {
      planForm[key] = ['']
    } else if (key === 'active') {
      planForm[key] = true
    } else if (key === 'featured') {
      planForm[key] = false
    } else if (key === 'billing_cycle') {
      planForm[key] = 'monthly'
    } else {
      planForm[key] = ''
    }
  })
  errors.value = {}
}

const addFeature = () => {
  planForm.features.push('')
}

const removeFeature = (index) => {
  if (planForm.features.length > 1) {
    planForm.features.splice(index, 1)
  }
}

const savePlan = async () => {
  errors.value = {}
  saving.value = true
  
  try {
    const data = {
      name: planForm.name,
      description: planForm.description,
      features: planForm.features.filter(f => f.trim() !== ''),
      is_active: planForm.active
    }
    if (planForm.billing_cycle === 'monthly') {
      data.monthly_price = planForm.price
    } else if (planForm.billing_cycle === 'yearly') {
      data.annual_price = planForm.price
    }
    
    if (editingPlan.value) {
      await api.put(`/plans/${editingPlan.value.origId || editingPlan.value.id}`, data)
    } else {
      await api.post('/plans', data)
    }
    
    await fetchPlans()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar plano:', error)
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    }
  } finally {
    saving.value = false
  }
}

const deletePlan = async (plan) => {
  if (confirm(`Tem certeza que deseja excluir o plano ${plan.name}?`)) {
    try {
      await api.delete(`/plans/${plan.id}`)
      await fetchPlans()
    } catch (error) {
      console.error('Erro ao excluir plano:', error)
    }
  }
}

onMounted(() => {
  fetchPlans()
})
</script>
