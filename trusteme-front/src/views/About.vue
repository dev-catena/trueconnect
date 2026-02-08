
<template>
  <div v-if="loaded">
    <!-- Hero Section -->
    <section class="bg-trust-600 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">
          {{ content['about.hero_title'] }}
        </h1>
        <p class="text-xl text-trust-100 max-w-3xl mx-auto">
          {{ content['about.hero_subtitle'] }}
        </p>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-6">{{ content['about.mission_title'] }}</h2>
            <p class="text-lg text-gray-600 mb-6">
              {{ content['about.mission_text'] }}
            </p>
          </div>
          <div class="bg-trust-50 p-8 rounded-lg">
            <h3 class="text-xl font-semibold text-trust-800 mb-6 text-center">{{ content['about.values_title'] }}</h3>
            
            <!-- Valores em cards verticais -->
            <div v-if="content['about.value_1_title'] && content['about.value_1_description']" class="space-y-6">
              <!-- Valor 1: Consentimento -->
              <div class="bg-white rounded-lg p-6 shadow-sm border-l-4 border-trust-500">
                <div class="flex items-start">
                  <div class="flex-shrink-0 w-10 h-10 bg-trust-100 rounded-full flex items-center justify-center mr-4">
                    <svg class="w-5 h-5 text-trust-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ content['about.value_1_title'] || 'Consentimento' }}</h4>
                    <p class="text-gray-600">{{ content['about.value_1_description'] || 'Base de todos os relacionamentos saudáveis. Acreditamos que o consentimento explícito e documentado é fundamental para relações respeitosas.' }}</p>
                  </div>
                </div>
              </div>

              <!-- Valor 2: Segurança Jurídica -->
              <div v-if="content['about.value_2_title'] && content['about.value_2_description']" class="bg-white rounded-lg p-6 shadow-sm border-l-4 border-trust-500">
                <div class="flex items-start">
                  <div class="flex-shrink-0 w-10 h-10 bg-trust-100 rounded-full flex items-center justify-center mr-4">
                    <svg class="w-5 h-5 text-trust-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ content['about.value_2_title'] || 'Segurança Jurídica' }}</h4>
                    <p class="text-gray-600">{{ content['about.value_2_description'] || 'Proteção legal para ambas as partes. Garantimos que os acordos sejam válidos juridicamente e protejam os direitos de todos os envolvidos.' }}</p>
                  </div>
                </div>
              </div>

              <!-- Valor 3: Transparência -->
              <div v-if="content['about.value_3_title'] && content['about.value_3_description']" class="bg-white rounded-lg p-6 shadow-sm border-l-4 border-trust-500">
                <div class="flex items-start">
                  <div class="flex-shrink-0 w-10 h-10 bg-trust-100 rounded-full flex items-center justify-center mr-4">
                    <svg class="w-5 h-5 text-trust-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ content['about.value_3_title'] || 'Transparência' }}</h4>
                    <p class="text-gray-600">{{ content['about.value_3_description'] || 'Clareza total em limites, preferências e responsabilidades. Eliminamos mal-entendidos através de comunicação clara e documentada.' }}</p>
                  </div>
                </div>
              </div>

              <!-- Valor 4: Respeito -->
              <div v-if="content['about.value_4_title'] && content['about.value_4_description']" class="bg-white rounded-lg p-6 shadow-sm border-l-4 border-trust-500">
                <div class="flex items-start">
                  <div class="flex-shrink-0 w-10 h-10 bg-trust-100 rounded-full flex items-center justify-center mr-4">
                    <svg class="w-5 h-5 text-trust-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ content['about.value_4_title'] || 'Respeito' }}</h4>
                    <p class="text-gray-600">{{ content['about.value_4_description'] || 'Valorização da autonomia e escolhas individuais. Respeitamos todas as formas de relacionamento e orientações sexuais.' }}</p>
                  </div>
                </div>
              </div>

              <!-- Valor 5: Privacidade -->
              <div v-if="content['about.value_5_title'] && content['about.value_5_description']" class="bg-white rounded-lg p-6 shadow-sm border-l-4 border-trust-500">
                <div class="flex items-start">
                  <div class="flex-shrink-0 w-10 h-10 bg-trust-100 rounded-full flex items-center justify-center mr-4">
                    <svg class="w-5 h-5 text-trust-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ content['about.value_5_title'] || 'Privacidade' }}</h4>
                    <p class="text-gray-600">{{ content['about.value_5_description'] || 'Proteção absoluta de informações pessoais. Garantimos confidencialidade total em todos os acordos e dados.' }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Valores estáticos como fallback -->
            <ul v-else class="space-y-3">
              <li class="flex items-start">
                <svg class="w-6 h-6 text-trust-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="text-gray-700"><strong>Confiança:</strong> Base de todos os nossos relacionamentos</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-trust-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="text-gray-700"><strong>Inovação:</strong> Sempre buscando soluções melhores</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-trust-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="text-gray-700"><strong>Simplicidade:</strong> Complexidade resolvida de forma simples</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-trust-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="text-gray-700"><strong>Excelência:</strong> Qualidade em tudo que fazemos</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">{{ content['about.team_title'] }}</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            {{ content['about.team_subtitle'] }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Equipe dinâmica -->
          <div v-if="content['about.team_text']" class="col-span-3">
            <div class="bg-white rounded-lg p-8 text-center shadow-sm">
              <div class="max-w-4xl mx-auto">
                <p class="text-lg text-gray-700 leading-relaxed">{{ content['about.team_text'] }}</p>
              </div>
            </div>
          </div>
          
          <!-- Equipe estática como fallback -->
          <template v-else>
            <div class="bg-white rounded-lg p-6 text-center shadow-sm">
              <div class="w-24 h-24 bg-trust-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg class="w-12 h-12 text-trust-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Ana Silva</h3>
              <p class="text-trust-600 mb-3">CEO & Fundadora</p>
              <p class="text-gray-600 text-sm">
                15 anos de experiência em gestão de projetos e liderança de equipes.
                Visionária por trás da criação do TrueConnect.
              </p>
            </div>

            <div class="bg-white rounded-lg p-6 text-center shadow-sm">
              <div class="w-24 h-24 bg-trust-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg class="w-12 h-12 text-trust-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Carlos Santos</h3>
              <p class="text-trust-600 mb-3">CTO</p>
              <p class="text-gray-600 text-sm">
                Especialista em arquitetura de software e desenvolvimento de sistemas escaláveis.
                Responsável pela excelência técnica da plataforma.
              </p>
            </div>

            <div class="bg-white rounded-lg p-6 text-center shadow-sm">
              <div class="w-24 h-24 bg-trust-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg class="w-12 h-12 text-trust-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Maria Oliveira</h3>
              <p class="text-trust-600 mb-3">Head de UX/UI</p>
              <p class="text-gray-600 text-sm">
                Designer experiente focada em criar experiências intuitivas e agradáveis.
                Garante que nossa plataforma seja fácil e prazerosa de usar.
              </p>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- History Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">{{ content['about.history_title'] }}</h2>
        </div>

        <!-- História dinâmica -->
        <div v-if="content['about.history_text']" class="max-w-4xl mx-auto">
          <div class="bg-gray-50 p-8 rounded-lg">
            <p class="text-lg text-gray-700 leading-relaxed text-center">
              {{ content['about.history_text'] }}
            </p>
          </div>
        </div>

        <!-- História estática como fallback -->
        <div v-else class="space-y-12">
          <div class="flex flex-col md:flex-row items-center gap-8">
            <div class="md:w-1/2">
              <div class="bg-trust-600 text-white p-6 rounded-lg">
                <h3 class="text-xl font-semibold mb-2">2020 - O Início</h3>
                <p>
                  Fundação da empresa com o objetivo de revolucionar a gestão de projetos.
                  Primeiros protótipos e validação do conceito com empresas parceiras.
                </p>
              </div>
            </div>
            <div class="md:w-1/2">
              <div class="bg-gray-100 p-6 rounded-lg">
                <h3 class="text-xl font-semibold mb-2 text-gray-900">2021 - Crescimento</h3>
                <p class="text-gray-700">
                  Lançamento da primeira versão da plataforma. Primeiros 1.000 usuários
                  e feedback valioso para melhorias contínuas.
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col md:flex-row-reverse items-center gap-8">
            <div class="md:w-1/2">
              <div class="bg-trust-600 text-white p-6 rounded-lg">
                <h3 class="text-xl font-semibold mb-2">2022 - Expansão</h3>
                <p>
                  Alcançamos 10.000 usuários ativos. Lançamento de novas funcionalidades
                  e integração com principais ferramentas do mercado.
                </p>
              </div>
            </div>
            <div class="md:w-1/2">
              <div class="bg-gray-100 p-6 rounded-lg">
                <h3 class="text-xl font-semibold mb-2 text-gray-900">2023 - Consolidação</h3>
                <p class="text-gray-700">
                  Reconhecimento como uma das principais plataformas de gestão do país.
                  Parcerias estratégicas e expansão da equipe.
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col md:flex-row items-center gap-8">
            <div class="md:w-1/2">
              <div class="bg-trust-600 text-white p-6 rounded-lg">
                <h3 class="text-xl font-semibold mb-2">2024 - Inovação</h3>
                <p>
                  Lançamento de recursos de IA e automação. Mais de 50.000 projetos
                  gerenciados através da nossa plataforma.
                </p>
              </div>
            </div>
            <div class="md:w-1/2">
              <div class="bg-gray-100 p-6 rounded-lg">
                <h3 class="text-xl font-semibold mb-2 text-gray-900">2025 - O Futuro</h3>
                <p class="text-gray-700">
                  Continuamos inovando e expandindo, sempre focados em oferecer
                  a melhor experiência para nossos usuários.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-trust-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold mb-4">
          {{ content['about.cta_title'] }}
        </h2>
        <p class="text-xl text-trust-100 mb-8 max-w-2xl mx-auto">
          {{ content['about.cta_subtitle'] }}
        </p>
        <router-link
          to="/download-app"
          class="bg-white text-trust-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors inline-block"
        >
          Baixe aqui o aplicativo
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const content = ref({})
const loaded = ref(false)

onMounted(async () => {
  try {
    const { data } = await api.get('/site-content')
    if (data?.success) {
      content.value = data.data || {}
    }
  } catch (e) {
    console.error('Erro ao carregar conteúdo da página Sobre:', e)
  } finally {
    loaded.value = true
  }
})
</script>
