<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Preços de Contratos e Conexões</h1>
      <p class="text-gray-600">Configure os preços para compras adicionais de contratos e conexões</p>
    </div>

    <!-- Prices Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="price in prices"
        :key="price.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-900">
              {{ price.type === 'contracts' ? 'Contratos' : 'Conexões' }}
            </h3>
            <p class="text-gray-600 text-sm mt-1">
              Preço por unidade adicional
            </p>
          </div>
          <div class="flex items-center">
            <span
              :class="price.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              class="px-3 py-1 rounded-full text-xs font-semibold"
            >
              {{ price.is_active ? 'Ativo' : 'Inativo' }}
            </span>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Preço Unitário (R$)
            </label>
            <input
              v-model.number="price.unit_price"
              type="number"
              step="0.01"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-500"
              placeholder="0.00"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Quantidade Mínima
              </label>
              <input
                v-model.number="price.min_quantity"
                type="number"
                min="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-500"
                placeholder="1"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Quantidade Máxima
              </label>
              <input
                v-model.number="price.max_quantity"
                type="number"
                min="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-500"
                placeholder="100"
              />
            </div>
          </div>

          <div class="flex items-center">
            <input
              v-model="price.is_active"
              type="checkbox"
              :id="`active-${price.id}`"
              class="h-4 w-4 text-trust-600 focus:ring-trust-500 border-gray-300 rounded"
            />
            <label :for="`active-${price.id}`" class="ml-2 block text-sm text-gray-900">
              Preço ativo
            </label>
          </div>

          <button
            @click="savePrice(price)"
            :disabled="saving === price.id"
            class="w-full bg-trust-600 text-white px-4 py-2 rounded-md hover:bg-trust-700 focus:outline-none focus:ring-2 focus:ring-trust-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving === price.id ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const prices = ref([])
const saving = ref(null)

const fetchPrices = async () => {
  try {
    const response = await api.get('/admin/additional-purchase-prices')
    
    // A API retorna { success: true, result: [...] }
    let allPrices = []
    if (response.data && response.data.result) {
      allPrices = Array.isArray(response.data.result) ? response.data.result : []
    } else if (response.data && response.data.data) {
      allPrices = Array.isArray(response.data.data) ? response.data.data : []
    } else if (Array.isArray(response.data)) {
      allPrices = response.data
    }
    
    // Garantir que temos apenas um registro de cada tipo
    const pricesMap = new Map()
    allPrices.forEach(price => {
      // Se já existe um registro deste tipo, manter apenas o primeiro (ou o mais recente)
      if (!pricesMap.has(price.type)) {
        pricesMap.set(price.type, price)
      }
    })
    
    // Converter map para array e garantir ordem: contracts primeiro, depois connections
    prices.value = [
      pricesMap.get('contracts'),
      pricesMap.get('connections')
    ].filter(Boolean) // Remove null/undefined
    
    // Se não temos ambos os tipos, criar os que faltam
    if (prices.value.length < 2) {
      const hasContracts = prices.value.some(p => p && p.type === 'contracts')
      const hasConnections = prices.value.some(p => p && p.type === 'connections')
      
      if (!hasContracts) {
        prices.value.push({
          id: null,
          type: 'contracts',
          unit_price: 5.00,
          min_quantity: 1,
          max_quantity: 100,
          is_active: true
        })
      }
      
      if (!hasConnections) {
        prices.value.push({
          id: null,
          type: 'connections',
          unit_price: 3.00,
          min_quantity: 1,
          max_quantity: 100,
          is_active: true
        })
      }
    }
    
    console.log('Preços carregados:', prices.value)
  } catch (error) {
    console.error('Erro ao carregar preços:', error)
    alert('Erro ao carregar preços. Tente novamente.')
  }
}

const savePrice = async (price) => {
  if (!price.unit_price || price.unit_price < 0) {
    alert('Preço unitário inválido')
    return
  }
  if (!price.min_quantity || price.min_quantity < 1) {
    alert('Quantidade mínima deve ser pelo menos 1')
    return
  }
  if (!price.max_quantity || price.max_quantity < price.min_quantity) {
    alert('Quantidade máxima deve ser maior ou igual à mínima')
    return
  }

  saving.value = price.id
  try {
    // Se não tem ID, significa que é um novo registro (não deveria acontecer, mas vamos tratar)
    if (!price.id) {
      alert('Erro: Preço não encontrado no sistema. Por favor, recarregue a página.')
      await fetchPrices()
      return
    }
    
    await api.put(`/admin/additional-purchase-prices/${price.id}`, {
      unit_price: parseFloat(price.unit_price),
      min_quantity: parseInt(price.min_quantity),
      max_quantity: parseInt(price.max_quantity),
      is_active: price.is_active,
    })
    alert('Preço atualizado com sucesso!')
    await fetchPrices()
  } catch (error) {
    console.error('Erro ao salvar preço:', error)
    alert(error.response?.data?.message || 'Erro ao salvar preço. Tente novamente.')
  } finally {
    saving.value = null
  }
}

onMounted(() => {
  fetchPrices()
})
</script>

