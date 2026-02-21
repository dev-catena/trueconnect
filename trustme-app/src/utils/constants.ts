// Única configuração do backend - porta 8000
// Altere API_HOST: 10.0.2.2 (emulador Android) | 10.102.0.103 (dispositivo físico) | localhost (iOS simulator)
export const API_HOST = '10.102.0.103';
export const API_PORT = '8000';
export const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;
export const BACKEND_BASE_URL = `http://${API_HOST}:${API_PORT}`; // Para URLs de storage/fotos

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
};

export const ROUTES = {
  LOGIN: 'Login',
  REGISTER: 'Register',
  NEW_PASSWORD: 'NewPassword',
  HOME: 'Home',
  CONTRACTS: 'Contracts',
  CONTRACT_DETAIL: 'ContractDetail',
  NEW_CONTRACT: 'NewContract',
  CONNECTION_PANEL: 'ConnectionPanel',
  CONNECTION_DETAIL: 'ConnectionDetail',
  PROFILE: 'Profile',
};





