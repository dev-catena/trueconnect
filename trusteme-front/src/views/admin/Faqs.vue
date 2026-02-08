<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gerenciar FAQs</h1>
        <p class="mt-1 text-sm text-gray-600">
          Adicione, edite ou remova perguntas frequentes
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="btn-primary"
      >
        Nova FAQ
      </button>
    </div>

    <!-- Lista de FAQs -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="loading" class="p-4 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-trust-600 mx-auto"></div>
      </div>
      <div v-else-if="error" class="p-4 text-center text-red-600">
        {{ error }}
      </div>
      <div v-else>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ordem
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pergunta
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="faq in faqs" :key="faq.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ faq.order }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ faq.question }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    faq.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ faq.is_active ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="editFaq(faq)"
                  class="text-trust-600 hover:text-trust-900 mr-4"
                >
                  Editar
                </button>
                <button
                  @click="deleteFaq(faq)"
                  class="text-red-600 hover:text-red-900"
                >
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Criação/Edição -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 class="text-xl font-bold mb-4">
          {{ editingFaq ? 'Editar FAQ' : 'Nova FAQ' }}
        </h2>
        <form @submit.prevent="saveFaq" class="space-y-4">
          <div>
            <FormInput
              v-model="faqForm.question"
              label="Pergunta"
              type="text"
              required
              :error="errors.question"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Resposta
            </label>
            <textarea
              v-model="faqForm.answer"
              rows="4"
              class="input-field"
              :class="{ 'border-red-500': errors.answer }"
              required
            ></textarea>
            <p v-if="errors.answer" class="mt-1 text-sm text-red-600">
              {{ errors.answer[0] }}
            </p>
          </div>
          <div>
            <FormInput
              v-model="faqForm.order"
              label="Ordem"
              type="number"
              required
              :error="errors.order"
            />
          </div>
          <div>
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="faqForm.is_active"
                class="form-checkbox h-4 w-4 text-trust-600"
              >
              <span class="ml-2 text-sm text-gray-700">Ativo</span>
            </label>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import FormInput from '@/components/FormInput.vue'

const faqs = ref([])
const loading = ref(true)
const error = ref(null)
const showModal = ref(false)
const editingFaq = ref(null)
const saving = ref(false)
const errors = ref({})

const faqForm = ref({
  question: '',
  answer: '',
  order: 1,
  is_active: true
})

const fetchFaqs = async () => {
  loading.value = true
  try {
    const response = await api.get('/faqs')
    faqs.value = response.data.data || response.data
  } catch (err) {
    console.error('Erro ao carregar FAQs:', err)
    error.value = 'Erro ao carregar FAQs. Tente novamente.'
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingFaq.value = null
  faqForm.value = {
    question: '',
    answer: '',
    order: faqs.value.length + 1,
    is_active: true
  }
  showModal.value = true
}

const editFaq = (faq) => {
  editingFaq.value = faq
  faqForm.value = {
    question: faq.question,
    answer: faq.answer,
    order: faq.order,
    is_active: faq.is_active
  }
  showModal.value = true
}

const deleteFaq = async (faq) => {
  if (!confirm(`Tem certeza que deseja excluir a FAQ "${faq.question}"?`)) {
    return
  }

  try {
    await api.delete(`/faqs/${faq.id}`)
    await fetchFaqs()
  } catch (err) {
    console.error('Erro ao excluir FAQ:', err)
    alert('Erro ao excluir FAQ. Tente novamente.')
  }
}

const saveFaq = async () => {
  saving.value = true
  errors.value = {}

  try {
    if (editingFaq.value) {
      await api.put(`/faqs/${editingFaq.value.id}`, faqForm.value)
    } else {
      await api.post('/faqs', faqForm.value)
    }

    await fetchFaqs()
    closeModal()
  } catch (err) {
    console.error('Erro ao salvar FAQ:', err)
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors
    } else {
      alert('Erro ao salvar FAQ. Tente novamente.')
    }
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  editingFaq.value = null
  faqForm.value = {
    question: '',
    answer: '',
    order: 1,
    is_active: true
  }
  errors.value = {}
}

onMounted(() => {
  fetchFaqs()
})
</script>
