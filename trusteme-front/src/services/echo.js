/**
 * Serviço Laravel Echo para WebSocket (Reverb)
 * Usado para atualizações em tempo real (ex: solicitações de selos)
 */
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { CONFIG } from '@/config/environment'

let echoInstance = null

/**
 * Retorna instância do Echo configurada para Reverb
 * Só conecta se houver token (usuário autenticado)
 */
export function getEcho() {
  if (echoInstance) {
    return echoInstance
  }

  const token = localStorage.getItem('token')
  if (!token) {
    return null
  }

  const { host, port, scheme, appKey } = CONFIG.REVERB
  const isDev = scheme === 'http'
  const baseUrl = CONFIG.API_BASE_URL.startsWith('http')
    ? CONFIG.API_BASE_URL
    : `${window.location.origin}${CONFIG.API_BASE_URL}`

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: appKey,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: !isDev,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${baseUrl}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
    Pusher,
  })

  return echoInstance
}

/**
 * Desconecta e limpa a instância do Echo
 */
export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
  }
}

/**
 * Subscreve ao canal de solicitações de selos e chama onUpdate quando houver evento
 * @param {Function} onUpdate - callback chamado em cada evento (ex: para recarregar lista)
 * @returns {Function} função para cancelar a inscrição
 */
export function subscribeSealRequests(onUpdate) {
  const echo = getEcho()
  if (!echo) {
    return () => {}
  }

  const channel = echo.private('seal-requests')
  channel.listen('.seal_request.atualizado', () => {
    if (onUpdate && typeof onUpdate === 'function') {
      onUpdate()
    }
  })

  return () => {
    channel.stopListening('.seal_request.atualizado')
  }
}
