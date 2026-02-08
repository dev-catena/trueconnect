<template>
  <div class="animation-demo p-8 bg-gray-50">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center animate-fade-in-up">
        Demonstração de Animações CSS Nativas
      </h2>

      <!-- Seção de Animações de Entrada -->
      <section class="mb-12">
        <h3 class="text-2xl font-semibold text-gray-800 mb-6 animate-fade-in-left">
          Animações de Entrada
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="card-animated p-6 bg-white rounded-lg shadow-md animate-fade-in-up animation-delay-200">
            <h4 class="font-semibold mb-2">Fade In</h4>
            <div class="w-16 h-16 bg-trust-600 rounded-lg animate-fade-in"></div>
          </div>
          <div class="card-animated p-6 bg-white rounded-lg shadow-md animate-fade-in-up animation-delay-400">
            <h4 class="font-semibold mb-2">Fade In Up</h4>
            <div class="w-16 h-16 bg-trust-600 rounded-lg animate-fade-in-up"></div>
          </div>
          <div class="card-animated p-6 bg-white rounded-lg shadow-md animate-fade-in-up animation-delay-600">
            <h4 class="font-semibold mb-2">Fade In Left</h4>
            <div class="w-16 h-16 bg-trust-600 rounded-lg animate-fade-in-left"></div>
          </div>
          <div class="card-animated p-6 bg-white rounded-lg shadow-md animate-fade-in-up animation-delay-800">
            <h4 class="font-semibold mb-2">Fade In Right</h4>
            <div class="w-16 h-16 bg-trust-600 rounded-lg animate-fade-in-right"></div>
          </div>
        </div>
      </section>

      <!-- Seção de Spinners -->
      <section class="mb-12">
        <h3 class="text-2xl font-semibold text-gray-800 mb-6 animate-fade-in-left">
          Spinners e Loaders
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card-animated p-6 bg-white rounded-lg shadow-md">
            <h4 class="font-semibold mb-4">Spinner Circular</h4>
            <Loader type="spinner" text="Carregando..." />
          </div>
          <div class="card-animated p-6 bg-white rounded-lg shadow-md">
            <h4 class="font-semibold mb-4">Spinner Dots</h4>
            <Loader type="dots" text="Processando..." />
          </div>
          <div class="card-animated p-6 bg-white rounded-lg shadow-md">
            <h4 class="font-semibold mb-4">Progress Bar</h4>
            <Loader type="progress" :progress="75" text="75% Concluído" />
          </div>
        </div>
      </section>

      <!-- Seção de Efeitos Hover -->
      <section class="mb-12">
        <h3 class="text-2xl font-semibold text-gray-800 mb-6 animate-fade-in-left">
          Efeitos Hover
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card-animated p-6 bg-white rounded-lg shadow-md hover-lift">
            <h4 class="font-semibold mb-2">Hover Lift</h4>
            <p class="text-gray-600">Passe o mouse para ver o efeito</p>
          </div>
          <div class="card-animated p-6 bg-white rounded-lg shadow-md hover-scale">
            <h4 class="font-semibold mb-2">Hover Scale</h4>
            <p class="text-gray-600">Passe o mouse para ver o efeito</p>
          </div>
          <div class="card-animated p-6 bg-white rounded-lg shadow-md hover-glow">
            <h4 class="font-semibold mb-2">Hover Glow</h4>
            <p class="text-gray-600">Passe o mouse para ver o efeito</p>
          </div>
        </div>
      </section>

      <!-- Seção de Transições -->
      <section class="mb-12">
        <h3 class="text-2xl font-semibold text-gray-800 mb-6 animate-fade-in-left">
          Transições CSS
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card-animated p-6 bg-white rounded-lg shadow-md">
            <h4 class="font-semibold mb-4">Transições de Cores</h4>
            <button class="btn-animated bg-trust-600 text-white px-6 py-3 rounded-lg">
              Hover para mudar cor
            </button>
          </div>
          <div class="card-animated p-6 bg-white rounded-lg shadow-md">
            <h4 class="font-semibold mb-4">Transições de Transform</h4>
            <button class="btn-animated bg-gray-600 text-white px-6 py-3 rounded-lg">
              Hover para transformar
            </button>
          </div>
        </div>
      </section>

      <!-- Seção de Animações Especiais -->
      <section class="mb-12">
        <h3 class="text-2xl font-semibold text-gray-800 mb-6 animate-fade-in-left">
          Animações Especiais
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card-animated p-6 bg-white rounded-lg shadow-md">
            <h4 class="font-semibold mb-4">Bounce In</h4>
            <div class="w-16 h-16 bg-trust-600 rounded-lg animate-bounce-in"></div>
          </div>
          <div class="card-animated p-6 bg-white rounded-lg shadow-md">
            <h4 class="font-semibold mb-4">Scale In</h4>
            <div class="w-16 h-16 bg-trust-600 rounded-lg animate-scale-in"></div>
          </div>
        </div>
      </section>

      <!-- Seção de Shimmer -->
      <section class="mb-12">
        <h3 class="text-2xl font-semibold text-gray-800 mb-6 animate-fade-in-left">
          Efeito Shimmer
        </h3>
        <div class="card-animated p-6 bg-white rounded-lg shadow-md">
          <Loader type="shimmer" />
        </div>
      </section>

      <!-- Seção de Demonstração Responsiva -->
      <section class="mb-12">
        <h3 class="text-2xl font-semibold text-gray-800 mb-6 animate-fade-in-left">
          Animações Responsivas
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card-animated p-6 bg-white rounded-lg shadow-md animate-fade-in-up animation-delay-200">
            <h4 class="font-semibold mb-2">Desktop</h4>
            <p class="text-sm text-gray-600">Animações completas</p>
          </div>
          <div class="card-animated p-6 bg-white rounded-lg shadow-md animate-fade-in-up animation-delay-400">
            <h4 class="font-semibold mb-2">Tablet</h4>
            <p class="text-sm text-gray-600">Animações otimizadas</p>
          </div>
          <div class="card-animated p-6 bg-white rounded-lg shadow-md animate-fade-in-up animation-delay-600">
            <h4 class="font-semibold mb-2">Mobile</h4>
            <p class="text-sm text-gray-600">Animações simplificadas</p>
          </div>
        </div>
      </section>

      <!-- Botões de Demonstração -->
      <section class="text-center">
        <h3 class="text-2xl font-semibold text-gray-800 mb-6 animate-fade-in-up">
          Botões com Animações
        </h3>
        <div class="flex flex-wrap justify-center gap-4">
          <button class="btn-hero bg-trust-600 text-white px-6 py-3 rounded-lg">
            Botão Hero
          </button>
          <button class="btn-animated bg-gray-600 text-white px-6 py-3 rounded-lg">
            Botão Animado
          </button>
          <button class="hover-lift bg-green-600 text-white px-6 py-3 rounded-lg">
            Botão Lift
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import Loader from './Loader.vue'
</script>

<style scoped>
.animation-demo {
  min-height: 100vh;
}

/* Custom animations for demo */
.card-animated {
  transition: all 0.3s ease;
}

.card-animated:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.btn-animated {
  transition: all 0.3s ease;
}

.btn-animated:hover {
  transform: scale(1.05);
}

.btn-hero {
  transition: all 0.3s ease;
}

.btn-hero:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
</style> 