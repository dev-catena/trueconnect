import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IS_DEV = __DEV__;
const BASE_URL = IS_DEV ? 'http://10.102.0.103:8001/api' : 'https://api-trustme.catenasystem.com.br/api';

if (IS_DEV) {
  console.log('🔗 API Config:', { BASE_URL });
}

// Interface para o ApiProvider
interface IApiProvider {
  get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T>;
  post<T = any>(endpoint: string, data?: any, config?: any): Promise<T>;
  patch<T = any>(endpoint: string, data?: any): Promise<T>;
  put<T = any>(endpoint: string, data?: any): Promise<T>;
  delete(endpoint: string, data?: any): Promise<void>;
  postWithFiles(
    endpoint: string,
    files: Array<{ uri: string; name: string; type: string }>,
    otherFields?: Record<string, any>
  ): Promise<any>;
}

// Função factory para criar instância
function createApiInstance(useToken: boolean = true): IApiProvider {
  const axiosInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor de requisição
  axiosInstance.interceptors.request.use(
    async (config) => {
      if (useToken) {
        try {
          const token = await AsyncStorage.getItem('authToken');
          if (token && config.headers) {
            // Limpar o token de espaços em branco
            const cleanToken = token.trim();
            config.headers.Authorization = `Bearer ${cleanToken}`;
            if (IS_DEV) {
              console.log(`🔑 Token enviado para: ${config.url}`);
              console.log(`📝 Token length: ${cleanToken.length}`);
            }
          } else {
            if (IS_DEV) {
              console.warn(`⚠️ Token não encontrado para: ${config.url}`);
            }
          }
        } catch (error) {
          if (IS_DEV) {
            console.error('❌ Erro ao obter token:', error);
          }
        }
      }
      
      // Se for FormData, remover Content-Type para axios definir automaticamente com boundary
      if (config.data instanceof FormData) {
        if (config.headers) {
          delete config.headers['Content-Type'];
        }
        if (IS_DEV) {
          console.log(`📤 FormData detectado, Content-Type será definido automaticamente`);
        }
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor de resposta para lidar com 401
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        const url = error.config?.url || '';
        
        // Não tratar 401 em rotas públicas (login, registro, etc)
        const publicRoutes = ['login', 'register', 'usuario/gravar', 'acesso/', 'auth/google'];
        const isPublicRoute = publicRoutes.some(route => url.includes(route));
        
        if (!isPublicRoute) {
          // Apenas limpar token se não for uma rota pública
          if (IS_DEV) {
            console.error('🚫 Erro 401 - Não autorizado:', {
              url: url,
              message: error.response?.data?.message || error.message,
            });
            
            // Verificar se o token existe
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
              console.log(`🔍 Token existe no storage, mas foi rejeitado pelo servidor`);
              console.log(`🔍 Token preview: ${token.substring(0, 20)}...`);
              
              // Limpar token expirado/inválido
              try {
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('user');
                console.log(`🧹 Token e dados do usuário removidos do storage`);
              } catch (storageError) {
                console.error('❌ Erro ao limpar storage:', storageError);
              }
            } else {
              console.log(`🔍 Token não encontrado no storage`);
            }
          } else {
            // Em produção, apenas limpar sem logs detalhados
            try {
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('user');
            } catch (storageError) {
              // Silencioso em produção
            }
          }
        } else {
          // Para rotas públicas, apenas logar o erro sem limpar token
          if (IS_DEV) {
            console.log(`🔐 Erro 401 em rota pública (esperado): ${url}`);
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return {
    async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
      try {
        console.log(`ApiProvider - GET ${endpoint}`, params);
        const response = await axiosInstance.get(endpoint, { params });
        
        if (IS_DEV) {
          console.log(`ApiProvider - GET Response ${endpoint}:`, {
            status: response.status,
            data: response.data,
            dataType: typeof response.data,
            isArray: Array.isArray(response.data),
          });
        }
        
        if (response.data === null || response.data === undefined) {
          if (IS_DEV) {
            console.warn(`ApiProvider - GET ${endpoint}: response.data é null ou undefined`);
          }
          return {} as T;
        }
        
        if (Array.isArray(response.data)) {
          return { data: response.data } as T;
        }
        
        return response.data;
      } catch (error: any) {
        console.error(`ApiProvider - GET Error: ${endpoint}`, error);
        console.error(`ApiProvider - GET Error Details:`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        // Não retornar {} silenciosamente, deixar o erro propagar
        throw error;
      }
    },

    async post<T = any>(endpoint: string, data?: any, config?: any): Promise<T> {
      try {
        console.log(`ApiProvider - POST ${endpoint}`, data);
        const response = await axiosInstance.post(endpoint, data, config);
        
        if (Array.isArray(response.data)) {
          return { data: response.data } as T;
        }
        
        return response.data;
      } catch (error: any) {
        console.error(`ApiProvider - POST Error: ${endpoint}`, error);
        throw error;
      }
    },

    async patch<T = any>(endpoint: string, data?: any): Promise<T> {
      try {
        console.log(`ApiProvider - PATCH ${endpoint}`, data);
        const response = await axiosInstance.patch(endpoint, data);
        
        if (Array.isArray(response.data)) {
          return { data: response.data } as T;
        }
        
        return response.data;
      } catch (error: any) {
        console.error(`ApiProvider - PATCH Error: ${endpoint}`, error);
        throw error;
      }
    },

    async put<T = any>(endpoint: string, data?: any): Promise<T> {
      try {
        console.log(`ApiProvider - PUT ${endpoint}`, data);
        const response = await axiosInstance.put(endpoint, data);
        return response.data;
      } catch (error: any) {
        console.error(`ApiProvider - PUT Error: ${endpoint}`, error);
        throw error;
      }
    },

    async delete(endpoint: string, data?: any): Promise<void> {
      try {
        console.log(`ApiProvider - DELETE ${endpoint}`);
        await axiosInstance.delete(endpoint, { data });
      } catch (error: any) {
        console.error(`ApiProvider - DELETE Error: ${endpoint}`, error);
        throw error;
      }
    },

    async postWithFiles(
      endpoint: string,
      files: Array<{ uri: string; name: string; type: string }>,
      otherFields?: Record<string, any>
    ): Promise<any> {
      try {
        const formData = new FormData();

        files.forEach((file) => {
          formData.append('anexos[]', {
            uri: file.uri,
            name: file.name,
            type: file.type,
          } as any);
        });

        if (otherFields) {
          Object.entries(otherFields).forEach(([key, value]) => {
            formData.append(key, value.toString());
          });
        }

        // Não definir Content-Type manualmente - axios faz isso automaticamente com boundary correto
        const response = await axiosInstance.post(endpoint, formData);

        return response.data;
      } catch (error: any) {
        console.error(`ApiProvider - POST with files Error: ${endpoint}`, error);
        throw error;
      }
    },
  };
}

// Classe wrapper para manter compatibilidade
class ApiProvider {
  private instance: IApiProvider;

  constructor(useToken: boolean = true) {
    this.instance = createApiInstance(useToken);
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.instance.get<T>(endpoint, params);
  }

  async post<T = any>(endpoint: string, data?: any, config?: any): Promise<T> {
    return this.instance.post<T>(endpoint, data, config);
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.instance.patch<T>(endpoint, data);
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.instance.put<T>(endpoint, data);
  }

  async delete(endpoint: string, data?: any): Promise<void> {
    return this.instance.delete(endpoint, data);
  }

  async postWithFiles(
    endpoint: string,
    files: Array<{ uri: string; name: string; type: string }>,
    otherFields?: Record<string, any>
  ): Promise<any> {
    return this.instance.postWithFiles(endpoint, files, otherFields);
  }
}

export default ApiProvider;
