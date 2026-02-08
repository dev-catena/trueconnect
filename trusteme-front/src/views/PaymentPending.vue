<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div class="mb-6">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
          <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="mt-4 text-2xl font-bold text-gray-900">Pagamento em Processamento</h2>
        <p class="mt-2 text-gray-600">
          Seu pagamento está sendo processado. Você receberá uma confirmação em breve.
        </p>
      </div>
      
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 class="text-lg font-semibold text-yellow-800 mb-2">O que acontece agora?</h3>
        <div class="text-sm text-yellow-700 space-y-2">
          <p>• O pagamento está sendo analisado</p>
          <p>• Você receberá um email de confirmação</p>
          <p>• Sua assinatura será ativada automaticamente</p>
          <p>• O processamento pode levar até 24 horas</p>
        </div>
      </div>
      
      <div class="space-y-3">
        <button
          @click="checkStatus"
          class="w-full bg-trust-600 hover:bg-trust-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Verificar Status
        </button>
        
        <button
          @click="goToDashboard"
          class="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Ir para o Dashboard
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

const checkStatus = () => {
  router.push('/dashboard')
}

const goToDashboard = () => {
  router.push('/dashboard')
}
</script> 