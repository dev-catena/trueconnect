
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <router-link to="/" class="text-3xl font-bold text-trust-600">
          TrueConnect
        </router-link>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">
          Esqueceu sua senha?
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Digite seu email e enviaremos um link para redefinir sua senha
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleForgotPassword" class="space-y-6">
          <FormInput
            id="email"
            label="Email"
            type="email"
            v-model="form.email"
            required
            :error="errors.email"
            placeholder="seu@email.com"
            help="Digite o email associado à sua conta"
          />

          <div>
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full btn-primary"
            >
              <span v-if="authStore.loading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
              <span v-else>Enviar link de recuperação</span>
            </button>
          </div>
        </form>

        <!-- Success Message -->
        <div v-if="successMessage" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex">
            <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <div class="ml-3">
              <p class="text-sm text-green-700">{{ successMessage }}</p>
              <p class="text-sm text-green-600 mt-1">
                Verifique sua caixa de entrada e a pasta de spam.
              </p>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="authStore.error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <p class="ml-3 text-sm text-red-700">{{ authStore.error }}</p>
          </div>
        </div>

        <!-- Back to Login -->
        <div class="mt-6 text-center">
          <router-link
            to="/login"
            class="text-sm text-trust-600 hover:text-trust-500 font-medium"
          >
            ← Voltar para o login
          </router-link>
        </div>

        <!-- Help Section -->
        <div class="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-sm font-medium text-gray-900 mb-2">
            Precisa de ajuda?
          </h3>
          <p class="text-sm text-gray-600 mb-3">
            Se você não receber o email em alguns minutos, verifique:
          </p>
          <ul class="text-sm text-gray-600 space-y-1">
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>Se o email está correto</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>Sua pasta de spam ou lixo eletrônico</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>Se você tem uma conta com este email</span>
            </li>
          </ul>
          <div class="mt-3">
            <router-link
              to="/contato"
              class="text-sm text-trust-600 hover:text-trust-500 font-medium"
            >
              Entre em contato conosco →
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import FormInput from '@/components/FormInput.vue'

const authStore = useAuthStore()

const form = reactive({
  email: ''
})

const errors = ref({})
const successMessage = ref('')

const validateForm = () => {
  errors.value = {}
  
  if (!form.email.trim()) {
    errors.value.email = 'Email é obrigatório'
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.value.email = 'Email inválido'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleForgotPassword = async () => {
  successMessage.value = ''
  
  if (!validateForm()) {
    return
  }
  
  try {
    const response = await authStore.forgotPassword(form.email)
    successMessage.value = response.message || 'Código de recuperação enviado com sucesso!'
    
    // Reset form
    form.email = ''
  } catch (error) {
    // Error is handled by the store
    console.error('Forgot password error:', error)
  }
}
</script>
