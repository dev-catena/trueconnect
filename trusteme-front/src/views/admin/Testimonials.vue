<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Gerenciar Depoimentos</h1>
      <p class="text-gray-600">Gerencie os depoimentos exibidos no site</p>
    </div>

    <!-- Add Testimonial Button -->
    <div class="mb-6">
      <button @click="showCreateModal = true" class="btn-primary">
        Novo Depoimento
      </button>
    </div>

    <!-- Testimonials Grid -->
    <div v-if="loading" class="flex justify-center py-8">
      <Loader text="Carregando depoimentos..." />
    </div>

    <div v-else-if="testimonials.length === 0" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
      </svg>
      <p class="text-gray-500">Nenhum depoimento encontrado</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="testimonial in testimonials"
        :key="testimonial.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <!-- Rating -->
        <div class="flex items-center mb-4">
          <div class="flex">
            <svg
              v-for="star in 5"
              :key="star"
              class="h-5 w-5"
              :class="star <= testimonial.rating ? 'text-yellow-400' : 'text-gray-300'"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
          </div>
          <span class="ml-2 text-sm text-gray-600">{{ testimonial.rating }}/5</span>
        </div>

        <!-- Content -->
        <blockquote class="text-gray-700 mb-4 line-clamp-3">
          "{{ testimonial.content }}"
        </blockquote>

        <!-- Author -->
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-trust-100 rounded-full flex items-center justify-center mr-3">
            <span class="text-trust-600 font-semibold text-sm">
              {{ getInitials(testimonial.author_name) }}
            </span>
          </div>
          <div class="flex-1">
            <div class="font-semibold text-gray-900">{{ testimonial.author_name }}</div>
            <div class="text-sm text-gray-600">{{ testimonial.author_position }}</div>
            <div class="text-sm text-trust-600">{{ testimonial.company }}</div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between items-center pt-4 border-t border-gray-200">
          <span class="text-xs text-gray-500">
            {{ formatDate(testimonial.created_at) }}
          </span>
          <div class="flex space-x-2">
            <button
              @click="editTestimonial(testimonial)"
              class="text-trust-600 hover:text-trust-900"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button
              @click="deleteTestimonial(testimonial)"
              class="text-red-600 hover:text-red-900"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Testimonial Modal -->
    <Modal :show="showCreateModal || showEditModal" @close="closeModal" :title="editingTestimonial ? 'Editar Depoimento' : 'Novo Depoimento'">
      <form @submit.prevent="saveTestimonial" class="space-y-4">
        <FormInput
          id="author_name"
          label="Nome do Autor"
          v-model="testimonialForm.author_name"
          required
          :error="errors.author_name"
        />
        
        <FormInput
          id="author_position"
          label="Cargo"
          v-model="testimonialForm.author_position"
          required
          :error="errors.author_position"
        />
        
        <FormInput
          id="company"
          label="Empresa"
          v-model="testimonialForm.company"
          required
          :error="errors.company"
        />
        
        <div class="mb-4">
          <label for="rating" class="block text-sm font-medium text-gray-700 mb-2">
            Avaliação <span class="text-red-500">*</span>
          </label>
          <select
            id="rating"
            v-model="testimonialForm.rating"
            required
            class="input-field"
          >
            <option value="">Selecione uma avaliação</option>
            <option value="1">1 estrela</option>
            <option value="2">2 estrelas</option>
            <option value="3">3 estrelas</option>
            <option value="4">4 estrelas</option>
            <option value="5">5 estrelas</option>
          </select>
          <p v-if="errors.rating" class="mt-1 text-sm text-red-600">{{ errors.rating }}</p>
        </div>
        
        <div class="mb-4">
          <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
            Depoimento <span class="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            v-model="testimonialForm.content"
            rows="4"
            required
            class="input-field resize-none"
            :class="{ 'border-red-500 focus:ring-red-500': errors.content }"
            placeholder="Digite o depoimento..."
          ></textarea>
          <p v-if="errors.content" class="mt-1 text-sm text-red-600">{{ errors.content }}</p>
        </div>
      </form>
      
      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="closeModal" class="btn-secondary">
            Cancelar
          </button>
          <button @click="saveTestimonial" :disabled="saving" class="btn-primary">
            {{ saving ? 'Salvando...' : (editingTestimonial ? 'Atualizar' : 'Criar') }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Loader from '@/components/Loader.vue'
import Modal from '@/components/Modal.vue'
import FormInput from '@/components/FormInput.vue'
import api from '@/services/api'

const testimonials = ref([])
const loading = ref(true)
const saving = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingTestimonial = ref(null)
const errors = ref({})

const testimonialForm = reactive({
  author_name: '',
  author_position: '',
  company: '',
  rating: '',
  content: ''
})

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '--'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (date) => {
  if (!date) return '--'
  try {
    return new Date(date).toLocaleDateString('pt-BR')
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return '--'
  }
}

const fetchTestimonials = async () => {
  loading.value = true
  try {
    const response = await api.get('/testimonials')
    console.log('Resposta bruta da API:', response)
    console.log('Dados da resposta:', response.data)
    
    // Verificar se a resposta tem a estrutura esperada
    let testimonialsData = []
    if (response.data) {
      if (Array.isArray(response.data)) {
        testimonialsData = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        testimonialsData = response.data.data
      } else if (typeof response.data === 'object') {
        // Se for um único objeto, converter para array
        testimonialsData = [response.data]
      }
    }
    
    console.log('Dados extraídos:', testimonialsData)
    
    // Garantir que todos os campos necessários existam
    testimonials.value = testimonialsData.map(testimonial => {
      const processed = {
        id: testimonial?.id || Math.random().toString(36).substr(2, 9),
        content: testimonial?.content || '',
        author_name: testimonial?.author_name || '',
        author_position: testimonial?.author_position || '',
        company: testimonial?.company || '',
        rating: parseInt(testimonial?.rating) || 0,
        created_at: testimonial?.created_at || new Date().toISOString()
      }
      console.log('Depoimento processado:', processed)
      return processed
    })
    
    console.log('Depoimentos finais:', testimonials.value)
  } catch (error) {
    console.error('Erro ao carregar depoimentos:', error)
    // Em caso de erro, usar depoimentos padrão
    testimonials.value = [
      {
        id: 1,
        content: 'O TrueConnect revolucionou a forma como gerenciamos nossos projetos. A interface é intuitiva e as funcionalidades são exatamente o que precisávamos.',
        author_name: 'Ana Silva',
        author_position: 'Gerente de Projetos',
        company: 'TechCorp',
        rating: 5,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        content: 'Desde que começamos a usar o TrueConnect, nossa produtividade aumentou em 40%. A colaboração entre as equipes nunca foi tão eficiente.',
        author_name: 'Carlos Santos',
        author_position: 'CEO',
        company: 'StartupXYZ',
        rating: 5,
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  } finally {
    loading.value = false
  }
}

const editTestimonial = (testimonial) => {
  editingTestimonial.value = testimonial
  testimonialForm.author_name = testimonial.author_name
  testimonialForm.author_position = testimonial.author_position
  testimonialForm.company = testimonial.company
  testimonialForm.rating = testimonial.rating
  testimonialForm.content = testimonial.content
  showEditModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingTestimonial.value = null
  Object.keys(testimonialForm).forEach(key => {
    testimonialForm[key] = ''
  })
  errors.value = {}
}

const saveTestimonial = async () => {
  errors.value = {}
  saving.value = true
  
  try {
    const data = {
      author_name: testimonialForm.author_name?.trim() || '',
      author_position: testimonialForm.author_position?.trim() || '',
      company: testimonialForm.company?.trim() || '',
      rating: parseInt(testimonialForm.rating) || 0,
      content: testimonialForm.content?.trim() || ''
    }
    
    console.log('Dados a serem enviados:', data)
    
    if (editingTestimonial.value) {
      await api.put(`/testimonials/${editingTestimonial.value.id}`, data)
    } else {
      await api.post('/testimonials', data)
    }
    
    await fetchTestimonials()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar depoimento:', error)
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      errors.value = {
        general: 'Erro ao salvar depoimento. Verifique se o backend está rodando.'
      }
    }
  } finally {
    saving.value = false
  }
}

const deleteTestimonial = async (testimonial) => {
  if (confirm(`Tem certeza que deseja excluir o depoimento de ${testimonial.author_name}?`)) {
    try {
      await api.delete(`/testimonials/${testimonial.id}`)
      await fetchTestimonials()
    } catch (error) {
      console.error('Erro ao excluir depoimento:', error)
    }
  }
}

onMounted(() => {
  fetchTestimonials()
})
</script>
