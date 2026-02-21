// User Types
export interface User {
  id: number;
  codigo?: number;
  nome_completo?: string;
  name?: string;
  email: string;
  CPF?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  endereco?: string;
  profissao?: string;
  renda_classe?: string;
  dt_nascimento?: string;
  caminho_foto?: string;
  role?: string;
  google_id?: string;
  avatar?: string;
  cep?: string;
  bairro?: string;
  endereco_numero?: string;
  complemento?: string;
  sealsObtained?: Seal[];
  /** Selos solicitados e ainda pendentes de avaliação (aparecem no card "Selos pendentes" da Home) */
  sealsPendentes?: Seal[];
}

// Seal Types
export interface Seal {
  id: number;
  codigo: string;
  descricao: string;
  validade?: number;
  disponivel: boolean;
}

// Contract Types
export enum ContractStatus {
  Pendente = 'Pendente',
  Ativo = 'Ativo',
  Concluído = 'Concluído',
  Suspenso = 'Suspenso',
  Expirado = 'Expirado',
}

export interface Contract {
  id: number;
  codigo: string;
  descricao?: string;
  status: ContractStatus;
  duracao: number;
  dt_inicio: string;
  dt_fim: string;
  dt_prazo_assinatura?: string | null;
  created_at?: string | null;
  contratante_id: number;
  /** Definido pelo backend - evita inconsistências quando o usuário é participante */
  usuario_e_criador?: boolean;
  contrato_tipo_id: number;
  tipo?: ContractType;
  contratante?: User;
  participantes?: ContractParticipant[];
  clausulas?: Clause[];
  todas_clausulas_aprovadas?: boolean; // Deprecated - usar todas_clausulas_coincidentes
  todas_clausulas_coincidentes?: boolean;
  clausulas_em_desacordo?: number[];
  pode_assinar?: boolean;
  alteracao_rescisao?: {
    manifestacao: string;
    created_at?: string;
  } | null;
}

export interface ContractType {
  id: number;
  codigo: string;
  descricao: string;
}

export interface ContractParticipant {
  usuario_id: number;
  usuario?: User;
  aceito?: boolean;
  dt_aceito?: string;
}

export interface Clause {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  sexual: boolean;
  pendente_para?: number[];
  aceito_por?: number[];
  recusado_por?: number[];
}

// Connection Types
export enum ConnectionStatus {
  Pending = 'Pendente',
  Accepted = 'Aceita',
  Rejected = 'Recusada',
}

export interface Connection {
  id: number;
  solicitante_id: number;
  destinatario_id: number;
  aceito?: boolean;
  solicitante?: User;
  destinatario?: User;
  created_at?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  result?: T;
  errors?: any[];
}




