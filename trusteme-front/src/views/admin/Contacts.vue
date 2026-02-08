
<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Contatos</h1>
      <p class="text-gray-600">Gerencie informações de contato e visualize mensagens</p>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <nav class="flex space-x-8" aria-label="Tabs">
        <button
          @click="activeTab = 'info'"
          :class="[
            activeTab === 'info'
              ? 'border-trust-500 text-trust-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          Informações de Contato
        </button>
        <button
          @click="activeTab = 'messages'"
          :class="[
            activeTab === 'messages'
              ? 'border-trust-500 text-trust-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          Mensagens Recebidas
          <span v-if="newMessagesCount > 0" class="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
            {{ newMessagesCount }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Contact Info Tab -->
    <div v-if="activeTab === 'info'" class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-semibold mb-6">Editar Informações de Contato</h2>
        
        <form @submit.prevent="saveContactInfo" class="space-y-6">
          <!-- Emails -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email Principal</label>
              <input v-model="contactForm.contact_email_primary" type="email" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email de Suporte</label>
              <input v-model="contactForm.contact_email_support" type="email" class="input-field" />
            </div>
          </div>

          <!-- Telefones -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Telefone Principal</label>
              <input v-model="contactForm.contact_phone_primary" type="text" class="input-field" placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Telefone Secundário</label>
              <input v-model="contactForm.contact_phone_secondary" type="text" class="input-field" placeholder="(11) 3333-4444" />
            </div>
          </div>

          <!-- Endereço -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
            <textarea v-model="contactForm.contact_address" rows="3" class="input-field" placeholder="Av. Paulista, 1000&#10;São Paulo, SP - 01310-100&#10;Brasil"></textarea>
          </div>

          <!-- Horários -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Horário de Atendimento</label>
            <textarea v-model="contactForm.contact_hours" rows="3" class="input-field" placeholder="Segunda a Sexta: 9h às 18h&#10;Sábado: 9h às 12h&#10;Domingo: Fechado"></textarea>
          </div>

          <!-- Actions -->
          <div class="flex justify-end">
            <button type="submit" :disabled="saving" class="btn-primary">
              <span v-if="saving">Salvando...</span>
              <span v-else>Salvar Alterações</span>
            </button>
          </div>
        </form>

        <!-- Success Message -->
        <div v-if="successMessage" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-green-700">{{ successMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Messages Tab -->
    <div v-if="activeTab === 'messages'">
      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar mensagens..."
              class="input-field"
            />
          </div>
          <div>
            <select v-model="subjectFilter" class="input-field">
              <option value="">Todos os assuntos</option>
              <option value="suporte">Suporte Técnico</option>
              <option value="vendas">Vendas</option>
              <option value="parcerias">Parcerias</option>
              <option value="feedback">Feedback</option>
            </select>
          </div>
          <div>
            <select v-model="statusFilter" class="input-field">
              <option value="">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="answered">Respondido</option>
              <option value="closed">Fechado</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Messages List -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div v-if="loading" class="flex justify-center items-center py-12">
          <Loader />
        </div>

        <div v-else-if="!filteredContacts.length" class="p-6 text-center text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m10-6h.01M10 7h.01"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhuma mensagem encontrada</h3>
          <p class="mt-1 text-sm text-gray-500">Não há mensagens que correspondam aos filtros selecionados.</p>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="contact in filteredContacts"
            :key="contact.id"
            class="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="viewContact(contact)"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <h3 class="text-lg font-medium text-gray-900 mr-3">{{ contact.name }}</h3>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusClass(contact.status)"
                  >
                    {{ getStatusLabel(contact.status) }}
                  </span>
                  <span
                    class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {{ getSubjectLabel(contact.subject) }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-2">{{ contact.email }}</p>
                <p class="text-gray-700 line-clamp-2">{{ contact.message }}</p>
                <div class="flex items-center mt-3 text-sm text-gray-500">
                  <span>{{ formatDate(contact.created_at) }}</span>
                  <span v-if="contact.phone" class="ml-4">{{ contact.phone }}</span>
                </div>
              </div>
              <div class="flex space-x-2 ml-4">
                <button
                  @click.stop="markAsAnswered(contact)"
                  v-if="contact.status === 'pending'"
                  class="text-green-600 hover:text-green-900"
                  title="Marcar como respondido"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </button>
                <button
                  @click.stop="deleteContact(contact)"
                  class="text-red-600 hover:text-red-900"
                  title="Excluir mensagem"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Contact Modal -->
    <Modal v-if="showViewModal" @close="closeViewModal">
      <template #header>
        <h3 class="text-lg font-medium text-gray-900">
          Mensagem de {{ selectedContact?.name }}
        </h3>
      </template>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700">Nome:</label>
            <p class="text-gray-900">{{ selectedContact?.name }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Email:</label>
            <p class="text-gray-900">{{ selectedContact?.email }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700">Telefone:</label>
            <p class="text-gray-900">{{ selectedContact?.phone || 'Não informado' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Assunto:</label>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {{ getSubjectLabel(selectedContact?.subject) }}
            </span>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700">Data:</label>
          <p class="text-gray-900">{{ formatDate(selectedContact?.created_at) }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700">Mensagem:</label>
          <div class="mt-2 p-4 bg-gray-50 rounded-lg">
            <p class="text-gray-900 whitespace-pre-line">{{ selectedContact?.message }}</p>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700">Status:</label>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="getStatusClass(selectedContact?.status)"
          >
            {{ getStatusLabel(selectedContact?.status) }}
          </span>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-between">
          <a
            :href="`mailto:${selectedContact?.email}?subject=Re: ${getSubjectLabel(selectedContact?.subject)}&body=Olá ${selectedContact?.name},%0D%0A%0D%0AObrigado por entrar em contato conosco.%0D%0A%0D%0A`"
            class="btn-primary"
          >
            Responder por Email
          </a>
          <button @click="closeViewModal" class="btn-secondary">
            Fechar
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import Loader from '@/components/Loader.vue'
import Modal from '@/components/Modal.vue'
import api from '@/services/api'

// Tab management
const activeTab = ref('info')

// Contact info form
const contactForm = reactive({
  contact_email_primary: '',
  contact_email_support: '',
  contact_phone_primary: '',
  contact_phone_secondary: '',
  contact_address: '',
  contact_hours: ''
})

const saving = ref(false)
const successMessage = ref('')

// Messages management
const contacts = ref([])
const loading = ref(false)
const searchQuery = ref('')
const subjectFilter = ref('')
const statusFilter = ref('')
const showViewModal = ref(false)
const selectedContact = ref(null)

const newMessagesCount = computed(() => {
  return contacts.value.filter(contact => contact.status === 'pending').length
})

const filteredContacts = computed(() => {
  let filtered = contacts.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(contact => 
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.message.toLowerCase().includes(query)
    )
  }
  
  if (subjectFilter.value) {
    filtered = filtered.filter(contact => contact.subject === subjectFilter.value)
  }
  
  if (statusFilter.value) {
    filtered = filtered.filter(contact => contact.status === statusFilter.value)
  }
  
  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const getStatusClass = (status) => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'answered': 'bg-green-100 text-green-800',
    'closed': 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  const labels = {
    'pending': 'Pendente',
    'answered': 'Respondido',
    'closed': 'Fechado'
  }
  return labels[status] || status
}

const getSubjectLabel = (subject) => {
  const labels = {
    'suporte': 'Suporte Técnico',
    'vendas': 'Vendas',
    'parcerias': 'Parcerias',
    'feedback': 'Feedback'
  }
  return labels[subject] || subject
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

const loadContactInfo = async () => {
  try {
    const { data } = await api.get('/site-content')
    if (data?.success) {
      const settings = data.data
      contactForm.contact_email_primary = settings.contact_email_primary || ''
      contactForm.contact_email_support = settings.contact_email_support || ''
      contactForm.contact_phone_primary = settings.contact_phone_primary || ''
      contactForm.contact_phone_secondary = settings.contact_phone_secondary || ''
      contactForm.contact_address = settings.contact_address || ''
      contactForm.contact_hours = settings.contact_hours || ''
    }
  } catch (error) {
    console.error('Erro ao carregar informações de contato:', error)
  }
}

const saveContactInfo = async () => {
  saving.value = true
  successMessage.value = ''
  
  try {
    const settings = Object.keys(contactForm).map(key => ({
      key: key,
      value: contactForm[key] || ''
    }))

    await api.post('/site-settings/bulk-update', { settings })
    successMessage.value = 'Informações de contato atualizadas com sucesso!'
    
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Erro ao salvar informações de contato:', error)
    alert('Erro ao salvar informações. Tente novamente.')
  } finally {
    saving.value = false
  }
}

const fetchContacts = async () => {
  loading.value = true
  try {
    console.log('Buscando contatos da API...')
    const response = await api.get('/admin/contacts')
    console.log('Resposta da API:', response.data)
    
    // Extrai os dados da resposta paginada do Laravel
    if (response.data.success && response.data.data) {
      if (Array.isArray(response.data.data.data)) {
        // Resposta paginada do Laravel
        contacts.value = response.data.data.data
      } else if (Array.isArray(response.data.data)) {
        // Resposta simples
        contacts.value = response.data.data
      } else {
        contacts.value = []
      }
    } else {
      contacts.value = []
    }
    
    console.log('Contatos carregados:', contacts.value)
    
  } catch (error) {
    console.error('Erro ao carregar contatos:', error)
    contacts.value = []
  } finally {
    loading.value = false
  }
}

const viewContact = (contact) => {
  selectedContact.value = contact
  showViewModal.value = true
  
  // Marcar como lido automaticamente se for pendente
  if (contact.status === 'pending') {
    markAsAnswered(contact)
  }
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedContact.value = null
}

const markAsAnswered = async (contact) => {
  try {
    await api.put(`/admin/contacts/${contact.id}`, { status: 'answered' })
    contact.status = 'answered'
  } catch (error) {
    console.error('Erro ao marcar como respondido:', error)
  }
}

const deleteContact = async (contact) => {
  if (confirm(`Tem certeza que deseja excluir a mensagem de ${contact.name}?`)) {
    try {
      await api.delete(`/admin/contacts/${contact.id}`)
      await fetchContacts()
    } catch (error) {
      console.error('Erro ao excluir contato:', error)
    }
  }
}

onMounted(() => {
  loadContactInfo()
  fetchContacts()
})
</script>

