<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Solicitações de Selos</h1>
      <p class="text-gray-600">Aprove ou reprove solicitações de selos dos usuários</p>
    </div>

    <!-- Tabs de filtro -->
    <div class="bg-white rounded-lg shadow-sm mb-6">
      <div class="flex border-b border-gray-200">
        <button
          type="button"
          @click="activeTab = 'para_aprovar'; goToPage(1)"
          class="px-6 py-4 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'para_aprovar'
            ? 'border-trust-500 text-trust-600 bg-trust-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          Para Aprovar
          <span v-if="pendingCount > 0" class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-trust-100 text-trust-800">
            {{ pendingCount }}
          </span>
        </button>
        <button
          type="button"
          @click="activeTab = 'aprovados'; goToPage(1)"
          class="px-6 py-4 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'aprovados'
            ? 'border-trust-500 text-trust-600 bg-trust-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          Aprovados
          <span v-if="approvedCount > 0" class="ml-2 text-gray-400 text-xs">({{ approvedCount }})</span>
        </button>
        <button
          type="button"
          @click="activeTab = 'rejeitados'; goToPage(1)"
          class="px-6 py-4 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'rejeitados'
            ? 'border-trust-500 text-trust-600 bg-trust-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          Rejeitados
          <span v-if="rejectedCount > 0" class="ml-2 text-gray-400 text-xs">({{ rejectedCount }})</span>
        </button>
      </div>
      <div class="p-4 border-t border-gray-100 flex flex-wrap items-center gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por usuário..."
          class="input-field max-w-md"
          @keyup.enter="goToPage(1)"
        />
        <button
          type="button"
          class="btn-secondary text-sm"
          @click="goToPage(1)"
        >
          Buscar
        </button>
        <select v-model="perPage" class="input-field w-24" @change="goToPage(1)">
          <option :value="10">10 por página</option>
          <option :value="15">15 por página</option>
          <option :value="25">25 por página</option>
          <option :value="50">50 por página</option>
        </select>
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
        <p class="text-gray-500">{{ emptyStateMessage }}</p>
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
                      <!-- Imagem - carrega via API com autenticação -->
                      <SealDocumentImage
                        v-else
                        :document="doc"
                        :request-id="request.id"
                        @click="openImageModal(doc, request)"
                      />
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
              <template v-else-if="request.status === 'rejected'">
                <button
                  @click="revertRejection(request.id)"
                  class="btn-secondary whitespace-nowrap bg-blue-500 hover:bg-blue-600 text-white"
                  :disabled="processing"
                >
                  Reverter Rejeição
                </button>
                <button
                  @click="deleteRequest(request.id)"
                  class="btn-secondary whitespace-nowrap bg-red-500 hover:bg-red-600 text-white"
                  :disabled="processing"
                >
                  Excluir
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginação -->
      <div
        v-if="pagination.last_page > 1"
        class="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50"
      >
        <p class="text-sm text-gray-600">
          Mostrando {{ pagination.from || 0 }} a {{ pagination.to || 0 }} de {{ pagination.total }} solicitações
        </p>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="pagination.current_page <= 1"
            @click="goToPage(pagination.current_page - 1)"
          >
            Anterior
          </button>
          <span class="px-3 py-1.5 text-sm text-gray-600">
            Página {{ pagination.current_page }} de {{ pagination.last_page }}
          </span>
          <button
            type="button"
            class="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="pagination.current_page >= pagination.last_page"
            @click="goToPage(pagination.current_page + 1)"
          >
            Próxima
          </button>
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
    <Modal :show="showImageModal" @close="closeImageModal" :title="selectedImage?.document_type === 'frente' ? 'Imagem da Frente' : 'Imagem de Trás'" size="large">
      <div v-if="selectedImage && selectedRequestForImage" class="flex flex-col items-center">
        <SealDocumentImage
          :document="selectedImage"
          :request-id="selectedRequestForImage.id"
          full-view
        />
        <p class="text-sm text-gray-500 mt-2">{{ selectedImage.file_name }}</p>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Loader from '@/components/Loader.vue'
import Modal from '@/components/Modal.vue'
import SealDocumentImage from '@/components/SealDocumentImage.vue'
import api from '@/services/api'
import { CONFIG } from '@/config/environment'
import { subscribeSealRequests } from '@/services/echo'

const requests = ref([])
const loading = ref(true)
const searchQuery = ref('')
const activeTab = ref('para_aprovar') // 'para_aprovar' | 'aprovados' | 'rejeitados'
const processing = ref(false)
const showRejectModalOpen = ref(false)
const showImageModal = ref(false)
const selectedRequest = ref(null)
const selectedRequestForImage = ref(null)
const selectedImage = ref(null)
const rejectReason = ref('')
const currentPage = ref(1)
const perPage = ref(15)
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: null,
  to: null,
  count_pending: 0,
  count_approved: 0,
  count_rejected: 0,
})

const pendingCount = computed(() => pagination.value.count_pending)
const approvedCount = computed(() => pagination.value.count_approved)
const rejectedCount = computed(() => pagination.value.count_rejected)

// Dados já vêm filtrados pelo backend conforme activeTab
const filteredRequests = computed(() => requests.value)

const emptyStateMessage = computed(() => {
  const messages = {
    para_aprovar: 'Nenhuma solicitação pendente de aprovação',
    aprovados: 'Nenhuma solicitação aprovada',
    rejeitados: 'Nenhuma solicitação rejeitada'
  }
  return messages[activeTab.value] || 'Nenhuma solicitação encontrada'
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
  const storageBase = CONFIG.STORAGE_BASE_URL || window.location.origin
  // Priorizar file_url se disponível (URL completa gerada pelo backend)
  if (fileUrl) {
    if (fileUrl.startsWith('http')) return fileUrl
    const url = fileUrl.startsWith('/') ? `${storageBase}${fileUrl}` : `${storageBase}/${fileUrl}`
    return url
  }
  if (!filePath) return ''
  if (filePath.startsWith('http')) return filePath
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`
  return `${storageBase}/storage${cleanPath}`
}

const getStatusParam = () => {
  if (activeTab.value === 'para_aprovar') return 'para_aprovar'
  if (activeTab.value === 'aprovados') return 'aprovados'
  if (activeTab.value === 'rejeitados') return 'rejeitados'
  return ''
}

const fetchRequests = async (showLoading = true, page = currentPage.value) => {
  if (showLoading) loading.value = true
  try {
    const params = {
      page,
      per_page: perPage.value,
      status: getStatusParam(),
      include_counts: 1,
    }
    if (searchQuery.value.trim()) params.search = searchQuery.value.trim()

    const response = await api.get('/servicedesk/requests', { params })
    const data = response.data.data || response.data
    const meta = response.data.meta || {}

    pagination.value = {
      current_page: meta.current_page ?? 1,
      last_page: meta.last_page ?? 1,
      per_page: meta.per_page ?? perPage.value,
      total: meta.total ?? 0,
      from: meta.from ?? null,
      to: meta.to ?? null,
      count_pending: meta.count_pending ?? 0,
      count_approved: meta.count_approved ?? 0,
      count_rejected: meta.count_rejected ?? 0,
    }

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

    // Buscar documentos para cada solicitação da página
    for (let request of flatRequests) {
      try {
        const detailResponse = await api.get(`/servicedesk/requests/${request.id}`)
        if (detailResponse.data.success && detailResponse.data.data) {
          request.documents = (detailResponse.data.data.documents || []).map(doc => {
            const storageBase = CONFIG.STORAGE_BASE_URL || window.location.origin
            const path = doc.file_path?.startsWith('/') ? doc.file_path.slice(1) : (doc.file_path || '')
            const fullStorageUrl = path ? `${storageBase.replace(/\/$/, '')}/storage/${path}` : null
            return { ...doc, file_url: fullStorageUrl || doc.file_url }
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
    if (showLoading) loading.value = false
  }
}

const goToPage = (page) => {
  if (page < 1) return
  currentPage.value = page
  fetchRequests(true, page)
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

const revertRejection = async (requestId) => {
  if (!confirm('Tem certeza que deseja reverter a rejeição? A solicitação voltará para análise.')) return

  processing.value = true
  try {
    const response = await api.post(`/servicedesk/requests/${requestId}/revert-rejection`)
    if (response.data.success) {
      alert('Rejeição revertida com sucesso!')
      await fetchRequests()
    } else {
      alert(response.data.message || 'Erro ao reverter rejeição')
    }
  } catch (error) {
    console.error('Erro ao reverter rejeição:', error)
    alert(error.response?.data?.message || 'Erro ao reverter rejeição')
  } finally {
    processing.value = false
  }
}

const deleteRequest = async (requestId) => {
  if (!confirm('Tem certeza que deseja excluir esta solicitação rejeitada? A ação não pode ser desfeita.')) return

  processing.value = true
  try {
    const response = await api.delete(`/servicedesk/requests/${requestId}`)
    if (response.data.success) {
      alert('Solicitação excluída com sucesso!')
      await fetchRequests()
    } else {
      alert(response.data.message || 'Erro ao excluir solicitação')
    }
  } catch (error) {
    console.error('Erro ao excluir solicitação:', error)
    alert(error.response?.data?.message || 'Erro ao excluir solicitação')
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

const openImageModal = (doc, request) => {
  selectedImage.value = doc
  selectedRequestForImage.value = request
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
  selectedImage.value = null
  selectedRequestForImage.value = null
}

let unsubscribeSealRequests = () => {}

onMounted(() => {
  fetchRequests()
  // WebSocket: recarregar em background (sem spinner)
  unsubscribeSealRequests = subscribeSealRequests(() => fetchRequests(false))
})

onUnmounted(() => {
  unsubscribeSealRequests()
})
</script>

