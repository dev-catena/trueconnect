import AsyncStorage from '@react-native-async-storage/async-storage';
import Pusher from 'pusher-js/react-native';
import Echo from 'laravel-echo';

import { API_HOST, API_BASE_URL } from '../../utils/constants';

const IS_DEV = __DEV__;
const REVERB_HOST = API_HOST;
const REVERB_PORT = 8080;
// Mesma key do REVERB_APP_KEY no backend (.env)
const REVERB_APP_KEY = IS_DEV ? 'imxxjvrqkkqflvbcppeo' : 'imxxjvrqkkqflvbcppeo';

export type ConnectionEventType =
  | 'conexao.criada'
  | 'conexao.atualizada'
  | 'conexao.removida'
  | 'conexao.destinatario_sem_conexoes'
  | 'contrato.atualizado'
  | 'clausula.contrato.atualizada';

export interface ConnectionEvent {
  type: ConnectionEventType;
  data: any;
}

type EventCallback = (data: any) => void;

class WebSocketService {
  private echo: Echo<'reverb'> | null = null;
  private listeners: Map<ConnectionEventType, Set<EventCallback>> = new Map();
  private userId: number | null = null;
  private isConnecting = false;

  /**
   * Conecta ao Laravel Reverb e subscreve ao canal privado do usuário
   */
  async connect(userId: number): Promise<void> {
    if (this.isConnecting || this.echo) {
      return;
    }

    this.userId = userId;
    this.isConnecting = true;

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.warn('⚠️ Token não encontrado para Reverb');
        this.isConnecting = false;
        return;
      }

      this.echo = new Echo({
        broadcaster: 'reverb',
        key: REVERB_APP_KEY,
        wsHost: REVERB_HOST,
        wsPort: REVERB_PORT,
        wssPort: REVERB_PORT,
        forceTLS: !IS_DEV,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${API_BASE_URL}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
        Pusher,
      });

      const channel = this.echo.private(`user.${userId}`);

      channel.listen('.conexao.criada', (data: any) => {
        if (__DEV__) console.log('📡 Reverb: conexao.criada', data);
        this.emit('conexao.criada', data);
      });

      channel.listen('.conexao.atualizada', (data: any) => {
        if (__DEV__) console.log('📡 Reverb: conexao.atualizada', data);
        this.emit('conexao.atualizada', data);
      });

      channel.listen('.conexao.removida', (data: any) => {
        if (__DEV__) console.log('📡 Reverb: conexao.removida', data);
        this.emit('conexao.removida', data);
      });

      channel.listen('.contrato.atualizado', (data: any) => {
        if (__DEV__) console.log('📡 Reverb: contrato.atualizado', data);
        this.emit('contrato.atualizado', data);
      });

      channel.listen('.clausula.contrato.atualizada', (data: any) => {
        if (__DEV__) console.log('📡 Reverb: clausula.contrato.atualizada', data);
        this.emit('clausula.contrato.atualizada', data);
      });

      channel.listen('.conexao.destinatario_sem_conexoes', (data: any) => {
        if (__DEV__) console.log('📡 Reverb: conexao.destinatario_sem_conexoes', data);
        this.emit('conexao.destinatario_sem_conexoes', data);
      });

      console.log('🔌 Reverb conectado para usuário:', userId);
    } catch (error) {
      console.error('❌ Erro ao conectar Reverb:', error);
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Desconecta do Reverb
   */
  disconnect(): void {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }
    this.userId = null;
    this.isConnecting = false;
    console.log('🔌 Reverb desconectado');
  }

  /**
   * Registra um listener para um tipo de evento
   */
  on(eventType: ConnectionEventType, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

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
   * Reverb substitui o polling - retorna no-op para compatibilidade
   */
  startPolling(userId: number, onUpdate: () => void, _interval?: number): () => void {
    this.connect(userId);
    return () => this.disconnect();
  }
}

export const webSocketService = new WebSocketService();
