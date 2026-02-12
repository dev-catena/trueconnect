export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
};

export const formatCEP = (cep: string): string => {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length <= 5) return cleaned;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

export const maskDate = (date: string): string => {
  const cleaned = date.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
};

export const parseDateString = (dateString: string): Date | null => {
  const cleaned = dateString.replace(/\D/g, '');
  if (cleaned.length !== 8) return null;
  
  const day = parseInt(cleaned.slice(0, 2), 10);
  const month = parseInt(cleaned.slice(2, 4), 10) - 1; // Mês é 0-indexed
  const year = parseInt(cleaned.slice(4, 8), 10);
  
  if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900) {
    return null;
  }
  
  const date = new Date(year, month, day);
  
  // Verifica se a data é válida (ex: 31/02 não é válido)
  if (
    date.getDate() !== day ||
    date.getMonth() !== month ||
    date.getFullYear() !== year
  ) {
    return null;
  }
  
  return date;
};

/**
 * Formata o código do usuário para sempre ter 6 dígitos
 * IMPORTANTE: Se o código tiver mais de 6 dígitos, isso indica um código antigo/inválido
 * Nesse caso, retornamos o código como está e deixamos o backend tratar
 * Se tiver menos de 6 dígitos, preenche com zeros à esquerda
 */
export const formatUserCode = (code: string | number | null | undefined): string => {
  if (!code) return '000000';
  
  const codeStr = String(code).trim();
  
  // Se tem exatamente 6 dígitos, retornar como está
  if (codeStr.length === 6) {
    return codeStr;
  }
  
  // Se tem mais de 6 dígitos, isso é um código antigo/inválido
  // Retornar os últimos 6 dígitos apenas para exibição, mas isso deve ser corrigido no backend
  if (codeStr.length > 6) {
    console.warn(`Código com mais de 6 dígitos detectado: ${codeStr}. Usando últimos 6 dígitos para exibição.`);
    return codeStr.slice(-6);
  }
  
  // Se tem menos de 6 dígitos, preencher com zeros à esquerda
  return codeStr.padStart(6, '0');
};

/**
 * Formata o código do usuário para exibição (com espaço no meio: XXX XXX)
 */
export const formatUserCodeDisplay = (code: string | number | null | undefined): string => {
  const formatted = formatUserCode(code);
  return formatted.replace(/(\d{3})(\d{3})/, '$1 $2');
};

