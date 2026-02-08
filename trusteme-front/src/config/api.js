import { CONFIG } from './environment'

// Configuração da API
export const API_CONFIG = {
  // URL base da API - detectada automaticamente pelo ambiente
  BASE_URL: CONFIG.API_BASE_URL,
  
  // Timeout das requisições
  TIMEOUT: 10000,
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

// URLs das APIs
export const API_ENDPOINTS = {
  SITE_CONTENT: '/site-content',
  PLANS: '/plans',
  FAQS: '/faqs',
  TESTIMONIALS: '/testimonials',
  CONTACTS: '/contacts',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  }
} 