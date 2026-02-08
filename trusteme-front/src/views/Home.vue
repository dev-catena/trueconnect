
<template>
  <div v-if="loaded">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-trust-600 to-trust-800 text-white relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="animate-fade-in-left animation-delay-200">
            <h1 class="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up animation-delay-300">
              {{ content['home.hero_title'] }}
            </h1>
            <p class="text-xl mb-8 text-trust-100 animate-fade-in-up animation-delay-400">
              {{ content['home.hero_subtitle'] }}
            </p>
            <div class="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-600">
              <router-link
                to="/download-app"
                class="btn-hero bg-white text-trust-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-center"
              >
                Baixe aqui o aplicativo
              </router-link>
              <router-link
                to="/planos"
                class="btn-hero border-2 border-white text-white hover:bg-white hover:text-trust-600 font-semibold py-3 px-8 rounded-lg text-center"
              >
                {{ content['home.cta_secondary_label'] }}
              </router-link>
            </div>
          </div>
          <div class="flex justify-center animate-fade-in-right animation-delay-400 relative">
            <img
              src="/src/assets/banner.png"
              alt="TrueConnect Platform"
              class="max-w-full h-auto rounded-lg shadow-2xl hero-float hero-glow"
            />
            <!-- Badge de avaliação -->
            <RatingBadge 
              rating="5.0" 
              label="Avaliação" 
              position="top-right"
              class="absolute"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-16 animate-fade-in-up animation-delay-200">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
            Por que escolher o TrueConnect?
          </h2>
          <div class="text-lg text-gray-600 max-w-3xl mx-auto text-left whitespace-pre-line leading-relaxed space-y-4">
            <p v-for="(paragraph, idx) in getDescriptionParagraphs(content['site_description'])" :key="idx" class="mb-4 last:mb-0">
              {{ paragraph }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="(feature, idx) in content['home.features']" :key="idx" class="rounded-lg bg-card text-card-foreground h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg card-animated animate-fade-in-up" :class="`animation-delay-${(idx+1)*200}`">
            <div class="flex flex-col space-y-1.5 p-6 text-center pb-4">
              <div class="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle h-12 w-12 text-trust-600">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22,4 12,14.01 9,11.01"></polyline>
                </svg>
              </div>
              <h3 class="tracking-tight text-xl font-bold text-gray-900">{{ feature.title }}</h3>
              <p class="text-sm text-gray-600">{{ feature.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-20 bg-trust-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div v-for="(stat, idx) in content['home.stats']" :key="idx" class="animate-fade-in-up" :class="`animation-delay-${(idx+1)*200} hover-lift`">
            <div class="text-4xl font-bold text-trust-600 mb-2 animate-bounce-in">{{ stat.value }}</div>
            <div class="text-gray-600">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Como Funciona Section -->
    <section class="py-20 bg-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16 animate-fade-in-up animation-delay-200">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Como Funciona</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">Em apenas 3 passos simples, você pode começar a usar o TrueConnect para suas necessidades de segurança jurídica.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="(step, idx) in content['home.steps']" :key="idx" class="text-center animate-fade-in-up hover-lift" :class="`animation-delay-${(idx+1)*200}`">
            <div class="w-16 h-16 bg-trust-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 animate-bounce-in">
              {{ idx + 1 }}
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">{{ step.title }}</h3>
            <p class="text-gray-600">{{ step.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up animation-delay-200">
          {{ content['home.cta_block_title'] }}
        </h2>
        <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-400">
          {{ content['home.cta_block_subtitle'] }}
        </p>
        <router-link
          to="/download-app"
          class="btn-hero bg-trust-600 hover:bg-trust-700 text-white font-semibold py-3 px-8 rounded-lg inline-block animate-fade-in-up animation-delay-600"
        >
          Baixe aqui o aplicativo
        </router-link>
      </div>
    </section>
  </div>
  <div v-else class="py-20 text-center"><span class="text-gray-500">Carregando...</span></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import RatingBadge from '../components/RatingBadge.vue'

const content = ref({})
const loaded = ref(false)

const getDescriptionParagraphs = (text) => {
  if (!text) return []
  // Dividir por quebras de linha duplas (parágrafos) ou simples
  // Se não houver quebras, retornar o texto como um único parágrafo
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim())
  if (paragraphs.length === 0) {
    return [text.trim()]
  }
  return paragraphs.map(p => p.trim())
}

onMounted(async () => {
  try {
    const { data } = await api.get('/site-content')
    if (data?.success) {
      content.value = data.data || {}
    }
  } catch (e) {
    console.error('Erro ao carregar conteúdo do site:', e)
  } finally {
    loaded.value = true
  }
})
</script>
