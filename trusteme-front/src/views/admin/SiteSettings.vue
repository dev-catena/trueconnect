<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Conteúdo da Home</h1>

    <div v-if="loading" class="text-gray-500">Carregando...</div>

    <div v-else class="space-y-8">
      <!-- Gerais -->
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Gerais</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nome do Site</label>
            <input v-model="form['site_name']" type="text" class="mt-1 input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Slogan</label>
            <input v-model="form['site_slogan']" type="text" class="mt-1 input" />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 mt-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Descrição do Site</label>
            <textarea v-model="form['site_description']" rows="3" class="mt-1 textarea"></textarea>
          </div>
        </div>
      </section>

      <!-- Hero -->
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Hero</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Título</label>
            <input v-model="form['home.hero_title']" type="text" class="mt-1 input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Subtítulo</label>
            <textarea v-model="form['home.hero_subtitle']" rows="3" class="mt-1 textarea"></textarea>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">CTA Primário</label>
            <input v-model="form['home.cta_primary_label']" type="text" class="mt-1 input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">CTA Secundário</label>
            <input v-model="form['home.cta_secondary_label']" type="text" class="mt-1 input" />
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Features</h2>
          <button @click="addFeature" class="btn-primary">Adicionar</button>
        </div>
        <div v-if="features.length === 0" class="text-gray-500">Nenhuma feature adicionada.</div>
        <div v-for="(f, idx) in features" :key="idx" class="border rounded p-4 mb-3">
          <div class="flex justify-between items-center mb-3">
            <span class="font-medium">Item {{ idx + 1 }}</span>
            <button 
              @click.prevent="removeFeature(idx)" 
              type="button"
              class="text-red-600 hover:underline cursor-pointer"
            >
              Remover
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Título</label>
              <input v-model="f.title" type="text" class="mt-1 input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Texto</label>
              <textarea v-model="f.text" rows="2" class="mt-1 textarea"></textarea>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Estatísticas</h2>
          <button @click="addStat" class="btn-primary">Adicionar</button>
        </div>
        <div v-if="stats.length === 0" class="text-gray-500">Nenhuma estatística adicionada.</div>
        <div v-for="(s, idx) in stats" :key="idx" class="border rounded p-4 mb-3">
          <div class="flex justify-between items-center mb-3">
            <span class="font-medium">Item {{ idx + 1 }}</span>
            <button 
              @click.prevent="removeStat(idx)" 
              type="button"
              class="text-red-600 hover:underline cursor-pointer"
            >
              Remover
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Valor</label>
              <input v-model="s.value" type="text" class="mt-1 input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Rótulo</label>
              <input v-model="s.label" type="text" class="mt-1 input" />
            </div>
          </div>
        </div>
      </section>

      <!-- Steps -->
      <section class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Passos</h2>
          <button @click="addStep" class="btn-primary">Adicionar</button>
        </div>
        <div v-if="steps.length === 0" class="text-gray-500">Nenhum passo adicionado.</div>
        <div v-for="(st, idx) in steps" :key="idx" class="border rounded p-4 mb-3">
          <div class="flex justify-between items-center mb-3">
            <span class="font-medium">Passo {{ idx + 1 }}</span>
            <button 
              @click.prevent="removeStep(idx)" 
              type="button"
              class="text-red-600 hover:underline cursor-pointer"
            >
              Remover
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Título</label>
              <input v-model="st.title" type="text" class="mt-1 input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Texto</label>
              <textarea v-model="st.text" rows="2" class="mt-1 textarea"></textarea>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Block -->
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Bloco CTA</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Título</label>
            <input v-model="form['home.cta_block_title']" type="text" class="mt-1 input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Subtítulo</label>
            <textarea v-model="form['home.cta_block_subtitle']" rows="3" class="mt-1 textarea"></textarea>
          </div>
        </div>
      </section>

      <div class="flex justify-end gap-3">
        <button @click="load" class="btn-secondary">Recarregar</button>
        <button @click="save" class="btn-primary">Salvar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(true)
const form = reactive({
  'site_name': '',
  'site_slogan': '',
  'site_description': '',
  'home.hero_title': '',
  'home.hero_subtitle': '',
  'home.cta_primary_label': '',
  'home.cta_secondary_label': '',
  'home.cta_block_title': '',
  'home.cta_block_subtitle': '',
})

const features = ref([])
const stats = ref([])
const steps = ref([])

function normalizeSettings(list) {
  const out = {}
  for (const s of list) {
    if (s.type === 'json') {
      try { out[s.key] = JSON.parse(s.value || '[]') } catch { out[s.key] = [] }
    } else if (s.type === 'boolean') {
      out[s.key] = s.value === '1' || s.value === 1 || s.value === true
    } else {
      out[s.key] = s.value ?? ''
    }
  }
  return out
}

async function load() {
  loading.value = true
  try {
    const [homeRes, generalRes] = await Promise.all([
      api.get('/site-settings', { params: { group: 'home' } }),
      api.get('/site-settings', { params: { group: 'general' } })
    ])
    
    console.log('Resposta home:', homeRes?.data)
    console.log('Resposta general:', generalRes?.data)
    
    const settings = { ...normalizeSettings(homeRes?.data?.data || []), ...normalizeSettings(generalRes?.data?.data || []) }
    
    console.log('Settings normalizados:', settings)
    console.log('home.features:', settings['home.features'])
    console.log('Tipo de home.features:', typeof settings['home.features'])
    console.log('É array?', Array.isArray(settings['home.features']))
    
    form['site_name'] = settings['site_name'] || ''
    form['site_slogan'] = settings['site_slogan'] || ''
    form['site_description'] = settings['site_description'] || ''
    form['home.hero_title'] = settings['home.hero_title'] || ''
    form['home.hero_subtitle'] = settings['home.hero_subtitle'] || ''
    form['home.cta_primary_label'] = settings['home.cta_primary_label'] || ''
    form['home.cta_secondary_label'] = settings['home.cta_secondary_label'] || ''
    form['home.cta_block_title'] = settings['home.cta_block_title'] || ''
    form['home.cta_block_subtitle'] = settings['home.cta_block_subtitle'] || ''
    
    // Garantir que são arrays e não estão vazios
    const loadedFeatures = Array.isArray(settings['home.features']) ? settings['home.features'] : []
    const loadedStats = Array.isArray(settings['home.stats']) ? settings['home.stats'] : []
    const loadedSteps = Array.isArray(settings['home.steps']) ? settings['home.steps'] : []
    
    console.log('Features carregadas:', loadedFeatures)
    console.log('Stats carregadas:', loadedStats)
    console.log('Steps carregados:', loadedSteps)
    
    features.value = loadedFeatures.length > 0 ? loadedFeatures : []
    stats.value = loadedStats.length > 0 ? loadedStats : []
    steps.value = loadedSteps.length > 0 ? loadedSteps : []
    
    // Se não houver dados no banco, carregar do endpoint /site-content que tem os valores padrão
    if (features.value.length === 0 || stats.value.length === 0 || steps.value.length === 0) {
      try {
        const contentRes = await api.get('/site-content')
        if (contentRes?.data?.success && contentRes?.data?.data) {
          const content = contentRes.data.data
          if (features.value.length === 0 && content['home.features'] && Array.isArray(content['home.features'])) {
            features.value = content['home.features']
            console.log('Features carregadas do site-content:', features.value)
          }
          if (stats.value.length === 0 && content['home.stats'] && Array.isArray(content['home.stats'])) {
            stats.value = content['home.stats']
            console.log('Stats carregadas do site-content:', stats.value)
          }
          if (steps.value.length === 0 && content['home.steps'] && Array.isArray(content['home.steps'])) {
            steps.value = content['home.steps']
            console.log('Steps carregados do site-content:', steps.value)
          }
        }
      } catch (e) {
        console.error('Erro ao carregar do site-content:', e)
      }
    }
  } catch (e) {
    console.error('Erro ao carregar configurações:', e)
  } finally {
    loading.value = false
  }
}

async function save() {
  try {
    // Garantir que são arrays antes de filtrar
    const featuresArray = Array.isArray(features.value) ? features.value : []
    const statsArray = Array.isArray(stats.value) ? stats.value : []
    const stepsArray = Array.isArray(steps.value) ? steps.value : []
    
    // Filtrar features, stats e steps vazios antes de salvar
    const filteredFeatures = featuresArray.filter(f => f && f.title && f.title.trim() && f.text && f.text.trim())
    const filteredStats = statsArray.filter(s => s && s.value && s.value.trim() && s.label && s.label.trim())
    const filteredSteps = stepsArray.filter(st => st && st.title && st.title.trim() && st.text && st.text.trim())
    
    console.log('Salvando features:', filteredFeatures)
    console.log('Salvando stats:', filteredStats)
    console.log('Salvando steps:', filteredSteps)
    
    const payload = {
      settings: [
        { key: 'site_name', value: form['site_name'], type: 'text', group: 'general' },
        { key: 'site_slogan', value: form['site_slogan'], type: 'text', group: 'general' },
        { key: 'site_description', value: form['site_description'], type: 'textarea', group: 'general' },
        { key: 'home.hero_title', value: form['home.hero_title'], type: 'text', group: 'home' },
        { key: 'home.hero_subtitle', value: form['home.hero_subtitle'], type: 'textarea', group: 'home' },
        { key: 'home.cta_primary_label', value: form['home.cta_primary_label'], type: 'text', group: 'home' },
        { key: 'home.cta_secondary_label', value: form['home.cta_secondary_label'], type: 'text', group: 'home' },
        { key: 'home.cta_block_title', value: form['home.cta_block_title'], type: 'text', group: 'home' },
        { key: 'home.cta_block_subtitle', value: form['home.cta_block_subtitle'], type: 'textarea', group: 'home' },
        { key: 'home.features', value: JSON.stringify(filteredFeatures), type: 'json', group: 'home' },
        { key: 'home.stats', value: JSON.stringify(filteredStats), type: 'json', group: 'home' },
        { key: 'home.steps', value: JSON.stringify(filteredSteps), type: 'json', group: 'home' },
      ]
    }
    
    console.log('Payload enviado:', payload)
    
    const response = await api.post('/site-settings/bulk-update', payload)
    console.log('Resposta do servidor:', response.data)
    
    if (response.data?.success) {
      alert('Conteúdo salvo com sucesso!')
      // Recarregar para mostrar os dados atualizados
      await load()
    } else {
      alert('Erro ao salvar conteúdo: ' + (response.data?.message || 'Erro desconhecido'))
    }
  } catch (e) {
    console.error('Erro ao salvar conteúdo:', e)
    console.error('Detalhes do erro:', e.response?.data)
    const errorMessage = e.response?.data?.message || e.response?.data?.errors || e.response?.data?.error || 'Erro ao salvar conteúdo.'
    alert('Erro ao salvar conteúdo: ' + (typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)))
  }
}

function addFeature() { 
  features.value.push({ title: '', text: '' }) 
}

function removeFeature(idx) { 
  if (confirm('Tem certeza que deseja remover esta feature?')) {
    features.value.splice(idx, 1)
  }
}

function addStat() { 
  stats.value.push({ value: '', label: '' }) 
}

function removeStat(idx) { 
  if (confirm('Tem certeza que deseja remover esta estatística?')) {
    stats.value.splice(idx, 1)
  }
}

function addStep() { 
  steps.value.push({ title: '', text: '' }) 
}

function removeStep(idx) { 
  if (confirm('Tem certeza que deseja remover este passo?')) {
    steps.value.splice(idx, 1)
  }
}

onMounted(load)
</script>

<style scoped>
.input { @apply w-full border rounded px-3 py-2 focus:outline-none focus:ring; }
.textarea { @apply w-full border rounded px-3 py-2 focus:outline-none focus:ring; }
.btn-primary { @apply bg-trust-600 text-white px-4 py-2 rounded hover:bg-trust-700; }
.btn-secondary { @apply bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300; }
</style> 