import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Contract, Connection } from '../../types';
import ApiProvider from '../api/ApiProvider';

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


  useEffect(() => {
    let isMounted = true;
    
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('authToken');
        
        if (isMounted && storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          // Temporariamente desabilitado para isolar o problema
          // await initializeUserData(userData);
          setContracts([]);
          setConnections([]);
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
    };
  }, []);

  const initializeUserData = async (userData: User) => {
    if (!userData?.id) return;
    
    try {
      const apiWithToken = new ApiProvider(true);
      
      // Buscar dados em paralelo
      const [contractsRes, connectionsRes, sealsRes] = await Promise.allSettled([
        apiWithToken.get('contrato/listar'),
        apiWithToken.get('usuario/conexoes'),
        apiWithToken.get(`usuario/${userData.id}/selos`),
      ]);

      // Processar contratos
      let contractsList: Contract[] = [];
      if (contractsRes.status === 'fulfilled' && contractsRes.value) {
        const data = contractsRes.value;
        if (Array.isArray(data)) {
          contractsList = data;
        } else if (data?.result && Array.isArray(data.result)) {
          contractsList = data.result;
        } else if (data?.data && Array.isArray(data.data)) {
          contractsList = data.data;
        }
      }
      setContracts(contractsList);
      
      // Processar conexões
      let allConnections: Connection[] = [];
      if (connectionsRes.status === 'fulfilled' && connectionsRes.value?.result) {
        const result = connectionsRes.value.result;
        const ativas = Array.isArray(result.ativas) ? result.ativas : [];
        const pendentes = Array.isArray(result.pendentes) ? result.pendentes : [];
        const aguardando = Array.isArray(result.aguardando_resposta) ? result.aguardando_resposta : [];
        allConnections = ativas.concat(pendentes).concat(aguardando);
      }
      setConnections(allConnections);

      // Processar selos
      if (sealsRes.status === 'fulfilled' && sealsRes.value?.result?.ativos) {
        const ativos = sealsRes.value.result.ativos;
        if (Array.isArray(ativos) && ativos.length > 0) {
          setUser({ ...userData, sealsObtained: ativos });
        }
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
      setContracts([]);
      setConnections([]);
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
        result: { token: string; expires_at: string } 
      }>('login', {
        CPF: normalizedCpf,
        password: password,
      });

      if (__DEV__) {
        console.log('📥 Resposta do login:', JSON.stringify(response, null, 2));
      }

      // Ajustar formato da resposta - pode vir como result.token ou token direto
      const token = response.result?.token || response.token;
      
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
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          // Temporariamente desabilitado para isolar o problema
          // await initializeUserData(userData);
          setContracts([]);
          setConnections([]);
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
    if (user) {
      await initializeUserData(user);
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

