<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
      <p class="text-gray-600">Visualize e gerencie todos os usuários do sistema</p>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar usuários..."
            class="input-field"
          />
        </div>
        <div>
          <select v-model="statusFilter" class="input-field">
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="bloqueado">Bloqueado</option>
          </select>
        </div>
        <div>
          <select v-model="planFilter" class="input-field">
            <option value="">Todos os planos</option>
            <option value="1">Básico</option>
            <option value="2">Intermediário</option>
            <option value="3">Plus</option>
          </select>
        </div>
        <div>
          <button @click="clearFilters" class="btn-secondary w-full">
            Limpar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8">
        <Loader text="Carregando usuários..." />
      </div>

      <div v-else-if="filteredUsers.length === 0" class="p-8 text-center">
        <p class="text-gray-500">Nenhum usuário encontrado</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado em</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-trust-100 rounded-full flex items-center justify-center mr-4">
                    <span class="text-trust-600 font-semibold text-sm">
                      {{ user.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="user.active_plan" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ user.active_plan.name }}
                </span>
                <span v-else class="text-sm text-gray-500">Sem plano</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(user.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ user.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="viewFinancial(user)" class="text-blue-600 hover:text-blue-900">
                    Financeiro
                  </button>
                  <button @click="changePassword(user)" class="text-green-600 hover:text-green-900">
                    Senha
                  </button>
                  <button @click="toggleBlock(user)" class="text-yellow-600 hover:text-yellow-900">
                    {{ user.status === 'bloqueado' ? 'Desbloquear' : 'Bloquear' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Financial Modal -->
    <Modal :show="showFinancialModal" @close="closeFinancialModal" title="Financeiro - {{ selectedUser?.name }}">
      <div v-if="financialLoading" class="text-center py-8">
        <Loader text="Carregando dados financeiros..." />
      </div>
      <div v-else>
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Resumo Financeiro</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Total Pago</p>
              <p class="text-2xl font-bold text-blue-900">R$ {{ formatCurrency(financialData.totalPaid || 0) }}</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Pagamentos Realizados</p>
              <p class="text-2xl font-bold text-green-900">{{ financialData.totalPayments || 0 }}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Histórico de Pagamentos</h3>
          <div v-if="financialData.payments?.length === 0" class="text-center py-4 text-gray-500">
            Nenhum pagamento encontrado
          </div>
          <div v-else class="space-y-3">
            <div v-for="payment in financialData.payments" :key="payment.id" class="border rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium text-gray-900">{{ payment.plan_name || 'Plano' }}</p>
                  <p class="text-sm text-gray-500">{{ formatDate(payment.created_at) }}</p>
                  <p class="text-sm text-gray-500">Método: {{ payment.payment_method || 'N/A' }}</p>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-gray-900">R$ {{ formatCurrency(payment.amount || 0) }}</p>
                  <span :class="getPaymentStatusClass(payment.status)" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1">
                    {{ getPaymentStatusLabel(payment.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Change Password Modal -->
    <Modal :show="showPasswordModal" @close="closePasswordModal" title="Alterar Senha - {{ selectedUser?.name }}">
      <form @submit.prevent="savePassword" class="space-y-4">
        <FormInput
          id="newPassword"
          label="Nova Senha"
          type="password"
          v-model="passwordForm.newPassword"
          required
          :error="errors.newPassword"
        />
        <FormInput
          id="confirmPassword"
          label="Confirmar Senha"
          type="password"
          v-model="passwordForm.confirmPassword"
          required
          :error="errors.confirmPassword"
        />
      </form>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="closePasswordModal" class="btn-secondary">Cancelar</button>
          <button @click="savePassword" :disabled="savingPassword" class="btn-primary">
            {{ savingPassword ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import Loader from '@/components/Loader.vue'
import Modal from '@/components/Modal.vue'
import FormInput from '@/components/FormInput.vue'
import api from '@/services/api'

const users = ref([])
const loading = ref(true)
const savingPassword = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const planFilter = ref('')
const showFinancialModal = ref(false)
const showPasswordModal = ref(false)
const selectedUser = ref(null)
const financialData = ref({ payments: [] })
const financialLoading = ref(false)
const errors = ref({})

const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(user => user.status === statusFilter.value)
  }

  if (planFilter.value) {
    filtered = filtered.filter(user => user.active_plan?.id === parseInt(planFilter.value))
  }

  return filtered
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/servicedesk/users')
    if (response.data?.success) {
      users.value = response.data.data
    }
  } catch (error) {
    console.error('Erro ao carregar usuários:', error)
  } finally {
    loading.value = false
  }
}

const viewFinancial = async (user) => {
  selectedUser.value = user
  showFinancialModal.value = true
  financialLoading.value = true
  
  try {
    const response = await api.get(`/servicedesk/users/${user.id}/financial`)
    if (response.data?.success) {
      financialData.value = response.data.data
    }
  } catch (error) {
    console.error('Erro ao carregar dados financeiros:', error)
  } finally {
    financialLoading.value = false
  }
}

const changePassword = (user) => {
  selectedUser.value = user
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  errors.value = {}
  showPasswordModal.value = true
}

const savePassword = async () => {
  errors.value = {}
  
  if (!passwordForm.newPassword) {
    errors.value.newPassword = 'A senha é obrigatória'
    return
  }
  
  if (passwordForm.newPassword.length < 6) {
    errors.value.newPassword = 'A senha deve ter pelo menos 6 caracteres'
    return
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    errors.value.confirmPassword = 'As senhas não coincidem'
    return
  }
  
  savingPassword.value = true
  try {
    const response = await api.put(`/servicedesk/users/${selectedUser.value.id}/password`, {
      password: passwordForm.newPassword
    })
    
    if (response.data?.success) {
      alert('Senha alterada com sucesso!')
      closePasswordModal()
    }
  } catch (error) {
    errors.value.newPassword = error.response?.data?.message || 'Erro ao alterar senha'
  } finally {
    savingPassword.value = false
  }
}

const toggleBlock = async (user) => {
  if (!confirm(`Tem certeza que deseja ${user.status === 'bloqueado' ? 'desbloquear' : 'bloquear'} este usuário?`)) {
    return
  }
  
  try {
    const response = await api.put(`/servicedesk/users/${user.id}/block`, {
      blocked: user.status !== 'bloqueado'
    })
    
    if (response.data?.success) {
      user.status = user.status === 'bloqueado' ? 'ativo' : 'bloqueado'
      alert(`Usuário ${user.status === 'bloqueado' ? 'bloqueado' : 'desbloqueado'} com sucesso!`)
    }
  } catch (error) {
    alert('Erro ao alterar status do usuário')
    console.error(error)
  }
}

const closeFinancialModal = () => {
  showFinancialModal.value = false
  selectedUser.value = null
  financialData.value = { payments: [] }
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  selectedUser.value = null
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  errors.value = {}
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  planFilter.value = ''
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const getStatusClass = (status) => {
  const classes = {
    ativo: 'bg-green-100 text-green-800',
    inativo: 'bg-gray-100 text-gray-800',
    bloqueado: 'bg-red-100 text-red-800',
    suspenso: 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getPaymentStatusClass = (status) => {
  const classes = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    active: 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getPaymentStatusLabel = (status) => {
  const labels = {
    paid: 'Pago',
    pending: 'Pendente',
    cancelled: 'Cancelado',
    active: 'Ativo'
  }
  return labels[status] || status
}

onMounted(() => {
  fetchUsers()
})
</script>


