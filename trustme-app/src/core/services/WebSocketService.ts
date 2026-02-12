import AsyncStorage from '@react-native-async-storage/async-storage';

const IS_DEV = __DEV__;
const WS_BASE_URL = IS_DEV ? 'ws://10.102.0.103:8001' : 'wss://api-trustme.catenasystem.com.br';
const API_BASE_URL = IS_DEV ? 'http://10.102.0.103:8001/api' : 'https://api-trustme.catenasystem.com.br/api';

export type ConnectionEventType = 'conexao.criada' | 'conexao.atualizada' | 'conexao.removida';

export interface ConnectionEvent {
  type: ConnectionEventType;
  data: any;
}

type EventCallback = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<ConnectionEventType, Set<EventCallback>> = new Map();
  private userId: number | null = null;
  private isConnecting = false;

  /**
   * Conecta ao WebSocket do Laravel Echo Server
   */
  async connect(userId: number): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.userId = userId;
    this.isConnecting = true;

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.warn('⚠️ Token não encontrado para WebSocket');
        this.isConnecting = false;
        return;
      }

      // Para Laravel, vamos usar polling HTTP como fallback
      // ou configurar um servidor WebSocket separado
      // Por enquanto, vamos usar polling HTTP periódico
      console.log('🔌 WebSocket service iniciado para usuário:', userId);
      this.isConnecting = false;
    } catch (error) {
      console.error('❌ Erro ao conectar WebSocket:', error);
      this.isConnecting = false;
    }
  }

  /**
   * Desconecta do WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.userId = null;
    this.reconnectAttempts = 0;
    console.log('🔌 WebSocket desconectado');
  }

  /**
   * Registra um listener para um tipo de evento
   */
  on(eventType: ConnectionEventType, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Retorna função para remover o listener
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  /**
   * Remove um listener
   */
  off(eventType: ConnectionEventType, callback: EventCallback): void {
    this.listeners.get(eventType)?.delete(callback);
  }

  /**
   * Dispara um evento para os listeners
   */
  private emit(eventType: ConnectionEventType, data: any): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro ao executar callback para ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Inicia polling HTTP inteligente que verifica mudanças antes de atualizar
   */
  startPolling(userId: number, onUpdate: () => void, interval: number = 10000): () => void {
    let pollingInterval: NodeJS.Timeout | null = null;
    let lastHash: string | null = null;
    let isPolling = false;
    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 3;

    const poll = async () => {
      // Evitar múltiplas chamadas simultâneas
      if (isPolling) {
        return;
      }

      isPolling = true;
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          isPolling = false;
          return;
        }

        const axios = require('axios');
        const BASE_URL = __DEV__ ? 'http://10.102.0.103:8001/api' : 'https://api-trustme.catenasystem.com.br/api';

        // Verificar se houve mudanças usando endpoint leve
        try {
          const response = await axios.get(`${BASE_URL}/usuario/conexoes/status`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            timeout: 5000,
          });

          // Resetar contador de erros em caso de sucesso
          consecutiveErrors = 0;

          if (response.data && response.data.result) {
            const currentHash = response.data.result.hash;
            
            // Se o hash mudou, significa que houve atualização
            if (lastHash !== null && lastHash !== currentHash) {
              if (__DEV__) {
                console.log('📡 Mudança detectada nas conexões - atualizando...', {
                  hashAnterior: lastHash,
                  hashAtual: currentHash,
                });
              }
              onUpdate();
            } else if (lastHash === null) {
              // Primeira verificação - não atualizar ainda
              if (__DEV__) {
                console.log('📡 Polling iniciado, hash inicial:', currentHash);
              }
            }
            
            lastHash = currentHash;
          }
        } catch (statusError: any) {
          // Se o endpoint de status não existir ou falhar, fazer update completo
          if (statusError.response?.status === 404) {
            if (__DEV__) {
              console.log('📡 Endpoint de status não encontrado (404), usando update completo');
            }
            consecutiveErrors = 0; // 404 não é erro de rede
            onUpdate();
          } else {
            throw statusError; // Re-throw para ser capturado pelo catch externo
          }
        }
      } catch (error: any) {
        consecutiveErrors++;
        
        // Verificar se é erro de rede
        const isNetworkError = error.message === 'Network Error' || 
                              error.code === 'NETWORK_ERROR' ||
                              error.code === 'ECONNREFUSED' ||
                              !error.response;
        
        if (isNetworkError) {
          // Se houver muitos erros consecutivos de rede, parar o polling temporariamente
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            if (__DEV__) {
              console.warn(`⚠️ Muitos erros de rede consecutivos (${consecutiveErrors}). Polling pausado. Verifique a conexão com o servidor.`);
            }
            // Parar o polling se houver muitos erros
            if (pollingInterval) {
              clearInterval(pollingInterval);
              pollingInterval = null;
            }
            isPolling = false;
            return;
          }
          
          // Log apenas o primeiro erro de rede para não poluir o console
          if (consecutiveErrors === 1 && __DEV__) {
            console.warn('⚠️ Erro de rede no polling. Tentando novamente...');
          }
        } else if (error.response?.status === 404 || error.code === 'ECONNABORTED') {
          // Outros erros não críticos
          if (__DEV__) {
            console.log('📡 Endpoint de status não disponível, usando update completo');
          }
          consecutiveErrors = 0;
          onUpdate();
        } else {
          // Outros erros - log apenas se não for erro de rede
          if (__DEV__ && consecutiveErrors <= 2) {
            console.error('Erro no polling:', error.message);
          }
        }
      } finally {
        isPolling = false;
      }
    };

    // Primeira verificação após 2 segundos
    setTimeout(poll, 2000);
    
    // Depois, verificar periodicamente
    pollingInterval = setInterval(poll, interval);

    // Retorna função para parar o polling
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
      lastHash = null;
      consecutiveErrors = 0;
    };
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();

