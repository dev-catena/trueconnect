<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Parâmetros do Sistema</h1>
      <p class="text-gray-600">Configure parâmetros globais do sistema</p>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-500">
      Carregando parâmetros...
    </div>
    <div v-else class="grid grid-cols-1 gap-6">
      <div
        v-for="param in parameters"
        :key="param.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div class="mb-4">
          <h3 class="text-lg font-bold text-gray-900">{{ formatLabel(param.chave) }}</h3>
          <p v-if="param.descricao" class="text-gray-600 text-sm mt-1">{{ param.descricao }}</p>
        </div>

        <div class="flex gap-4 items-end">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Valor (horas)</label>
            <input
              v-model.number="param.valor"
              type="number"
              min="1"
              step="0.5"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-500"
              placeholder="1"
            />
          </div>
          <button
            @click="saveParam(param)"
            :disabled="saving === param.chave"
            class="bg-trust-600 text-white px-6 py-2 rounded-md hover:bg-trust-700 focus:outline-none focus:ring-2 focus:ring-trust-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving === param.chave ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>

      <div v-if="!loading && parameters.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p class="text-gray-500 mb-2">Nenhum parâmetro global configurado.</p>
        <p class="text-sm text-gray-600">O tempo para assinatura do contrato é configurado por <strong>Tipo de Contrato</strong>. Acesse o menu <strong>Tipos de Contrato</strong> e clique em <strong>Cláusulas</strong> em cada tipo para definir o prazo.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const parameters = ref([])
const loading = ref(true)
const saving = ref(null)

const formatLabel = (chave) => {
  if (chave === 'tempo_assinatura_contrato_horas') {
    return 'Tempo para assinatura do contrato'
  }
  return chave.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const fetchParameters = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/parametros-sistema')
    const data = response.data?.result ?? response.data?.data ?? []
    const arr = Array.isArray(data) ? data : []
    // Tempo para assinatura: configurado por Tipo de Contrato (não global)
    parameters.value = arr.filter(p => p.chave !== 'tempo_assinatura_contrato_horas')
  } catch (error) {
    console.error('Erro ao carregar parâmetros:', error)
    alert('Erro ao carregar parâmetros. Tente novamente.')
    parameters.value = []
  } finally {
    loading.value = false
  }
}

const saveParam = async (param) => {
  if (param.valor == null || param.valor < 0.5) {
    alert('O tempo deve ser de pelo menos 0,5 hora (30 minutos).')
    return
  }

  saving.value = param.chave
  try {
    await api.put('/admin/parametros-sistema', {
      chave: param.chave,
      valor: String(param.valor),
    })
    alert('Parâmetro atualizado com sucesso!')
    await fetchParameters()
  } catch (error) {
    console.error('Erro ao salvar:', error)
    alert(error.response?.data?.message || 'Erro ao salvar. Tente novamente.')
  } finally {
    saving.value = null
  }
}

onMounted(() => {
  fetchParameters()
})
</script>
