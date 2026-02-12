<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
      <p class="text-gray-600">Visualize e gerencie todos os usuários do sistema</p>
      
      <!-- Mensagem Informativa -->
      <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex">
          <svg class="h-5 w-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p class="text-sm text-blue-800">
              <strong>Importante:</strong> Para criar uma conta, baixe o aplicativo TrueConnect e faça seu cadastro. 
              Use suas credenciais criadas no app para fazer login no site administrativo.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <option value="suspenso">Suspenso</option>
          </select>
        </div>
        <div>
          <select v-model="roleFilter" class="input-field">
            <option value="">Todas as funções</option>
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
            <option value="servicedesk">Atendente</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">
            Usuários ({{ filteredUsers.length }})
          </h2>
          <button
            @click="showCreateAttendantModal = true"
            class="btn-primary flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Criar Usuário Atendente
          </button>
        </div>
      </div>

      <div v-if="loading" class="p-8">
        <Loader text="Carregando usuários..." />
      </div>

      <div v-else-if="filteredUsers.length === 0" class="p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
        </svg>
        <p class="text-gray-500">Nenhum usuário encontrado</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Função
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPF
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Criado em
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Logins
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-trust-100 rounded-full flex items-center justify-center mr-4">
                    <span class="text-trust-600 font-semibold text-sm">
                      {{ (user.name || user.nome_completo || 'U').charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ user.name || user.nome_completo || 'Usuário' }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getRoleClass(user.role)"
                >
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.CPF || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusClass(user.status || 'ativo')"
                >
                  {{ user.status || 'ativo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                -
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex flex-wrap gap-2">
                  <button
                    @click="viewUserPlans(user)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Ver Planos"
                  >
                    Planos
                  </button>
                  <button
                    @click="openChangePasswordModal(user)"
                    class="text-indigo-600 hover:text-indigo-900"
                    title="Trocar senha"
                  >
                    Trocar senha
                  </button>
                  <button
                    @click="toggleUserStatus(user)"
                    class="text-yellow-600 hover:text-yellow-900"
                  >
                    {{ user.status === 'ativo' ? 'Suspender' : 'Ativar' }}
                  </button>
                  <button
                    @click="deleteUser(user)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Ver Planos do Usuário -->
    <Modal :show="showPlansModal" @close="closePlansModal" :title="`Planos de ${selectedUser?.name || selectedUser?.nome_completo || 'Usuário'}`" size="large">
      <div v-if="loadingPlans" class="p-8">
        <Loader text="Carregando planos..." />
      </div>
      <div v-else-if="userPlans.length === 0" class="p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="text-gray-500">Nenhum plano encontrado para este usuário</p>
      </div>
      <div v-else>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome do Plano
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data de Início
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data de Fim
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Pago
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="plan in userPlans" :key="plan.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ plan.plan?.name || 'Plano não encontrado' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(plan.start_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ plan.end_date ? formatDate(plan.end_date) : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                R$ {{ formatPrice(plan.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getPlanStatusClass(plan.status)"
                >
                  {{ getPlanStatusLabel(plan.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Modal>

    <!-- Modal Trocar Senha -->
    <Modal
      :show="showChangePasswordModal"
      @close="closeChangePasswordModal"
      :title="`Trocar senha de ${userToChangePassword?.name || userToChangePassword?.nome_completo || 'Usuário'}`"
    >
      <form @submit.prevent="submitChangePassword" class="space-y-4">
        <div>
          <FormInput
            v-model="changePasswordForm.password"
            label="Nova senha"
            type="password"
            required
            minlength="8"
            :error="changePasswordErrors.password"
          />
        </div>
        <div>
          <FormInput
            v-model="changePasswordForm.password_confirmation"
            label="Confirmar nova senha"
            type="password"
            required
            minlength="8"
            :error="changePasswordErrors.password_confirmation"
          />
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeChangePasswordModal"
            class="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="changingPassword"
          >
            {{ changingPassword ? 'Alterando...' : 'Alterar senha' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Modal Criar Usuário Atendente -->
    <Modal :show="showCreateAttendantModal" @close="closeCreateModal" title="Criar Usuário Atendente">
      <form @submit.prevent="createAttendant" class="space-y-4">
        <div>
          <FormInput
            v-model="attendantForm.name"
            label="Nome Completo"
            type="text"
            required
            :error="errors.name"
          />
        </div>
        <div>
          <FormInput
            v-model="attendantForm.email"
            label="Email"
            type="email"
            required
            :error="errors.email"
          />
        </div>
        <div>
          <FormInput
            v-model="attendantForm.password"
            label="Senha"
            type="password"
            required
            :error="errors.password"
          />
        </div>
        <div>
          <FormInput
            v-model="attendantForm.password_confirmation"
            label="Confirmar Senha"
            type="password"
            required
            :error="errors.password_confirmation"
          />
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeCreateModal"
            class="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="creating"
          >
            {{ creating ? 'Criando...' : 'Criar Atendente' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Loader from '@/components/Loader.vue'
import Modal from '@/components/Modal.vue'
import FormInput from '@/components/FormInput.vue'
import api from '@/services/api'

const users = ref([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const showCreateAttendantModal = ref(false)
const creating = ref(false)
const errors = ref({})
const showPlansModal = ref(false)
const selectedUser = ref(null)
const userPlans = ref([])
const loadingPlans = ref(false)
const showChangePasswordModal = ref(false)
const userToChangePassword = ref(null)
const changingPassword = ref(false)
const changePasswordErrors = ref({})
const changePasswordForm = ref({
  password: '',
  password_confirmation: ''
})

const attendantForm = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
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
  
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }
  
  return filtered
})

const getStatusClass = (status) => {
  const classes = {
    'ativo': 'bg-green-100 text-green-800',
    'inativo': 'bg-gray-100 text-gray-800',
    'suspenso': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const getRoleClass = (role) => {
  const classes = {
    'admin': 'bg-purple-100 text-purple-800',
    'servicedesk': 'bg-green-100 text-green-800',
    'user': 'bg-blue-100 text-blue-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

const getRoleLabel = (role) => {
  const labels = {
    'admin': 'Administrador',
    'servicedesk': 'Atendente',
    'user': 'Usuário'
  }
  return labels[role] || 'Usuário'
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/users')
    
    // A resposta vem como { success: true, data: [...] }
    if (response.data && response.data.success) {
      const usersData = response.data.data
      
      if (Array.isArray(usersData)) {
        users.value = usersData
      } else if (usersData && usersData.data && Array.isArray(usersData.data)) {
        // Se for paginação
        users.value = usersData.data
      } else {
        users.value = []
      }
    } else if (Array.isArray(response.data)) {
      users.value = response.data
    } else {
      users.value = []
    }
  } catch (error) {
    console.error('Erro ao carregar usuários:', error)
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Dados:', error.response.data)
    }
    users.value = []
    alert('Erro ao carregar usuários. Verifique o console para mais detalhes.')
  } finally {
    loading.value = false
  }
}


const toggleUserStatus = async (user) => {
  try {
    const currentStatus = user.status || 'ativo'
    const newStatus = currentStatus === 'ativo' ? 'suspenso' : 'ativo'
    await api.put(`/users/${user.id}`, { status: newStatus })
    user.status = newStatus
    await fetchUsers()
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error)
  }
}

const deleteUser = async (user) => {
  const userName = user.name || user.nome_completo || 'este usuário'
  if (confirm(`Tem certeza que deseja excluir o usuário ${userName}?`)) {
    try {
      await api.delete(`/users/${user.id}`)
      await fetchUsers()
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
    }
  }
}

const createAttendant = async () => {
  creating.value = true
  errors.value = {}
  
  try {
    const response = await api.post('/admin/users/attendant', {
      name: attendantForm.value.name,
      email: attendantForm.value.email,
      password: attendantForm.value.password,
      password_confirmation: attendantForm.value.password_confirmation,
      role: 'servicedesk'
    })
    
    if (response.data.success) {
      alert('Usuário atendente criado com sucesso!')
      closeCreateModal()
      await fetchUsers()
    }
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      alert(error.response?.data?.message || 'Erro ao criar usuário atendente')
    }
  } finally {
    creating.value = false
  }
}

const closeCreateModal = () => {
  showCreateAttendantModal.value = false
  attendantForm.value = {
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  }
  errors.value = {}
}

const viewUserPlans = async (user) => {
  selectedUser.value = user
  showPlansModal.value = true
  loadingPlans.value = true
  userPlans.value = []
  
  try {
    console.log('Buscando planos para usuário:', user.id, user.email)
    const response = await api.get('/subscriptions', {
      params: {
        user_id: user.id
      }
    })
    
    console.log('Resposta da API de subscriptions:', response)
    
    // A resposta pode vir em diferentes formatos
    let plans = []
    
    if (response && response.data) {
      if (response.data.success && Array.isArray(response.data.data)) {
        plans = response.data.data
      } else if (Array.isArray(response.data)) {
        plans = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        plans = response.data.data
      }
    } else if (Array.isArray(response)) {
      plans = response
    }
    
    console.log('Planos processados:', plans)
    
    // Ordenar do mais recente para o mais antigo por data de início
    userPlans.value = plans.sort((a, b) => {
      const dateA = new Date(a.start_date || a.created_at || 0)
      const dateB = new Date(b.start_date || b.created_at || 0)
      return dateB - dateA // Mais recente primeiro
    })
    
    console.log('Planos ordenados:', userPlans.value)
  } catch (error) {
    console.error('Erro ao carregar planos do usuário:', error)
    console.error('Detalhes do erro:', error.response?.data || error.message)
    alert(`Erro ao carregar planos do usuário: ${error.response?.data?.message || error.message || 'Erro desconhecido'}`)
    userPlans.value = []
  } finally {
    loadingPlans.value = false
  }
}

const closePlansModal = () => {
  showPlansModal.value = false
  selectedUser.value = null
  userPlans.value = []
}

const openChangePasswordModal = (user) => {
  userToChangePassword.value = user
  changePasswordForm.value = { password: '', password_confirmation: '' }
  changePasswordErrors.value = {}
  showChangePasswordModal.value = true
}

const closeChangePasswordModal = () => {
  showChangePasswordModal.value = false
  userToChangePassword.value = null
  changePasswordForm.value = { password: '', password_confirmation: '' }
  changePasswordErrors.value = {}
}

const submitChangePassword = async () => {
  changePasswordErrors.value = {}
  
  if (changePasswordForm.value.password.length < 8) {
    changePasswordErrors.value.password = 'A senha deve ter pelo menos 8 caracteres'
    return
  }
  
  if (changePasswordForm.value.password !== changePasswordForm.value.password_confirmation) {
    changePasswordErrors.value.password_confirmation = 'As senhas não coincidem'
    return
  }

  changingPassword.value = true
  try {
    await api.put(`/users/${userToChangePassword.value.id}`, {
      password: changePasswordForm.value.password,
      password_confirmation: changePasswordForm.value.password_confirmation
    })
    alert('Senha alterada com sucesso!')
    closeChangePasswordModal()
  } catch (error) {
    if (error.response?.data?.errors) {
      changePasswordErrors.value = error.response.data.errors
    } else {
      alert(error.response?.data?.message || 'Erro ao alterar senha')
    }
  } finally {
    changingPassword.value = false
  }
}

const formatPrice = (price) => {
  if (!price) return '0,00'
  return parseFloat(price).toFixed(2).replace('.', ',')
}

const getPlanStatusClass = (status) => {
  const classes = {
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800',
    'expired': 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getPlanStatusLabel = (status) => {
  const labels = {
    'active': 'Ativo',
    'inactive': 'Inativo',
    'cancelled': 'Cancelado',
    'expired': 'Expirado'
  }
  return labels[status] || status
}

onMounted(() => {
  fetchUsers()
})
</script>

