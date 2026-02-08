
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600">Bem-vindo de volta, {{ authStore.getUser?.name }}!</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-2 bg-trust-100 rounded-lg">
              <svg class="w-6 h-6 text-trust-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Projetos Ativos</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.activeProjects }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Tarefas Concluídas</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.completedTasks }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Tarefas Pendentes</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.pendingTasks }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Membros da Equipe</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.teamMembers }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Projects -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Projetos Recentes</h2>
          </div>
          <div class="p-6">
            <div v-if="loading" class="flex justify-center py-8">
              <Loader size="md" />
            </div>
            <div v-else-if="recentProjects.length === 0" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p class="text-gray-500">Nenhum projeto encontrado</p>
              <button class="btn-primary mt-4">Criar Primeiro Projeto</button>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="project in recentProjects"
                :key="project.id"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-trust-100 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-5 h-5 text-trust-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900">{{ project.name }}</h3>
                    <p class="text-sm text-gray-500">{{ project.description }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusClass(project.status)"
                  >
                    {{ project.status }}
                  </span>
                  <p class="text-sm text-gray-500 mt-1">{{ formatDate(project.updated_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Atividade Recente</h2>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div
                v-for="activity in recentActivity"
                :key="activity.id"
                class="flex items-start"
              >
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-trust-100 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-trust-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-3 flex-1">
                  <p class="text-sm text-gray-900">{{ activity.description }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(activity.created_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <svg class="w-8 h-8 text-trust-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <div class="text-left">
              <h3 class="font-medium text-gray-900">Novo Projeto</h3>
              <p class="text-sm text-gray-500">Criar um novo projeto</p>
            </div>
          </button>

          <button class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <svg class="w-8 h-8 text-trust-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <div class="text-left">
              <h3 class="font-medium text-gray-900">Convidar Equipe</h3>
              <p class="text-sm text-gray-500">Adicionar membros</p>
            </div>
          </button>

          <button class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <svg class="w-8 h-8 text-trust-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <div class="text-left">
              <h3 class="font-medium text-gray-900">Ver Relatórios</h3>
              <p class="text-sm text-gray-500">Análises e métricas</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Loader from '@/components/Loader.vue'
import api from '@/services/api'

const authStore = useAuthStore()

const loading = ref(true)
const recentProjects = ref([])
const recentActivity = ref([])

const stats = reactive({
  activeProjects: 0,
  completedTasks: 0,
  pendingTasks: 0,
  teamMembers: 0
})

const getStatusClass = (status) => {
  const classes = {
    'ativo': 'bg-green-100 text-green-800',
    'pausado': 'bg-yellow-100 text-yellow-800',
    'concluído': 'bg-blue-100 text-blue-800',
    'cancelado': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const fetchDashboardData = async () => {
  loading.value = true
  
  try {
    // Simular dados do dashboard
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    stats.activeProjects = 5
    stats.completedTasks = 23
    stats.pendingTasks = 8
    stats.teamMembers = 12
    
    recentProjects.value = [
      {
        id: 1,
        name: 'Website Redesign',
        description: 'Redesign completo do site institucional',
        status: 'ativo',
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'App Mobile',
        description: 'Desenvolvimento do aplicativo mobile',
        status: 'pausado',
        updated_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        name: 'Sistema CRM',
        description: 'Implementação do novo CRM',
        status: 'concluído',
        updated_at: new Date(Date.now() - 172800000).toISOString()
      }
    ]
    
    recentActivity.value = [
      {
        id: 1,
        description: 'Você criou uma nova tarefa no projeto Website Redesign',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        description: 'João Silva comentou na tarefa "Design da homepage"',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        description: 'Maria Santos concluiu a tarefa "Análise de requisitos"',
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ]
    
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>
