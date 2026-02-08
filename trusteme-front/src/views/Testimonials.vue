<template>
  <div class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Depoimentos
        </h1>
        <p class="text-xl text-gray-600">
                      Veja o que nossos clientes dizem sobre o TrueConnect
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center">
        <Loader text="Carregando depoimentos..." />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center text-red-600 mb-8">
        <p>{{ error }}</p>
        <button @click="fetchTestimonials" class="btn-primary mt-4">
          Tentar Novamente
        </button>
      </div>

      <!-- Testimonials Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="testimonial in testimonials"
          :key="testimonial.id"
          class="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <!-- Rating -->
          <div class="flex items-center mb-4">
            <div class="flex">
              <svg
                v-for="star in 5"
                :key="star"
                class="h-5 w-5"
                :class="star <= testimonial.rating ? 'text-yellow-400' : 'text-gray-300'"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            </div>
            <span class="ml-2 text-sm text-gray-600">{{ testimonial.rating }}/5</span>
          </div>

          <!-- Content -->
          <blockquote class="text-gray-700 mb-4">
            "{{ testimonial.content }}"
          </blockquote>

          <!-- Author -->
          <div class="flex items-center">
            <div class="w-12 h-12 bg-trust-100 rounded-full flex items-center justify-center mr-4">
              <span class="text-trust-600 font-semibold text-lg">
                {{ getInitials(testimonial.author_name) }}
              </span>
            </div>
            <div>
              <div class="font-semibold text-gray-900">{{ testimonial.author_name }}</div>
              <div class="text-sm text-gray-600">{{ testimonial.author_position }}</div>
              <div class="text-sm text-trust-600">{{ testimonial.company }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="!loading && !error && testimonials.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum depoimento encontrado</h3>
        <p class="text-gray-600">Em breve teremos mais depoimentos de nossos clientes.</p>
      </div>

      <!-- Stats Section -->
      <div class="mt-20 bg-white rounded-lg p-8 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div class="text-3xl font-bold text-trust-600 mb-2">4.8/5</div>
            <div class="text-gray-600">Avaliação Média</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-trust-600 mb-2">10k+</div>
            <div class="text-gray-600">Clientes Satisfeitos</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-trust-600 mb-2">95%</div>
            <div class="text-gray-600">Taxa de Retenção</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-trust-600 mb-2">24h</div>
            <div class="text-gray-600">Tempo de Resposta</div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="mt-16 bg-trust-600 rounded-lg p-8 text-center text-white">
        <h2 class="text-2xl font-bold mb-4">
          Faça parte dos nossos clientes satisfeitos
        </h2>
        <p class="text-trust-100 mb-6">
                      Junte-se a milhares de empresas que já transformaram sua gestão com o TrueConnect.
        </p>
        <router-link
          to="/download-app"
          class="bg-trust-600 hover:bg-trust-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-block"
        >
          Baixe aqui o aplicativo
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Loader from '@/components/Loader.vue'
import api from '@/services/api'

const testimonials = ref([])
const loading = ref(true)
const error = ref('')

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '--'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const fetchTestimonials = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await api.get('/testimonials')
    console.log('Resposta da API:', response.data)
    
    // Verificar se a resposta tem a estrutura esperada
    let testimonialsData = []
    if (response.data) {
      if (Array.isArray(response.data)) {
        testimonialsData = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        testimonialsData = response.data.data
      } else if (typeof response.data === 'object') {
        // Se for um único objeto, converter para array
        testimonialsData = [response.data]
      }
    }
    
    // Garantir que todos os campos necessários existam
    testimonials.value = testimonialsData.map(testimonial => ({
      id: testimonial?.id || Math.random().toString(36).substr(2, 9),
      content: testimonial?.content || '',
      author_name: testimonial?.author_name || '',
      author_position: testimonial?.author_position || '',
      company: testimonial?.company || '',
      rating: parseInt(testimonial?.rating) || 0
    }))
    
    // Se não houver depoimentos da API, usar depoimentos padrão
    if (!testimonials.value.length) {
      testimonials.value = getDefaultTestimonials()
    }
  } catch (err) {
    error.value = 'Erro ao carregar depoimentos. Tente novamente.'
    console.error('Erro ao buscar depoimentos:', err)
    // Usar depoimentos padrão em caso de erro
    testimonials.value = getDefaultTestimonials()
  } finally {
    loading.value = false
  }
}

const getDefaultTestimonials = () => {
  return [
    {
      id: 1,
              content: 'O TrueConnect revolucionou a forma como gerenciamos nossos projetos. A interface é intuitiva e as funcionalidades são exatamente o que precisávamos.',
      author_name: 'Ana Silva',
      author_position: 'Gerente de Projetos',
      company: 'TechCorp',
      rating: 5
    },
    {
      id: 2,
              content: 'Desde que começamos a usar o TrueConnect, nossa produtividade aumentou em 40%. A colaboração entre as equipes nunca foi tão eficiente.',
      author_name: 'Carlos Santos',
      author_position: 'CEO',
      company: 'StartupXYZ',
      rating: 5
    },
    {
      id: 3,
      content: 'Excelente plataforma! O suporte é fantástico e sempre nos ajuda quando precisamos. Recomendo para qualquer empresa.',
      author_name: 'Maria Oliveira',
      author_position: 'Diretora de Operações',
      company: 'Inovação Ltda',
      rating: 5
    },
    {
      id: 4,
              content: 'A facilidade de uso do TrueConnect é impressionante. Em poucos dias nossa equipe já estava dominando todas as funcionalidades.',
      author_name: 'João Pereira',
      author_position: 'Coordenador de TI',
      company: 'Digital Solutions',
      rating: 4
    },
    {
      id: 5,
              content: 'Migrar para o TrueConnect foi a melhor decisão que tomamos. Conseguimos centralizar todos os nossos projetos em um só lugar.',
      author_name: 'Fernanda Costa',
      author_position: 'Product Manager',
      company: 'AgileTeam',
      rating: 5
    },
    {
      id: 6,
              content: 'O TrueConnect nos ajudou a organizar melhor nossos processos e a ter uma visão clara do andamento de todos os projetos.',
      author_name: 'Roberto Lima',
      author_position: 'Diretor Executivo',
      company: 'Consultoria Pro',
      rating: 4
    }
  ]
}

onMounted(() => {
  fetchTestimonials()
})
</script>
