<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div class="mb-6">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 class="mt-4 text-2xl font-bold text-gray-900">Pagamento Não Aprovado</h2>
        <p class="mt-2 text-gray-600">
          Houve um problema com seu pagamento. Verifique os dados e tente novamente.
        </p>
      </div>
      
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h3 class="text-lg font-semibold text-red-800 mb-2">Possíveis Motivos</h3>
        <ul class="text-sm text-red-700 space-y-1">
          <li>• Cartão sem limite disponível</li>
          <li>• Dados do cartão incorretos</li>
          <li>• Cartão bloqueado pelo banco</li>
          <li>• Problema temporário no processamento</li>
        </ul>
      </div>
      
      <div class="space-y-3">
        <button
          @click="goToPlans"
          class="w-full bg-trust-600 hover:bg-trust-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Tentar Novamente
        </button>
        
        <button
          @click="goToDashboard"
          class="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Ir para o Dashboard
        </button>
        
        <button
          @click="contactSupport"
          class="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Falar com Suporte
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const goToPlans = () => {
  router.push('/planos')
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const contactSupport = () => {
  router.push('/contato')
}
</script> 