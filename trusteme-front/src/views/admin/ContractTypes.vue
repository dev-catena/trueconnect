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
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
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

const modalTitle = computed(() => {
  return showEditModal.value ? 'Editar Tipo de Contrato' : 'Novo Tipo de Contrato'
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
    contractTypes.value = response.data.data || response.data
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
    await api.delete(`/contrato-tipos/${type.id}`)
    await fetchContractTypes()
  } catch (error) {
    console.error('Erro ao excluir tipo de contrato:', error)
    alert('Erro ao excluir tipo de contrato')
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

onMounted(() => {
  fetchContractTypes()
})
</script> 