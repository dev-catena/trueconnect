import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
                  const BASE_URL = __DEV__ ? 'http://10.102.0.103:8001' : 'https://api-trustme.catenasystem.com.br';
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
          
          // Configurar WebSocket/polling para atualizações em tempo real
          if (userData.id && isMounted) {
            // Função para atualizar dados quando eventos ocorrem
            // Usar uma referência estável para evitar problemas de closure
            let currentUserData = userData;
            const handleConnectionUpdate = async () => {
              if (isMounted && currentUserData?.id) {
                if (__DEV__) {
                  console.log('📡 Atualizando lista de conexões...');
                }
                // Atualizar apenas as conexões, não todos os dados
                try {
                  const apiWithToken = new ApiProvider(true);
                  const connectionsRes = await apiWithToken.get('usuario/conexoes');
                  
                  if (connectionsRes && typeof connectionsRes === 'object') {
                    const result = connectionsRes.result || connectionsRes;
                    if (result) {
                      const ativas = Array.isArray(result.ativas) ? result.ativas : [];
                      const pendentes = Array.isArray(result.pendentes) ? result.pendentes : [];
                      const aguardando = Array.isArray(result.aguardando_resposta) ? result.aguardando_resposta : [];
                      const allConnections = ativas.concat(pendentes).concat(aguardando);
                      setConnections(allConnections);
                      if (__DEV__) {
                        console.log('✅ Conexões atualizadas:', allConnections.length);
                      }
                    }
                  }
                } catch (error: any) {
                  // Verificar se é erro de rede - não tentar fazer update completo se for
                  const isNetworkError = error.message === 'Network Error' || 
                                        error.code === 'NETWORK_ERROR' ||
                                        !error.response;
                  
                  if (isNetworkError) {
                    if (__DEV__) {
                      console.warn('⚠️ Erro de rede ao atualizar conexões. Pulando atualização completa.');
                    }
                    // Não tentar fazer update completo em caso de erro de rede
                    return;
                  }
                  
                  console.error('Erro ao atualizar conexões:', error);
                  // Em caso de outros erros, fazer update completo
                  await initializeUserData(currentUserData);
                }
              }
            };
            
            // Registrar listeners para eventos de conexão
            const unsubscribeCriada = webSocketService.on('conexao.criada', handleConnectionUpdate);
            const unsubscribeAtualizada = webSocketService.on('conexao.atualizada', handleConnectionUpdate);
            const unsubscribeRemovida = webSocketService.on('conexao.removida', handleConnectionUpdate);
            
            // Iniciar polling inteligente (verifica mudanças a cada 8 segundos)
            pollingCleanupRef.current = webSocketService.startPolling(
              userData.id,
              handleConnectionUpdate,
              8000 // 8 segundos - verifica mudanças antes de atualizar
            );
            
            // Cleanup ao desmontar
            return () => {
              unsubscribeCriada();
              unsubscribeAtualizada();
              unsubscribeRemovida();
              if (pollingCleanupRef.current) {
                pollingCleanupRef.current();
                pollingCleanupRef.current = null;
              }
              webSocketService.disconnect();
            };
          }
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

      // Processar contratos
      let contractsList: Contract[] = [];
      if (contractsRes?.status === 'fulfilled' && contractsRes.value) {
        const data = contractsRes.value;
        if (Array.isArray(data)) {
          contractsList = data;
        } else if (data?.result && Array.isArray(data.result)) {
          contractsList = data.result;
        } else if (data?.data && Array.isArray(data.data)) {
          contractsList = data.data;
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

      // Processar selos
      if (sealsRes?.status === 'fulfilled' && sealsRes.value?.result?.ativos) {
        const ativos = sealsRes.value.result.ativos;
        if (Array.isArray(ativos) && ativos.length > 0) {
          setUser({ ...userData, sealsObtained: ativos });
        }
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
    
    // Prevenir múltiplas chamadas simultâneas
    if (isRefreshing) {
      console.log('⚠️ refreshUserData já está em execução, ignorando chamada');
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
      setIsRefreshing(false);
    }
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
        login,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

