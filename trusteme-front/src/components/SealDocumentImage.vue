<template>
  <div
    :class="[
      'relative w-full bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center',
      fullView ? 'min-h-[200px] max-h-[85vh]' : 'h-48'
    ]"
  >
    <img
      v-if="imageSrc"
      :src="imageSrc"
      :alt="document?.file_name"
      :class="[
        fullView ? 'max-w-full max-h-[85vh] object-contain cursor-pointer' : 'w-full h-full object-cover cursor-pointer'
      ]"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import api from '@/services/api'
import { CONFIG } from '@/config/environment'

const props = defineProps({
  document: { type: Object, required: true },
  requestId: { type: [Number, String], required: true },
  /** Quando true, exibe a imagem inteira (ex: no modal) em vez de crop */
  fullView: { type: Boolean, default: false },
})

defineEmits(['click'])

const objectUrl = ref(null)
const error = ref(false)
const fallbackUrl = ref('')

// URL direta de storage (file_url completo) - prioridade para carregamento mais rápido
const directStorageUrl = computed(() => {
  const doc = props.document
  if (!doc?.file_path) return null
  const base = CONFIG.STORAGE_BASE_URL || window.location.origin
  const path = doc.file_path.startsWith('/') ? doc.file_path.slice(1) : doc.file_path
  return `${base.replace(/\/$/, '')}/storage/${path}`
})

// Preferir file_url completo se já vier do backend
const primaryUrl = computed(() => {
  const url = props.document?.file_url
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) return url
  return directStorageUrl.value
})

const imageSrc = computed(() => objectUrl.value || (error.value ? null : primaryUrl.value))

const loadImage = async () => {
  if (!props.document?.id || !props.requestId) return

  objectUrl.value = null
  error.value = false
  fallbackUrl.value = primaryUrl.value || directStorageUrl.value

  // Se temos URL direta de storage, usar ela (img src) - sem blob
  if (primaryUrl.value) {
    return
  }

  // Fallback: carregar via API com autenticação
  try {
    const url = `servicedesk/requests/${props.requestId}/documents/${props.document.id}/file`
    const response = await api.get(url, {
      responseType: 'blob',
      headers: { Accept: 'image/*,*/*' },
    })
    const blob = response.data instanceof Blob ? response.data : (response.data?.data ?? response.data)
    if (blob instanceof Blob) {
      objectUrl.value = URL.createObjectURL(blob)
    } else {
      throw new Error('Resposta inválida')
    }
  } catch (e) {
    console.warn('Erro ao carregar via API:', e)
    error.value = true
  }
}

const handleError = () => {
  error.value = true
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = null
  }
  fallbackUrl.value = fallbackUrl.value || directStorageUrl.value
}

onMounted(loadImage)
onUnmounted(() => {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
})

watch(() => [props.document?.id, props.requestId, props.document?.file_path, props.document?.file_url], loadImage)
</script>
