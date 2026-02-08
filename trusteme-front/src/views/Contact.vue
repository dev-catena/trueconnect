
<template>
  <div class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Entre em Contato
        </h1>
        <p class="text-xl text-gray-600">
          Estamos aqui para ajudar. Entre em contato conosco!
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Contact Form -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Envie sua mensagem</h2>
          
          <form @submit.prevent="submitForm" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="name"
                label="Nome"
                v-model="form.name"
                required
                :error="errors.name"
              />
              <FormInput
                id="email"
                label="Email"
                type="email"
                v-model="form.email"
                required
                :error="errors.email"
              />
            </div>

            <FormInput
              id="phone"
              label="Telefone"
              v-model="form.phone"
              :error="errors.phone"
            />

            <div class="mb-4">
              <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">
                Assunto
              </label>
              <select
                id="subject"
                v-model="form.subject"
                required
                class="w-full input-field"
                :class="{ 'border-red-500': errors.subject }"
              >
                <option value="">Selecione um assunto</option>
                <option value="suporte">Suporte Técnico</option>
                <option value="vendas">Vendas</option>
                <option value="parcerias">Parcerias</option>
                <option value="feedback">Feedback</option>
              </select>
              <p v-if="errors.subject" class="mt-1 text-sm text-red-600">{{ errors.subject }}</p>
            </div>

            <div class="mb-6">
              <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
                Mensagem
              </label>
              <textarea
                id="message"
                v-model="form.message"
                rows="5"
                required
                class="w-full input-field"
                :class="{ 'border-red-500': errors.message }"
                placeholder="Descreva sua dúvida ou solicitação..."
              ></textarea>
              <p v-if="errors.message" class="mt-1 text-sm text-red-600">{{ errors.message }}</p>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full btn-primary"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
              <span v-else>Enviar Mensagem</span>
            </button>
          </form>

          <!-- Success Message -->
          <div v-if="successMessage" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex">
              <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p class="ml-3 text-sm text-green-700">{{ successMessage }}</p>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <p class="ml-3 text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="space-y-8">
          <!-- Contact Details -->
          <div class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Informações de Contato</h2>
            
            <div class="space-y-6" v-if="contactInfo">
              <div class="flex items-start">
                <svg class="h-6 w-6 text-trust-600 mr-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <div>
                  <h3 class="font-semibold text-gray-900">Email</h3>
                  <p class="text-gray-600">{{ contactInfo.contact_email_primary || 'contato@trustme.com' }}</p>
                  <p class="text-gray-600">{{ contactInfo.contact_email_support || 'suporte@trustme.com' }}</p>
                </div>
              </div>

              <div class="flex items-start">
                <svg class="h-6 w-6 text-trust-600 mr-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <div>
                  <h3 class="font-semibold text-gray-900">Telefone</h3>
                  <p class="text-gray-600">{{ contactInfo.contact_phone_primary || '(11) 99999-9999' }}</p>
                  <p class="text-gray-600">{{ contactInfo.contact_phone_secondary || '(11) 3333-4444' }}</p>
                </div>
              </div>

              <div class="flex items-start">
                <svg class="h-6 w-6 text-trust-600 mr-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <div>
                  <h3 class="font-semibold text-gray-900">Endereço</h3>
                  <div class="text-gray-600 whitespace-pre-line">{{ contactInfo.contact_address || 'Av. Paulista, 1000\nSão Paulo, SP - 01310-100\nBrasil' }}</div>
                </div>
              </div>

              <div class="flex items-start">
                <svg class="h-6 w-6 text-trust-600 mr-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h3 class="font-semibold text-gray-900">Horário de Atendimento</h3>
                  <div class="text-gray-600 whitespace-pre-line">{{ contactInfo.contact_hours || 'Segunda a Sexta: 9h às 18h\nSábado: 9h às 12h\nDomingo: Fechado' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- FAQ Link -->
          <div class="bg-trust-50 rounded-lg p-8">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">
              Precisa de ajuda rápida?
            </h3>
            <p class="text-gray-600 mb-4">
              Confira nossa seção de perguntas frequentes. Talvez sua dúvida já tenha sido respondida!
            </p>
            <router-link
              to="/faq"
              class="btn-outline"
            >
              Ver FAQ
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import FormInput from '@/components/FormInput.vue'
import api from '@/services/api'

const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const errors = ref({})
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const contactInfo = ref({})

const validateForm = () => {
  errors.value = {}
  
  if (!form.name.trim()) {
    errors.value.name = 'Nome é obrigatório'
  }
  
  if (!form.email.trim()) {
    errors.value.email = 'Email é obrigatório'
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.value.email = 'Email inválido'
  }
  
  if (!form.subject) {
    errors.value.subject = 'Assunto é obrigatório'
  }
  
  if (!form.message.trim()) {
    errors.value.message = 'Mensagem é obrigatória'
  }
  
  return Object.keys(errors.value).length === 0
}

const loadContactInfo = async () => {
  try {
    console.log('Carregando informações de contato...')
    const { data } = await api.get('/site-content')
    console.log('Resposta da API:', data)
      if (data?.success) {
    contactInfo.value = data.data || {}
  }
  } catch (error) {
    console.error('Erro ao carregar informações de contato:', error)
  }
}

const submitForm = async () => {
  successMessage.value = ''
  errorMessage.value = ''
  
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    await api.post('/contacts', form)
    
    successMessage.value = 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
    
    // Reset form
    Object.keys(form).forEach(key => {
      form[key] = ''
    })
    
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    errorMessage.value = 'Erro ao enviar mensagem. Tente novamente ou entre em contato por telefone.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadContactInfo()
})
</script>
