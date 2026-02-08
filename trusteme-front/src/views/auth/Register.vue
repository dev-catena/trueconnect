
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <router-link to="/" class="text-3xl font-bold text-trust-600">
          TrueConnect
        </router-link>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">
          Crie sua conta gratuita
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Ou
          <router-link to="/login" class="font-medium text-trust-600 hover:text-trust-500">
            faça login na sua conta existente
          </router-link>
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Mensagem Informativa -->
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Cadastro via Aplicativo
          </h3>
          <p class="text-sm text-gray-600 mb-6">
            Para criar uma conta, baixe o aplicativo <strong>TrueConnect</strong> e faça seu cadastro. 
            Use suas credenciais criadas no app para fazer login aqui.
          </p>
          <div class="mt-6">
            <router-link to="/login" class="text-trust-600 hover:text-trust-500 font-medium">
              Já tem uma conta? Faça login →
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Componente simplificado - apenas exibe mensagem informativa
</script>
