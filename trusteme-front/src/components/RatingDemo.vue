<template>
  <div class="rating-demo p-8 bg-gray-50">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center animate-fade-in-up">
        Demonstração de Badges de Avaliação
      </h2>

      <!-- Seção de Posições -->
      <section class="mb-12">
        <h3 class="text-2xl font-semibold text-gray-800 mb-6 animate-fade-in-left">
          Diferentes Posições
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="relative h-32 bg-white rounded-lg shadow-md p-6 animate-fade-in-up animation-delay-200">
            <h4 class="font-semibold mb-2">Top Right</h4>
            <p class="text-sm text-gray-600">Posição padrão</p>
            <RatingBadge rating="5.0" label="Avaliação" position="top-right" />
          </div>
          
          <div class="relative h-32 bg-white rounded-lg shadow-md p-6 animate-fade-in-up animation-delay-400">
            <h4 class="font-semibold mb-2">Top Left</h4>
            <p class="text-sm text-gray-600">Canto superior esquerdo</p>
            <RatingBadge rating="4.8" label="Rating" position="top-left" />
          </div>
          
          <div class="relative h-32 bg-white rounded-lg shadow-md p-6 animate-fade-in-up animation-delay-600">
            <h4 class="font-semibold mb-2">Bottom Right</h4>
            <p class="text-sm text-gray-600">Canto inferior direito</p>
            <RatingBadge rating="4.9" label="Score" position="bottom-right" />
          </div>
          
          <div class="relative h-32 bg-white rounded-lg shadow-md p-6 animate-fade-in-up animation-delay-800">
            <h4 class="font-semibold mb-2">Bottom Left</h4>
            <p class="text-sm text-gray-600">Canto inferior esquerdo</p>
            <RatingBadge rating="4.7" label="Review" position="bottom-left" />
          </div>
        </div>
      </section>

      <!-- Seção de Tamanhos -->
      <section class="mb-12">
        <h3 class="text-2xl font-semibold text-gray-800 mb-6 animate-fade-in-left">
          Diferentes Tamanhos
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="relative h-24 bg-white rounded-lg shadow-md p-6 animate-fade-in-up animation-delay-300">
            <h4 class="font-semibold mb-2">Pequeno</h4>
            <p class="text-sm text-gray-600">Tamanho compacto</p>
            <RatingBadge rating="4.5" label="Mini" size="sm" position="top-right" />
          </div>
          
          <div class="relative h-24 bg-white rounded-lg shadow-md p-6 animate-fade-in-up animation-delay-500">
            <h4 class="font-semibold mb-2">Médio</h4>
            <p class="text-sm text-gray-600">Tamanho padrão</p>
            <RatingBadge rating="4.8" label="Normal" size="md" position="top-right" />
          </div>
          
          <div class="relative h-24 bg-white rounded-lg shadow-md p-6 animate-fade-in-up animation-delay-700">
            <h4 class="font-semibold mb-2">Grande</h4>
            <p class="text-sm text-gray-600">Tamanho destacado</p>
            <RatingBadge rating="5.0" label="Premium" size="lg" position="top-right" />
          </div>
        </div>
      </section>

      <!-- Seção de Cards com Badges -->
      <section class="mb-12">
        <h3 class="text-2xl font-semibold text-gray-800 mb-6 animate-fade-in-left">
          Cards com Badges de Avaliação
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="card-animated p-6 bg-white rounded-lg shadow-md relative animate-fade-in-up animation-delay-200">
            <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 hover-scale">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2 text-center">Produto A</h3>
            <p class="text-gray-600 text-center">
              Descrição do produto com avaliação destacada.
            </p>
            <RatingBadge rating="4.9" label="Avaliação" position="top-right" size="sm" />
          </div>
          
          <div class="card-animated p-6 bg-white rounded-lg shadow-md relative animate-fade-in-up animation-delay-400">
            <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 hover-scale">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2 text-center">Produto B</h3>
            <p class="text-gray-600 text-center">
              Outro produto com avaliação excelente.
            </p>
            <RatingBadge rating="5.0" label="Perfeito" position="top-right" size="sm" />
          </div>
          
          <div class="card-animated p-6 bg-white rounded-lg shadow-md relative animate-fade-in-up animation-delay-600">
            <div class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 hover-scale">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2 text-center">Produto C</h3>
            <p class="text-gray-600 text-center">
              Terceiro produto com avaliação muito boa.
            </p>
            <RatingBadge rating="4.7" label="Muito Bom" position="top-right" size="sm" />
          </div>
        </div>
      </section>

      <!-- Seção de Demonstração Interativa -->
      <section class="mb-12">
        <h3 class="text-2xl font-semibold text-gray-800 mb-6 animate-fade-in-left">
          Demonstração Interativa
        </h3>
        <div class="bg-white rounded-lg shadow-md p-8 animate-fade-in-up animation-delay-300">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 class="font-semibold mb-4">Configurações</h4>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Avaliação:</label>
                  <input 
                    v-model="demoRating" 
                    type="text" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5.0"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Label:</label>
                  <input 
                    v-model="demoLabel" 
                    type="text" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Avaliação"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Posição:</label>
                  <select 
                    v-model="demoPosition" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Tamanho:</label>
                  <select 
                    v-model="demoSize" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sm">Pequeno</option>
                    <option value="md">Médio</option>
                    <option value="lg">Grande</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="relative h-48 bg-gray-100 rounded-lg p-6 flex items-center justify-center">
              <div class="text-center">
                <h5 class="font-semibold mb-2">Preview</h5>
                <p class="text-sm text-gray-600 mb-4">Área de demonstração</p>
                <RatingBadge 
                  :rating="demoRating" 
                  :label="demoLabel" 
                  :position="demoPosition"
                  :size="demoSize"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Seção de Animações Especiais -->
      <section class="mb-12">
        <h3 class="text-2xl font-semibold text-gray-800 mb-6 animate-fade-in-left">
          Animações Especiais
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="card-animated p-6 bg-white rounded-lg shadow-md relative animate-fade-in-up animation-delay-400">
            <h4 class="font-semibold mb-4">Badge com Hover</h4>
            <p class="text-gray-600 mb-4">Passe o mouse sobre o badge para ver os efeitos de hover.</p>
            <RatingBadge rating="4.9" label="Hover Effect" position="top-right" />
          </div>
          
          <div class="card-animated p-6 bg-white rounded-lg shadow-md relative animate-fade-in-up animation-delay-600">
            <h4 class="font-semibold mb-4">Badge Responsivo</h4>
            <p class="text-gray-600 mb-4">Adapta-se automaticamente em dispositivos móveis.</p>
            <RatingBadge rating="5.0" label="Responsive" position="top-right" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import RatingBadge from './RatingBadge.vue'

// Dados reativos para demonstração interativa
const demoRating = ref('5.0')
const demoLabel = ref('Avaliação')
const demoPosition = ref('top-right')
const demoSize = ref('md')
</script>

<style scoped>
.rating-demo {
  min-height: 100vh;
}

.card-animated {
  transition: all 0.3s ease;
}

.card-animated:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
</style> 