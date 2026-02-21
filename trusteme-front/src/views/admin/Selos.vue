<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Selos</h1>
      <p class="text-gray-600">Gerencie os selos disponíveis no sistema</p>
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
            Novo Selo
          </button>
        </div>
      </div>
    </div>

    <!-- Selos Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">
            Selos ({{ selos.length }})
          </h2>
        </div>
      </div>

      <div v-if="loading" class="p-8">
        <Loader text="Carregando selos..." />
      </div>

      <div v-else-if="selos.length === 0" class="p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
        <p class="text-gray-500">Nenhum selo encontrado</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Custo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="selo in filteredSelos" :key="selo.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ selo.codigo }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ selo.nome || selo.descricao || 'Sem nome' }}</div>
                <div v-if="selo.descricao && selo.nome" class="text-xs text-gray-500">{{ selo.descricao }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  R$ {{ (selo.custo_obtencao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    selo.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ selo.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="editSelo(selo)"
                    class="text-trust-600 hover:text-trust-900"
                  >
                    Editar
                  </button>
                  <button
                    @click="deleteSelo(selo)"
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
      <form @submit.prevent="saveSelo" class="space-y-4">
        <div>
          <FormInput
            v-model="seloForm.codigo"
            label="Código"
            type="text"
            required
            :error="errors.codigo"
            placeholder="Ex: SELO001"
          />
        </div>
        <div>
          <FormInput
            v-model="seloForm.nome"
            label="Nome do Selo"
            type="text"
            required
            :error="errors.nome"
            placeholder="Nome do selo"
          />
        </div>
        <div>
          <FormInput
            v-model="seloForm.descricao"
            label="Descrição"
            type="text"
            :error="errors.descricao"
            placeholder="Descrição breve do selo"
          />
        </div>
        <div>
          <FormInput
            v-model="seloForm.validade"
            label="Validade (dias)"
            type="number"
            min="0"
            :error="errors.validade"
            placeholder="Ex: 365"
          />
        </div>
        
        <!-- Lista de Documentos e Evidências -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Documentos e Evidências Necessárias
          </label>
          <p class="text-xs text-gray-500 mb-2">Marque como obrigatório os documentos que o usuário deve enviar para solicitar o selo.</p>
            <div class="space-y-2">
              <div
                v-for="(doc, index) in seloForm.documentos_evidencias"
                :key="index"
                class="flex items-center gap-2 flex-wrap"
              >
                <FormInput
                  v-model="seloForm.documentos_evidencias[index].nome"
                  :label="`Documento ${index + 1}`"
                  type="text"
                  placeholder="Ex: RG, CPF, Comprovante de residência..."
                  class="flex-1 min-w-[200px]"
                />
                <label class="flex items-center gap-1.5 shrink-0 mt-6">
                  <input
                    type="checkbox"
                    v-model="seloForm.documentos_evidencias[index].obrigatorio"
                    class="form-checkbox h-4 w-4 text-trust-600"
                  >
                  <span class="text-sm text-gray-700">Obrigatório</span>
                </label>
                <button
                  type="button"
                  @click="removeDocumento(index)"
                  class="mt-6 px-3 py-2 text-red-600 hover:text-red-800"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <button
                type="button"
                @click="addDocumento"
                class="text-sm text-trust-600 hover:text-trust-800 flex items-center"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Adicionar Documento
              </button>
            </div>
        </div>

        <!-- Descrição de como obter o selo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Descrição de Como Obter o Selo
          </label>
          <textarea
            v-model="seloForm.descricao_como_obter"
            rows="4"
            class="input-field"
            placeholder="Descreva o processo para obter este selo..."
            :error="errors.descricao_como_obter"
          ></textarea>
          <p v-if="errors.descricao_como_obter" class="mt-1 text-sm text-red-600">{{ errors.descricao_como_obter }}</p>
        </div>

        <!-- Custo de obtenção -->
        <div>
          <FormInput
            v-model="seloForm.custo_obtencao"
            label="Custo de Obtenção (R$)"
            type="number"
            step="0.01"
            min="0"
            :error="errors.custo_obtencao"
            placeholder="0.00"
          />
        </div>

        <div>
          <label class="flex items-center">
            <input
              type="checkbox"
              v-model="seloForm.ativo"
              class="form-checkbox h-4 w-4 text-trust-600"
            >
            <span class="ml-2 text-sm text-gray-700">Ativo</span>
          </label>
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

const selos = ref([])
const loading = ref(true)
const saving = ref(false)
const searchQuery = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingSelo = ref(null)
const errors = ref({})

const seloForm = reactive({
  codigo: '',
  nome: '',
  descricao: '',
  validade: '',
  data_validade: '',
  documentos_evidencias: [],
  descricao_como_obter: '',
  custo_obtencao: 0,
  ativo: true
})

const addDocumento = () => {
  seloForm.documentos_evidencias.push({ nome: '', obrigatorio: true })
}

const removeDocumento = (index) => {
  seloForm.documentos_evidencias.splice(index, 1)
}

const modalTitle = computed(() => {
  return showEditModal.value ? 'Editar Selo' : 'Novo Selo'
})

const filteredSelos = computed(() => {
  if (!searchQuery.value) return selos.value
  
  const query = searchQuery.value.toLowerCase()
  return selos.value.filter(selo => 
    selo.codigo?.toLowerCase().includes(query) ||
    selo.nome?.toLowerCase().includes(query) ||
    selo.descricao?.toLowerCase().includes(query)
  )
})

const fetchSelos = async () => {
  loading.value = true
  try {
    // Endpoint do admin para listar selos
    const response = await api.get('/selos')
    const data = response.data.data || response.data
    
    if (Array.isArray(data)) {
      selos.value = data
    } else if (data && Array.isArray(data.data)) {
      selos.value = data.data
    } else {
      selos.value = []
    }
  } catch (error) {
    console.error('Erro ao carregar selos:', error)
    selos.value = []
  } finally {
    loading.value = false
  }
}

const editSelo = async (selo) => {
  try {
    console.log('Carregando dados do selo:', selo.id)
    const response = await api.get(`/selos/${selo.id}`)
    const seloData = response.data.data || response.data
    console.log('Dados do selo carregados:', seloData)
    
    editingSelo.value = seloData
    seloForm.codigo = String(seloData.codigo || '').trim()
    seloForm.nome = String(seloData.nome || seloData.descricao || '').trim()
    seloForm.descricao = String(seloData.descricao || '').trim()
    seloForm.validade = seloData.validade ? String(seloData.validade) : ''
    // Normalizar formato: aceita array de strings (legado) ou [{nome, obrigatorio}]
    const raw = seloData.documentos_evidencias
    if (Array.isArray(raw) && raw.length > 0) {
      seloForm.documentos_evidencias = raw.map(item =>
        typeof item === 'string'
          ? { nome: item.trim(), obrigatorio: true }
          : { nome: (item.nome || '').trim(), obrigatorio: item.obrigatorio !== false }
      ).filter(d => d.nome !== '')
    } else {
      seloForm.documentos_evidencias = []
    }
    seloForm.descricao_como_obter = String(seloData.descricao_como_obter || '').trim()
    seloForm.custo_obtencao = seloData.custo_obtencao || 0
    seloForm.ativo = Boolean(seloData.ativo !== undefined ? seloData.ativo : true)
    showEditModal.value = true
  } catch (error) {
    console.error('Erro ao carregar dados do selo:', error)
    console.error('Dados do erro:', error.response?.data)
    if (error.response?.data?.message) {
      alert(error.response.data.message)
    } else {
      alert('Erro ao carregar dados do selo')
    }
  }
}

const deleteSelo = async (selo) => {
  if (!confirm(`Tem certeza que deseja excluir o selo "${selo.descricao}"?`)) {
    return
  }

  try {
    await api.delete(`/selos/${selo.id}`)
    await fetchSelos()
  } catch (error) {
    console.error('Erro ao excluir selo:', error)
    alert('Erro ao excluir selo')
  }
}

const saveSelo = async () => {
  saving.value = true
  errors.value = {}

  try {
    // Preparar dados para envio
    const dadosParaEnviar = {
      codigo: String(seloForm.codigo).trim(),
      nome: String(seloForm.nome).trim(),
      descricao: seloForm.descricao ? String(seloForm.descricao).trim() : null,
      validade: seloForm.validade ? parseInt(seloForm.validade) : null,
      documentos_evidencias: seloForm.documentos_evidencias
        .filter(doc => doc.nome && String(doc.nome).trim() !== '')
        .map(doc => ({ nome: String(doc.nome).trim(), obrigatorio: Boolean(doc.obrigatorio) })),
      descricao_como_obter: seloForm.descricao_como_obter ? String(seloForm.descricao_como_obter).trim() : null,
      custo_obtencao: seloForm.custo_obtencao != null && seloForm.custo_obtencao !== '' ? parseFloat(seloForm.custo_obtencao) : 0,
      ativo: Boolean(seloForm.ativo)
    }

    console.log('Dados a serem enviados:', dadosParaEnviar)

    if (showEditModal.value) {
      console.log('Editando selo:', editingSelo.value.id)
      const response = await api.put(`/selos/${editingSelo.value.id}`, dadosParaEnviar)
      console.log('Resposta da API:', response.data)
    } else {
      console.log('Criando novo selo')
      const response = await api.post('/selos', dadosParaEnviar)
      console.log('Resposta da API:', response.data)
    }

    await fetchSelos()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar selo:', error)
    console.error('Dados do erro:', error.response?.data)
    
    // Limpar erros anteriores
    errors.value = {}
    
    if (error.response?.data?.errors) {
      // Normalizar: Laravel retorna { campo: ['msg'] }, FormInput espera string
      const raw = error.response.data.errors
      errors.value = Object.fromEntries(
        Object.entries(raw).map(([key, val]) => [
          key,
          Array.isArray(val) ? val.join(' ') : String(val ?? '')
        ])
      )
      
      // Mapear nomes de campos para português
      const fieldNames = {
        codigo: 'Código',
        nome: 'Nome do Selo',
        descricao: 'Descrição',
        validade: 'Validade (dias)',
        documentos_evidencias: 'Documentos e Evidências',
        descricao_como_obter: 'Descrição de Como Obter',
        custo_obtencao: 'Custo de Obtenção',
        ativo: 'Status'
      }
      
      // Tratar mensagens de erro específicas
      const errorMessages = Object.entries(error.response.data.errors).map(([field, messages]) => {
        const fieldName = fieldNames[field] || field
        const messageArray = Array.isArray(messages) ? messages : [messages]
        
        // Traduzir mensagens comuns
        const translatedMessages = messageArray.map(msg => {
          if (msg.includes('has already been taken')) {
            return 'já está em uso. Escolha outro valor.'
          }
          if (msg.includes('is required')) {
            return 'é obrigatório.'
          }
          if (msg.includes('must be')) {
            return msg.replace('must be', 'deve ser')
          }
          return msg
        })
        
        return `${fieldName}: ${translatedMessages.join(', ')}`
      })

      if (errorMessages.length > 0) {
        alert('Erros de validação:\n\n' + errorMessages.join('\n'))
      }
    } else if (error.response?.data?.message) {
      alert('Erro: ' + error.response.data.message)
    } else if (error.response?.status === 500) {
      // Erro 500 - erro interno do servidor
      const errorDetail = error.response?.data?.error || error.response?.data?.detail || 'Erro interno do servidor'
      const fullMessage = `Erro ao salvar selo (500):\n\n${errorDetail}`
      alert(fullMessage)
      console.error('Detalhes completos do erro:', error.response?.data)
    } else {
      const status = error.response?.status || 'Desconhecido'
      alert(`Erro ao salvar selo.\n\nStatus: ${status}\n\nVerifique os dados e tente novamente.`)
    }
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingSelo.value = null
  seloForm.codigo = ''
  seloForm.nome = ''
  seloForm.descricao = ''
  seloForm.validade = ''
  seloForm.documentos_evidencias = []
  seloForm.descricao_como_obter = ''
  seloForm.custo_obtencao = 0
  seloForm.ativo = true
  errors.value = {}
}

onMounted(() => {
  fetchSelos()
})
</script> 