<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Solicitações de Selos</h1>
      <p class="text-gray-600">Aprove ou reprove solicitações de selos dos usuários</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <select v-model="statusFilter" class="input-field">
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="under_review">Em Revisão</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Rejeitado</option>
          </select>
        </div>
        <div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por usuário..."
            class="input-field"
          />
        </div>
      </div>
    </div>

    <!-- Requests List -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8">
        <Loader text="Carregando solicitações..." />
      </div>

      <div v-else-if="filteredRequests.length === 0" class="p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="text-gray-500">Nenhuma solicitação encontrada</p>
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="request in filteredRequests"
          :key="request.id"
          class="p-6 hover:bg-gray-50"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-trust-100 rounded-full flex items-center justify-center">
                  <span class="text-trust-600 font-semibold">
                    {{ (request.user_name || 'U').charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ request.user_name }}</h3>
                  <p class="text-sm text-gray-500">{{ request.user_email }}</p>
                </div>
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="getStatusClass(request.status)"
                >
                  {{ getStatusLabel(request.status) }}
                </span>
              </div>

              <div class="mb-4">
                <p class="text-sm text-gray-600 mb-2">
                  <strong>Selo:</strong> {{ request.seal_type_name || 'N/A' }}
                </p>
                <p class="text-sm text-gray-500">
                  Solicitado em: {{ formatDate(request.created_at) }}
                </p>
              </div>

              <!-- Documentos -->
              <div v-if="request.documents && request.documents.length > 0" class="mb-4">
                <p class="text-sm font-semibold text-gray-700 mb-2">Documentos Enviados:</p>
                <div class="grid grid-cols-2 gap-4">
                  <div
                    v-for="doc in request.documents"
                    :key="doc.id"
                    class="border border-gray-200 rounded-lg p-4"
                  >
                    <p class="text-sm font-medium text-gray-700 mb-2">
                      {{ doc.document_type === 'frente' ? 'Imagem da Frente' : 'Imagem de Trás' }}
                    </p>
                    <div class="relative w-full h-48 bg-gray-100 rounded border border-gray-200 overflow-hidden">
                      <!-- PDF -->
                      <div v-if="isPdfFile(doc.file_name)" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-4">
                        <svg class="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                        <p class="text-xs text-gray-500 mb-2">Documento PDF</p>
                        <a
                          :href="getDocumentUrl(doc.file_path, doc.file_url)"
                          target="_blank"
                          class="text-xs text-trust-600 hover:text-trust-700 underline"
                        >
                          Abrir PDF
                        </a>
                      </div>
                      <!-- Imagem -->
                      <img
                        v-else-if="getDocumentUrl(doc.file_path, doc.file_url)"
                        :src="getDocumentUrl(doc.file_path, doc.file_url)"
                        :alt="doc.file_name"
                        class="w-full h-full object-cover cursor-pointer"
                        @click="openImageModal(doc)"
                        @error="handleImageError($event, doc)"
                      />
                      <div v-else class="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <p class="text-xs text-gray-400">Imagem não disponível</p>
                      </div>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">{{ doc.file_name }}</p>
                  </div>
                </div>
              </div>

              <!-- Motivo de Rejeição -->
              <div v-if="request.status === 'rejected' && request.rejection_reason" class="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <p class="text-sm font-semibold text-red-800 mb-1">Motivo da Rejeição:</p>
                <p class="text-sm text-red-700">{{ request.rejection_reason }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="ml-6 flex flex-col gap-2">
              <template v-if="request.status === 'pending' || request.status === 'under_review'">
                <button
                  @click="approveRequest(request.id)"
                  class="btn-primary whitespace-nowrap"
                  :disabled="processing"
                >
                  Aprovar Selo
                </button>
                <button
                  @click="showRejectModal(request)"
                  class="btn-secondary whitespace-nowrap"
                  :disabled="processing"
                >
                  Reprovar
                </button>
              </template>
              <template v-else-if="request.status === 'approved'">
                <button
                  @click="revokeApproval(request.id)"
                  class="btn-secondary whitespace-nowrap bg-orange-500 hover:bg-orange-600 text-white"
                  :disabled="processing"
                >
                  Revogar Aprovação
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Reprovar -->
    <Modal :show="showRejectModalOpen" @close="closeRejectModal" title="Reprovar Solicitação">
      <form @submit.prevent="rejectRequest" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Motivo da Rejeição *
          </label>
          <textarea
            v-model="rejectReason"
            rows="4"
            class="input-field"
            placeholder="Descreva o motivo da rejeição..."
            required
          ></textarea>
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeRejectModal"
            class="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="processing"
          >
            {{ processing ? 'Reprovando...' : 'Reprovar' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Modal Visualizar Imagem -->
    <Modal :show="showImageModal" @close="closeImageModal" :title="selectedImage?.document_type === 'frente' ? 'Imagem da Frente' : 'Imagem de Trás'">
      <div v-if="selectedImage">
        <img
          :src="getDocumentUrl(selectedImage.file_path, selectedImage.file_url)"
          :alt="selectedImage.file_name"
          class="w-full rounded-lg"
        />
        <p class="text-sm text-gray-500 mt-2">{{ selectedImage.file_name }}</p>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Loader from '@/components/Loader.vue'
import Modal from '@/components/Modal.vue'
import api from '@/services/api'

const requests = ref([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const processing = ref(false)
const showRejectModalOpen = ref(false)
const showImageModal = ref(false)
const selectedRequest = ref(null)
const selectedImage = ref(null)
const rejectReason = ref('')

const filteredRequests = computed(() => {
  let filtered = requests.value
  
  if (statusFilter.value) {
    filtered = filtered.filter(req => req.status === statusFilter.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(req => 
      req.user_name?.toLowerCase().includes(query) ||
      req.user_email?.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

const getStatusClass = (status) => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'under_review': 'bg-blue-100 text-blue-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  const labels = {
    'pending': 'Pendente',
    'under_review': 'Em Revisão',
    'approved': 'Aprovado',
    'rejected': 'Rejeitado'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isPdfFile = (fileName) => {
  if (!fileName) return false
  return fileName.toLowerCase().endsWith('.pdf')
}

const getDocumentUrl = (filePath, fileUrl) => {
  // Priorizar file_url se disponível (URL completa gerada pelo backend)
  if (fileUrl) {
    // Garantir que a URL seja absoluta
    if (fileUrl.startsWith('http')) {
      return fileUrl
    }
    // Se for relativa, adicionar a base URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'
    const url = fileUrl.startsWith('/') ? `${baseUrl}${fileUrl}` : `${baseUrl}/${fileUrl}`
    console.log('URL gerada de file_url:', url)
    return url
  }
  if (!filePath) {
    console.warn('getDocumentUrl: filePath e fileUrl estão vazios')
    return ''
  }
  // Se já for uma URL completa, retornar como está
  if (filePath.startsWith('http')) return filePath
  // Construir URL do backend
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'
  // Remover barras duplicadas e garantir formato correto
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`
  const url = `${baseUrl}/storage${cleanPath}`
  console.log('URL gerada de file_path:', url, 'filePath original:', filePath)
  return url
}

const handleImageError = (event, doc) => {
  console.error('Erro ao carregar imagem:', {
    src: event.target.src,
    file_path: doc?.file_path,
    file_url: doc?.file_url
  })
  // Substituir por uma imagem placeholder ou mensagem de erro
  event.target.style.display = 'none'
  const parent = event.target.parentElement
  if (parent && !parent.querySelector('.error-message')) {
    const errorDiv = document.createElement('div')
    errorDiv.className = 'error-message absolute inset-0 flex items-center justify-center bg-gray-100'
    errorDiv.innerHTML = '<p class="text-xs text-gray-400 text-center px-2">Erro ao carregar imagem</p>'
    parent.appendChild(errorDiv)
  }
}

const fetchRequests = async () => {
  loading.value = true
  try {
    // Usar endpoint do admin ou servicedesk
    const response = await api.get('/servicedesk/requests')
    const data = response.data.data || response.data
    
    // Transformar dados agrupados em lista plana
    const flatRequests = []
    if (Array.isArray(data)) {
      data.forEach(group => {
        if (group.requests && Array.isArray(group.requests)) {
          group.requests.forEach(req => {
            flatRequests.push({
              ...req,
              user_name: group.user_name,
              user_email: group.user_email,
              user_id: group.user_id
            })
          })
        }
      })
    }
    
    // Buscar documentos para cada solicitação
    for (let request of flatRequests) {
      try {
        const detailResponse = await api.get(`/servicedesk/requests/${request.id}`)
        if (detailResponse.data.success && detailResponse.data.data) {
          request.documents = (detailResponse.data.data.documents || []).map(doc => {
            // Garantir que file_url seja gerada se não existir
            if (!doc.file_url && doc.file_path) {
              const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'
              const cleanPath = doc.file_path.startsWith('/') ? doc.file_path : `/${doc.file_path}`
              doc.file_url = `${baseUrl}/storage${cleanPath}`
            }
            console.log('Documento processado:', { 
              id: doc.id,
              document_type: doc.document_type,
              file_name: doc.file_name,
              file_path: doc.file_path, 
              file_url: doc.file_url,
              final_url: getDocumentUrl(doc.file_path, doc.file_url)
            })
            return doc
          })
        }
      } catch (error) {
        console.error(`Erro ao carregar documentos da solicitação ${request.id}:`, error)
        request.documents = []
      }
    }
    
    requests.value = flatRequests
  } catch (error) {
    console.error('Erro ao carregar solicitações:', error)
    requests.value = []
  } finally {
    loading.value = false
  }
}

const approveRequest = async (requestId) => {
  if (!confirm('Tem certeza que deseja aprovar esta solicitação?')) return
  
  processing.value = true
  try {
    const response = await api.post(`/servicedesk/requests/${requestId}/approve`)
    if (response.data.success) {
      alert('Solicitação aprovada com sucesso!')
      await fetchRequests()
    }
  } catch (error) {
    console.error('Erro ao aprovar solicitação:', error)
    alert(error.response?.data?.message || 'Erro ao aprovar solicitação')
  } finally {
    processing.value = false
  }
}

const revokeApproval = async (requestId) => {
  if (!confirm('Tem certeza que deseja revogar a aprovação deste selo? O selo será removido do usuário.')) {
    return
  }

  processing.value = true
  try {
    const response = await api.post(`/servicedesk/requests/${requestId}/revoke`)
    if (response.data.success) {
      alert('Aprovação revogada com sucesso!')
      await fetchRequests()
    } else {
      alert(response.data.message || 'Erro ao revogar aprovação')
    }
  } catch (error) {
    console.error('Erro ao revogar aprovação:', error)
    alert(error.response?.data?.message || 'Erro ao revogar aprovação')
  } finally {
    processing.value = false
  }
}

const showRejectModal = (request) => {
  selectedRequest.value = request
  rejectReason.value = ''
  showRejectModalOpen.value = true
}

const closeRejectModal = () => {
  showRejectModalOpen.value = false
  selectedRequest.value = null
  rejectReason.value = ''
}

const rejectRequest = async () => {
  if (!rejectReason.value.trim()) {
    alert('Por favor, informe o motivo da rejeição')
    return
  }
  
  processing.value = true
  try {
    const response = await api.post(`/servicedesk/requests/${selectedRequest.value.id}/reject`, {
      reason: rejectReason.value
    })
    if (response.data.success) {
      alert('Solicitação rejeitada com sucesso!')
      closeRejectModal()
      await fetchRequests()
    }
  } catch (error) {
    console.error('Erro ao reprovar solicitação:', error)
    alert(error.response?.data?.message || 'Erro ao reprovar solicitação')
  } finally {
    processing.value = false
  }
}

const openImageModal = (doc) => {
  selectedImage.value = doc
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
  selectedImage.value = null
}

onMounted(() => {
  fetchRequests()
})
</script>

