<template>
  <div class="relative w-full h-48 bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
    <img
      v-if="objectUrl"
      :src="objectUrl"
      :alt="document?.file_name"
      class="w-full h-full object-cover cursor-pointer"
      @click="$emit('click')"
      @error="handleError"
    />
    <div v-else-if="error" class="text-center px-4">
      <p class="text-xs text-red-500">Erro ao carregar</p>
      <a
        v-if="fallbackUrl"
        :href="fallbackUrl"
        target="_blank"
        class="text-xs text-trust-600 hover:underline mt-1 inline-block"
      >
        Abrir em nova aba
      </a>
    </div>
    <div v-else class="text-center">
      <svg class="w-8 h-8 text-gray-400 mx-auto animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"></path>
      </svg>
      <p class="text-xs text-gray-500 mt-1">Carregando...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import api from '@/services/api'
import { CONFIG } from '@/config/environment'

const props = defineProps({
  document: { type: Object, required: true },
  requestId: { type: [Number, String], required: true },
})

defineEmits(['click'])

const objectUrl = ref(null)
const error = ref(false)
const fallbackUrl = ref('')

const loadImage = async () => {
  if (!props.document?.id || !props.requestId) return
  
  objectUrl.value = null
  error.value = false
  
  try {
    const url = `servicedesk/requests/${props.requestId}/documents/${props.document.id}/file`
    const response = await api.get(url, { responseType: 'blob' })
    const blob = response.data instanceof Blob ? response.data : (response.data?.data ?? response.data)
    if (blob instanceof Blob) {
      objectUrl.value = URL.createObjectURL(blob)
    } else {
      throw new Error('Resposta inválida')
    }
  } catch (e) {
    console.warn('Erro ao carregar via API, tentando URL direta:', e)
    error.value = true
    // Fallback para URL de storage
    const storageBase = CONFIG.STORAGE_BASE_URL || window.location.origin
    const path = props.document.file_path?.startsWith('/') ? props.document.file_path : `/${props.document.file_path || ''}`
    fallbackUrl.value = `${storageBase}/storage${path}`
  }
}

const handleError = () => {
  error.value = true
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = null
  }
}

onMounted(loadImage)
onUnmounted(() => {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
})

watch(() => [props.document?.id, props.requestId], loadImage)
</script>
