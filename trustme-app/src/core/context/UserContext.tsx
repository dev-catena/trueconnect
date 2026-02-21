import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Contract, Connection } from '../../types';
import ApiProvider from '../api/ApiProvider';
import { webSocketService } from '../services/WebSocketService';

interface UserContextType {
  user: User | null;
  contracts: Contract[];
  connections: Connection[];
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setContracts: (contracts: Contract[]) => void;
  setConnections: (connections: Connection[]) => void;
  removeConnection: (connectionId: number) => void;
  login: (cpf: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

// Helper function para garantir que temos um array válido (fora do componente para evitar problemas de ordem)
const ensureArray = (value: any): any[] => {
  try {
    if (value === null || value === undefined) {
      return [];
    }
    // Verificar se é array usando Object.prototype.toString para evitar problemas
    if (Object.prototype.toString.call(value) === '[object Array]') {
      return value;
    }
    return [];
  } catch (e) {
    console.error('Error in ensureArray:', e);
    return [];
  }
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollingCleanupRef = useRef<(() => void) | null>(null);
  const userRef = useRef<User | null>(null);
  const lastRefreshAtRef = useRef<number>(0);
  const REFRESH_COOLDOWN_MS = 5000; // Evitar loop: mínimo 5s entre refreshUserData
  userRef.current = user;

  useEffect(() => {
    let isMounted = true;
    
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('authToken');
        
        if (isMounted && storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          // Garantir que o código seja sempre uma string de 6 dígitos
          if (userData.codigo) {
            const codigoStr = String(userData.codigo).trim();
            // Se tem mais de 6 dígitos, isso é um código antigo - será atualizado na próxima requisição
            if (codigoStr.length > 6) {
              console.warn(`Código com mais de 6 dígitos no cache: ${codigoStr}. Será atualizado na próxima requisição.`);
            }
            // Garantir que seja string de 6 dígitos para exibição
            userData.codigo = codigoStr.length > 6 
              ? codigoStr.slice(-6) 
              : codigoStr.padStart(6, '0');
          }
          setUser(userData);
          // Buscar dados atualizados do backend para garantir que o código está correto
          try {
            const apiWithToken = new ApiProvider(true);
            const userResponse = await apiWithToken.get('usuario/dados');
            if (userResponse && typeof userResponse === 'object') {
              const updatedUserData = (userResponse.result || userResponse) as User;
              if (updatedUserData && updatedUserData.id) {
                // Garantir que o código seja sempre uma string de 6 dígitos
                if (updatedUserData.codigo) {
                  const codigoStr = String(updatedUserData.codigo).trim();
                  updatedUserData.codigo = codigoStr.length > 6 
                    ? codigoStr.slice(-6) 
                    : codigoStr.padStart(6, '0');
                }
                // Garantir que o caminho_foto tenha a URL completa se existir
                if (updatedUserData.caminho_foto && !updatedUserData.caminho_foto.startsWith('http')) {
                  const { BACKEND_BASE_URL } = require('../../utils/constants');
                  const BASE_URL = BACKEND_BASE_URL;
                  updatedUserData.caminho_foto = BASE_URL + (updatedUserData.caminho_foto.startsWith('/') ? updatedUserData.caminho_foto : '/' + updatedUserData.caminho_foto);
                }
                await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
                setUser(updatedUserData);
              }
            }
          } catch (error) {
            console.error('Erro ao atualizar dados do usuário:', error);
          }
          // Carregar dados do usuário (contratos, conexões, selos)
          await initializeUserData(userData);
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadStoredUser();
    
    return () => {
      isMounted = false;
      if (pollingCleanupRef.current) {
        pollingCleanupRef.current();
        pollingCleanupRef.current = null;
      }
      webSocketService.disconnect();
    };
  }, []);

  // WebSocket: conecta quando há usuário logado (tanto ao abrir app quanto após login)
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    const handleContratoUpdate = async () => {
      const currentUser = userRef.current;
      if (currentUser?.id) {
        if (__DEV__) {
          console.log('📡 Contrato criado/atualizado via Reverb - recarregando contratos...');
        }
        await initializeUserData(currentUser);
      }
    };

    const handleConnectionUpdate = async (eventData?: { id?: number }) => {
      const currentUser = userRef.current;
      if (currentUser?.id) {
        if (eventData?.id) {
          setConnections((prev) => prev.filter((c) => c.id !== eventData!.id));
        }
        if (__DEV__) {
          console.log('📡 Atualizando lista de conexões...');
        }
        try {
          const apiWithToken = new ApiProvider(true);
          const connectionsRes = await apiWithToken.get('usuario/conexoes');
          if (connectionsRes && typeof connectionsRes === 'object') {
            const result = connectionsRes.result || connectionsRes;
            if (result) {
              const ativas = Array.isArray(result.ativas) ? result.ativas : [];
              const pendentes = Array.isArray(result.pendentes) ? result.pendentes : [];
              const aguardando = Array.isArray(result.aguardando_resposta) ? result.aguardando_resposta : [];
              setConnections(ativas.concat(pendentes).concat(aguardando));
            }
          }
        } catch (error: any) {
          const isNetworkError = error.message === 'Network Error' || error.code === 'NETWORK_ERROR' || !error.response;
          const isThrottle = error.response?.status === 429 || error.response?.data?.mensagem === 'Too Many Attempts.';
          if (!isNetworkError && !isThrottle && userRef.current?.id) {
            await initializeUserData(userRef.current);
          }
        }
      }
    };

    const unsubscribeCriada = webSocketService.on('conexao.criada', handleConnectionUpdate);
    const unsubscribeAtualizada = webSocketService.on('conexao.atualizada', handleConnectionUpdate);
    const unsubscribeRemovida = webSocketService.on('conexao.removida', handleConnectionUpdate);
    const unsubscribeContrato = webSocketService.on('contrato.atualizado', handleContratoUpdate);

    const handleDestinatarioSemConexoes = (data: { solicitante?: { nome_completo?: string }; message?: string }) => {
      const msg = data?.message || `${data?.solicitante?.nome_completo || 'Alguém'} quer se conectar com você. Adquira mais conexões no seu plano para aceitar.`;
      Alert.alert('Conexão aguardando', msg, [{ text: 'OK' }]);
    };
    const unsubscribeDestinatarioSemConexoes = webSocketService.on('conexao.destinatario_sem_conexoes', handleDestinatarioSemConexoes);

    pollingCleanupRef.current = webSocketService.startPolling(userId, handleConnectionUpdate, 4000);

    return () => {
      unsubscribeCriada();
      unsubscribeAtualizada();
      unsubscribeRemovida();
      unsubscribeContrato();
      unsubscribeDestinatarioSemConexoes();
      if (pollingCleanupRef.current) {
        pollingCleanupRef.current();
        pollingCleanupRef.current = null;
      }
      webSocketService.disconnect();
    };
  }, [user?.id]);

  const initializeUserData = async (userData: User) => {
    if (!userData?.id) {
      console.log('⚠️ initializeUserData: userData ou userData.id não existe');
      return;
    }
    
    console.log('🔄 initializeUserData iniciado para usuário:', userData.id);
    
    try {
      const apiWithToken = new ApiProvider(true);
      
      // Buscar dados em paralelo com timeout
      const timeoutMs = 15000; // 15 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout após 15 segundos')), timeoutMs)
      );
      
      const requestsPromise = Promise.allSettled([
        apiWithToken.get('contrato/listar'),
        apiWithToken.get('usuario/conexoes'),
        apiWithToken.get(`usuario/${userData.id}/selos`),
      ]);
      
      const [contractsRes, connectionsRes, sealsRes] = await Promise.race([
        requestsPromise,
        timeoutPromise
      ]) as PromiseSettledResult<any>[];

      console.log('📦 Respostas recebidas:', {
        contracts: contractsRes?.status,
        connections: connectionsRes?.status,
        seals: sealsRes?.status,
      });

      // Processar contratos - contrato/listar retorna { result: [...] }
      let contractsList: Contract[] = [];
      if (contractsRes?.status === 'fulfilled' && contractsRes.value) {
        const data = contractsRes.value;
        const raw = data?.result ?? data?.data ?? data;
        if (Array.isArray(raw)) {
          contractsList = raw;
        } else if (raw && typeof raw === 'object' && (raw.contratos_como_contratante || raw.contratos_como_participante)) {
          const a = Array.isArray(raw.contratos_como_contratante) ? raw.contratos_como_contratante : [];
          const b = Array.isArray(raw.contratos_como_participante) ? raw.contratos_como_participante : [];
          const ids = new Set<number>();
          contractsList = [...a, ...b].filter((c: Contract) => {
            if (ids.has(c.id)) return false;
            ids.add(c.id);
            return true;
          });
        }
      } else {
        console.warn('⚠️ Erro ao carregar contratos:', contractsRes?.status);
      }
      setContracts(contractsList);
      
      // Processar conexões
      let allConnections: Connection[] = [];
      if (connectionsRes?.status === 'fulfilled' && connectionsRes.value) {
        console.log('📥 Resposta de conexões recebida:', JSON.stringify(connectionsRes.value, null, 2));
        const data = connectionsRes.value;
        const result = data?.result || data;
        
        if (result) {
          const ativas = Array.isArray(result.ativas) ? result.ativas : [];
          const pendentes = Array.isArray(result.pendentes) ? result.pendentes : [];
          const aguardando = Array.isArray(result.aguardando_resposta) ? result.aguardando_resposta : [];
          allConnections = ativas.concat(pendentes).concat(aguardando);
          console.log('✅ Conexões processadas:', {
            ativas: ativas.length,
            pendentes: pendentes.length,
            aguardando: aguardando.length,
            total: allConnections.length
          });
        } else {
          console.warn('⚠️ Estrutura de resposta de conexões inválida:', data);
        }
      } else {
        console.warn('⚠️ Erro ao carregar conexões:', {
          status: connectionsRes?.status,
          reason: connectionsRes?.status === 'rejected' ? connectionsRes.reason : 'unknown'
        });
      }
      setConnections(allConnections);

      // Processar selos (ativos + pendentes para exibir na Home)
      if (sealsRes?.status === 'fulfilled' && sealsRes.value?.result) {
        const result = sealsRes.value.result;
        const ativos = Array.isArray(result.ativos) ? result.ativos : [];
        const pendentes = Array.isArray(result.pendentes) ? result.pendentes : [];
        setUser({ ...userData, sealsObtained: ativos, sealsPendentes: pendentes });
      } else {
        console.warn('⚠️ Erro ao carregar selos:', sealsRes?.status);
      }
      
      console.log('✅ initializeUserData concluído');
    } catch (error: any) {
      console.error('❌ Error initializing user data:', error?.message || error);
      // Não limpar os dados existentes em caso de erro, apenas logar
      // setContracts([]);
      // setConnections([]);
    }
  };

  const login = async (cpf: string, password: string) => {
    try {
      setIsLoading(true);
      const apiInstance = new ApiProvider(false);
      
      // Normalizar CPF: remover pontos, traços e espaços
      const normalizedCpf = cpf.replace(/[^0-9]/g, '');
      
      const response = await apiInstance.post<{ 
        success: boolean;
        message: string;
        data?: { token: string; expires_at: string };
        result?: { token: string; expires_at: string };
        token?: string;
      }>('login', {
        CPF: normalizedCpf,
        password: password,
      });

      if (__DEV__) {
        console.log('📥 Resposta do login:', JSON.stringify(response, null, 2));
      }

      // Ajustar formato da resposta - pode vir como data.token, result.token ou token direto
      const token = response.data?.token || response.result?.token || response.token;
      
      if (__DEV__) {
        console.log('🔑 Token extraído:', token ? `${token.substring(0, 20)}...` : 'não encontrado');
      }
      
      if (token) {
        await AsyncStorage.setItem('authToken', token);
        
        // Buscar dados do usuário
        const apiWithToken = new ApiProvider(true);
        const userResponse = await apiWithToken.get('usuario/dados');
        
        if (__DEV__) {
          console.log('👤 Dados do usuário:', JSON.stringify(userResponse, null, 2));
        }
        
        // Ajustar formato da resposta
        let userData: User | null = null;
        if (userResponse && typeof userResponse === 'object') {
          userData = (userResponse.result || userResponse) as User;
        }
        
        if (userData && userData.id) {
          // Garantir que o código seja sempre uma string de 6 dígitos
          if (userData.codigo) {
            const codigoStr = String(userData.codigo).trim();
            // Se tem mais de 6 dígitos, usar apenas os últimos 6 (código antigo)
            // Mas isso deve ser corrigido no backend
            if (codigoStr.length > 6) {
              console.warn(`Código com mais de 6 dígitos detectado: ${codigoStr}. Isso deve ser corrigido no backend.`);
            }
            // Garantir que seja string de 6 dígitos
            userData.codigo = codigoStr.length > 6 
              ? codigoStr.slice(-6) 
              : codigoStr.padStart(6, '0');
          }
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          // Carregar dados do usuário (contratos, conexões, selos)
          await initializeUserData(userData);
        } else {
          throw new Error('Erro ao buscar dados do usuário');
        }
      } else {
        throw new Error('Login falhou - token não recebido');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (__DEV__) {
        console.error('Erro detalhado:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Desconectar WebSocket e parar polling
      if (pollingCleanupRef.current) {
        pollingCleanupRef.current();
        pollingCleanupRef.current = null;
      }
      webSocketService.disconnect();
      
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setContracts([]);
      setConnections([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUserData = async () => {
    if (!user?.id) return;
    
    if (isRefreshing) {
      if (__DEV__) console.log('⚠️ refreshUserData já está em execução, ignorando chamada');
      return;
    }
    const now = Date.now();
    if (now - lastRefreshAtRef.current < REFRESH_COOLDOWN_MS) {
      if (__DEV__) console.log('⚠️ refreshUserData em cooldown (evitar loop), ignorando');
      return;
    }
    
    setIsRefreshing(true);
    try {
      console.log('🔄 Iniciando refreshUserData...');
      await initializeUserData(user);
      console.log('✅ refreshUserData concluído');
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
      // Não propagar o erro para evitar loops
    } finally {
      lastRefreshAtRef.current = Date.now();
      setIsRefreshing(false);
    }
  };

  const removeConnection = (connectionId: number) => {
    setConnections((prev) => prev.filter((c) => c.id !== connectionId));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        contracts,
        connections,
        isLoading,
        setUser,
        setContracts,
        setConnections,
        removeConnection,
        login,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

