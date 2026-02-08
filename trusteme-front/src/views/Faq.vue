<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 sm:text-4xl">
          Perguntas Frequentes
        </h1>
        <p class="mt-4 text-lg text-gray-600">
          Encontre respostas para as dúvidas mais comuns sobre o TrueConnect
        </p>
      </div>

      <div class="mt-12">
        <div v-if="loading" class="flex justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-600"></div>
      </div>

        <div v-else-if="error" class="text-center text-red-600">
          {{ error }}
      </div>

        <div v-else class="space-y-6">
          <div v-for="faq in faqs" :key="faq.id" class="bg-white shadow rounded-lg overflow-hidden">
          <button
            @click="toggleFaq(faq.id)"
              class="w-full px-6 py-4 text-left focus:outline-none"
            >
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-900">
                  {{ faq.question }}
                </h3>
                <span class="ml-6 flex-shrink-0">
            <svg
                    class="h-6 w-6 transform"
              :class="{ 'rotate-180': openFaqs.includes(faq.id) }"
                    xmlns="http://www.w3.org/2000/svg"
              fill="none"
                    viewBox="0 0 24 24"
              stroke="currentColor"
            >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
            </svg>
                </span>
              </div>
          </button>
          <div
            v-show="openFaqs.includes(faq.id)"
              class="px-6 pb-4"
            >
              <p class="text-gray-600 whitespace-pre-line">
                {{ faq.answer }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const faqs = ref([])
const loading = ref(true)
const error = ref(null)
const openFaqs = ref([])

const fetchFaqs = async () => {
  try {
    const response = await api.get('/faqs')
    faqs.value = response.data.data || response.data
  } catch (err) {
    console.error('Erro ao carregar FAQs:', err)
    error.value = 'Não foi possível carregar as perguntas frequentes. Por favor, tente novamente mais tarde.'
  } finally {
    loading.value = false
  }
}

const toggleFaq = (id) => {
  const index = openFaqs.value.indexOf(id)
  if (index === -1) {
    openFaqs.value.push(id)
  } else {
    openFaqs.value.splice(index, 1)
  }
}

onMounted(() => {
  fetchFaqs()
})
</script>
