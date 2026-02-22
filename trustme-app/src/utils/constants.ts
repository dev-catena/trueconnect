// Única configuração do backend
// API_HOST: IP do servidor onde está a API (10.102.0.30 = servidor; 10.0.2.2 = emulador Android)
// API_PORT: 80 = nginx (produção) | 8000 = php artisan serve (dev local)
export const API_HOST = '10.102.0.30';
export const API_PORT = '80';
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





