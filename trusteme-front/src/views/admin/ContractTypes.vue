<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Tipos de Contrato</h1>
      <p class="text-gray-600">Gerencie os tipos de contrato disponíveis no sistema</p>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por código ou descrição..."
            class="input-field"
          />
        </div>
        <div class="flex justify-end">
          <button @click="showCreateModal = true" class="btn-primary">
            Novo Tipo de Contrato
          </button>
        </div>
      </div>
    </div>

    <!-- Contract Types Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">
            Tipos de Contrato ({{ contractTypes.length }})
          </h2>
        </div>
      </div>

      <div v-if="loading" class="p-8">
        <Loader text="Carregando tipos de contrato..." />
      </div>

      <div v-else-if="contractTypes.length === 0" class="p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="text-gray-500">Nenhum tipo de contrato encontrado</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cláusulas
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="type in filteredContractTypes" :key="type.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ type.codigo }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ type.descricao }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">
                  {{ getClausulasCount(type.id) }} cláusula(s)
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="manageClausulas(type)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Cláusulas
                  </button>
                  <button
                    @click="editContractType(type)"
                    class="text-trust-600 hover:text-trust-900"
                  >
                    Editar
                  </button>
                  <button
                    @click="deleteContractType(type)"
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

    <!-- Create/Edit Modal -->
    <Modal :show="showCreateModal || showEditModal" @close="closeModal" :title="modalTitle">
      <form @submit.prevent="saveContractType" class="space-y-4">
        <div>
          <FormInput
            v-model="contractTypeForm.codigo"
            label="Código"
            type="text"
            required
            :error="errors.codigo"
          />
        </div>
        <div>
          <FormInput
            v-model="contractTypeForm.descricao"
            label="Descrição"
            type="text"
            required
            :error="errors.descricao"
          />
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeModal"
            class="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="saving"
          >
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Manage Clauses Modal -->
    <Modal :show="showClausulasModal" @close="closeClausulasModal" :title="`Cláusulas - ${selectedContractType?.codigo || ''}`">
      <div class="space-y-4">
        <!-- Lista de cláusulas do tipo -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-2">Cláusulas Associadas</h3>
          <div v-if="loadingClausulas" class="p-4 text-center">
            <Loader text="Carregando cláusulas..." />
          </div>
          <div v-else-if="typeClausulas.length === 0" class="p-4 text-center text-gray-500">
            Nenhuma cláusula associada
          </div>
          <div v-else class="space-y-2 max-h-60 overflow-y-auto">
            <div
              v-for="clausula in typeClausulas"
              :key="clausula.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded border"
            >
              <div class="flex-1">
                <div class="text-sm font-medium text-gray-900">{{ clausula.codigo }} - {{ clausula.nome }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ clausula.descricao }}</div>
              </div>
              <button
                @click="removeClausulaFromType(clausula.id)"
                class="text-red-600 hover:text-red-900 text-sm ml-4"
              >
                Remover
              </button>
            </div>
          </div>
        </div>

        <!-- Adicionar cláusula -->
        <div class="border-t pt-4">
          <h3 class="text-sm font-medium text-gray-700 mb-2">Adicionar Cláusula</h3>
          <div class="flex gap-2">
            <select
              v-model="selectedClausulaToAdd"
              class="flex-1 input-field"
            >
              <option value="">Selecione uma cláusula...</option>
              <option
                v-for="clausula in availableClausulas"
                :key="clausula.id"
                :value="clausula.id"
              >
                {{ clausula.codigo }} - {{ clausula.nome }}
              </option>
            </select>
            <button
              @click="addClausulaToType"
              class="btn-primary"
              :disabled="!selectedClausulaToAdd || addingClausula"
            >
              {{ addingClausula ? 'Adicionando...' : 'Adicionar' }}
            </button>
          </div>
          <div class="mt-2">
            <button
              @click="showCreateClausulaModal = true"
              class="text-sm text-trust-600 hover:text-trust-900"
            >
              + Criar nova cláusula
            </button>
          </div>
        </div>

        <!-- Gerenciar Cláusulas Disponíveis -->
        <div class="border-t pt-4">
          <h3 class="text-sm font-medium text-gray-700 mb-2">Gerenciar Cláusulas Disponíveis</h3>
          <div v-if="loadingClausulas" class="p-4 text-center">
            <Loader text="Carregando cláusulas..." />
          </div>
          <div v-else-if="allClausulas.length === 0" class="p-4 text-center text-gray-500">
            Nenhuma cláusula cadastrada
          </div>
          <div v-else class="space-y-2 max-h-60 overflow-y-auto">
            <div
              v-for="clausula in allClausulas"
              :key="clausula.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded border"
            >
              <div class="flex-1">
                <div class="text-sm font-medium text-gray-900">{{ clausula.codigo }} - {{ clausula.nome }}</div>
                <div class="text-xs text-gray-500 mt-1 line-clamp-2">{{ clausula.descricao }}</div>
                <div v-if="clausula.sexual" class="text-xs text-orange-600 mt-1">Cláusula sexual</div>
              </div>
              <div class="flex gap-2 ml-4">
                <button
                  @click="editClausula(clausula)"
                  class="text-trust-600 hover:text-trust-900 text-sm"
                  title="Editar cláusula"
                >
                  Editar
                </button>
                <button
                  @click="deleteClausula(clausula)"
                  class="text-red-600 hover:text-red-900 text-sm"
                  title="Excluir cláusula"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Create/Edit Clause Modal -->
    <Modal :show="showCreateClausulaModal || showEditClausulaModal" @close="closeClausulaModal" :title="clausulaModalTitle">
      <form @submit.prevent="saveClausula" class="space-y-4">
        <div>
          <FormInput
            v-model="clausulaForm.codigo"
            label="Código"
            type="text"
            required
            :error="clausulaErrors.codigo"
          />
        </div>
        <div>
          <FormInput
            v-model="clausulaForm.nome"
            label="Nome"
            type="text"
            required
            :error="clausulaErrors.nome"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            v-model="clausulaForm.descricao"
            rows="3"
            class="input-field"
            required
          ></textarea>
          <p v-if="clausulaErrors.descricao" class="text-red-600 text-xs mt-1">{{ clausulaErrors.descricao }}</p>
        </div>
        <div>
          <label class="flex items-center">
            <input
              v-model="clausulaForm.sexual"
              type="checkbox"
              class="rounded border-gray-300 text-trust-600 focus:ring-trust-500"
            />
            <span class="ml-2 text-sm text-gray-700">Cláusula sexual</span>
          </label>
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeClausulaModal"
            class="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="savingClausula"
          >
            {{ savingClausula ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import Loader from '@/components/Loader.vue'
import Modal from '@/components/Modal.vue'
import FormInput from '@/components/FormInput.vue'
import api from '@/services/api'

const contractTypes = ref([])
const loading = ref(true)
const saving = ref(false)
const searchQuery = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingContractType = ref(null)
const errors = ref({})

const contractTypeForm = reactive({
  codigo: '',
  descricao: ''
})

// Cláusulas
const showClausulasModal = ref(false)
const selectedContractType = ref(null)
const typeClausulas = ref([])
const availableClausulas = ref([])
const allClausulas = ref([]) // Todas as cláusulas do sistema
const loadingClausulas = ref(false)
const addingClausula = ref(false)
const selectedClausulaToAdd = ref('')

// Modal de cláusula
const showCreateClausulaModal = ref(false)
const showEditClausulaModal = ref(false)
const editingClausula = ref(null)
const savingClausula = ref(false)
const clausulaErrors = ref({})

const clausulaForm = reactive({
  codigo: '',
  nome: '',
  descricao: '',
  sexual: false
})

const modalTitle = computed(() => {
  return showEditModal.value ? 'Editar Tipo de Contrato' : 'Novo Tipo de Contrato'
})

const clausulaModalTitle = computed(() => {
  return showEditClausulaModal.value ? 'Editar Cláusula' : 'Nova Cláusula'
})

const filteredContractTypes = computed(() => {
  if (!searchQuery.value) return contractTypes.value
  
  const query = searchQuery.value.toLowerCase()
  return contractTypes.value.filter(type => 
    type.codigo.toLowerCase().includes(query) ||
    type.descricao.toLowerCase().includes(query)
  )
})

const fetchContractTypes = async () => {
  loading.value = true
  try {
    const response = await api.get('/contrato-tipos')
    // A resposta pode vir em result, data ou diretamente como array
    const data = response.data?.result || response.data?.data || response.data
    contractTypes.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Erro ao carregar tipos de contrato:', error)
    contractTypes.value = []
  } finally {
    loading.value = false
  }
}

const editContractType = (type) => {
  editingContractType.value = type
  contractTypeForm.codigo = type.codigo
  contractTypeForm.descricao = type.descricao
  showEditModal.value = true
}

const deleteContractType = async (type) => {
  if (!confirm(`Tem certeza que deseja excluir o tipo de contrato "${type.descricao}"?`)) {
    return
  }

  try {
    const response = await api.delete(`/contrato-tipos/${type.id}`)
    if (response.data?.success) {
      alert('Tipo de contrato excluído com sucesso')
      await fetchContractTypes()
    } else {
      throw new Error(response.data?.message || 'Erro ao excluir tipo de contrato')
    }
  } catch (error) {
    console.error('Erro ao excluir tipo de contrato:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Erro ao excluir tipo de contrato'
    alert(errorMessage)
  }
}

const saveContractType = async () => {
  saving.value = true
  errors.value = {}

  try {
    if (showEditModal.value) {
      await api.put(`/contrato-tipos/${editingContractType.value.id}`, contractTypeForm)
    } else {
      await api.post('/contrato-tipos', contractTypeForm)
    }

    await fetchContractTypes()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar tipo de contrato:', error)
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      alert('Erro ao salvar tipo de contrato')
    }
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingContractType.value = null
  contractTypeForm.codigo = ''
  contractTypeForm.descricao = ''
  errors.value = {}
}

const getClausulasCount = (typeId) => {
  const type = contractTypes.value.find(t => t.id === typeId)
  return type?.clausulas_count || 0
}

const manageClausulas = async (type) => {
  selectedContractType.value = type
  showClausulasModal.value = true
  await loadTypeClausulas(type.id)
  await loadAvailableClausulas()
}

const loadTypeClausulas = async (typeId) => {
  loadingClausulas.value = true
  try {
    const response = await api.get(`/contrato-tipos/${typeId}/clausulas`)
    typeClausulas.value = response.data?.data || response.data?.result || []
  } catch (error) {
    console.error('Erro ao carregar cláusulas:', error)
    typeClausulas.value = []
  } finally {
    loadingClausulas.value = false
  }
}

const loadAvailableClausulas = async () => {
  try {
    const response = await api.get('/clausulas')
    const data = response.data?.result || response.data?.data || []
    allClausulas.value = data
    // Filtrar apenas as que não estão associadas para o combo
    const associatedIds = typeClausulas.value.map(c => c.id)
    availableClausulas.value = data.filter(c => !associatedIds.includes(c.id))
  } catch (error) {
    console.error('Erro ao carregar cláusulas disponíveis:', error)
    allClausulas.value = []
    availableClausulas.value = []
  }
}

const addClausulaToType = async () => {
  if (!selectedClausulaToAdd.value || !selectedContractType.value) return

  addingClausula.value = true
  try {
    await api.post(`/contrato-tipos/${selectedContractType.value.id}/clausulas`, {
      clausula_id: selectedClausulaToAdd.value
    })
    selectedClausulaToAdd.value = ''
    await loadTypeClausulas(selectedContractType.value.id)
    await loadAvailableClausulas()
    await fetchContractTypes() // Atualizar contagem
  } catch (error) {
    console.error('Erro ao adicionar cláusula:', error)
    alert(error.response?.data?.message || 'Erro ao adicionar cláusula')
  } finally {
    addingClausula.value = false
  }
}

const removeClausulaFromType = async (clausulaId) => {
  if (!confirm('Tem certeza que deseja remover esta cláusula do tipo de contrato?')) {
    return
  }

  try {
    await api.delete(`/contrato-tipos/${selectedContractType.value.id}/clausulas/${clausulaId}`)
    await loadTypeClausulas(selectedContractType.value.id)
    await loadAvailableClausulas()
    await fetchContractTypes() // Atualizar contagem
  } catch (error) {
    console.error('Erro ao remover cláusula:', error)
    alert(error.response?.data?.message || 'Erro ao remover cláusula')
  }
}

const closeClausulasModal = () => {
  showClausulasModal.value = false
  selectedContractType.value = null
  typeClausulas.value = []
  availableClausulas.value = []
  allClausulas.value = []
  selectedClausulaToAdd.value = ''
}

const saveClausula = async () => {
  savingClausula.value = true
  clausulaErrors.value = {}

  try {
    if (showEditClausulaModal.value) {
      await api.put(`/clausulas/${editingClausula.value.id}`, clausulaForm)
    } else {
      await api.post('/clausulas', clausulaForm)
    }

    closeClausulaModal()
    await loadAvailableClausulas()
    // Se estiver gerenciando cláusulas de um tipo, recarregar também
    if (selectedContractType.value) {
      await loadTypeClausulas(selectedContractType.value.id)
    }
  } catch (error) {
    console.error('Erro ao salvar cláusula:', error)
    if (error.response?.data?.errors) {
      clausulaErrors.value = error.response.data.errors
    } else {
      alert(error.response?.data?.message || 'Erro ao salvar cláusula')
    }
  } finally {
    savingClausula.value = false
  }
}

const editClausula = (clausula) => {
  editingClausula.value = clausula
  clausulaForm.codigo = clausula.codigo
  clausulaForm.nome = clausula.nome
  clausulaForm.descricao = clausula.descricao
  clausulaForm.sexual = clausula.sexual || false
  showEditClausulaModal.value = true
}

const deleteClausula = async (clausula) => {
  if (!confirm(`Tem certeza que deseja excluir a cláusula "${clausula.codigo} - ${clausula.nome}"?\n\nEsta ação não pode ser desfeita.`)) {
    return
  }

  try {
    await api.delete(`/clausulas/${clausula.id}`)
    alert('Cláusula excluída com sucesso')
    await loadAvailableClausulas()
    // Se a cláusula estava associada ao tipo, recarregar as cláusulas do tipo também
    if (selectedContractType.value) {
      await loadTypeClausulas(selectedContractType.value.id)
    }
  } catch (error) {
    console.error('Erro ao excluir cláusula:', error)
    const errorMessage = error.response?.data?.message || 'Erro ao excluir cláusula'
    alert(errorMessage)
  }
}

const closeClausulaModal = () => {
  showCreateClausulaModal.value = false
  showEditClausulaModal.value = false
  editingClausula.value = null
  clausulaForm.codigo = ''
  clausulaForm.nome = ''
  clausulaForm.descricao = ''
  clausulaForm.sexual = false
  clausulaErrors.value = {}
}

onMounted(() => {
  fetchContractTypes()
})
</script> 