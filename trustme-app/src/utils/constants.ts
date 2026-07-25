// Backend de produção (VPS)
export const API_HOST = 'api.trueconnection.cloud';
export const API_PORT = '443';
export const API_BASE_URL = `https://${API_HOST}/api`;
export const BACKEND_BASE_URL = `https://${API_HOST}`; // Para URLs de storage/fotos

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
