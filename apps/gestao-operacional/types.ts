
export enum UserRole {
  ADMIN = 'ADMIN',
  HOUSEKEEPING = 'CAMAREIRA',
  MAINTENANCE = 'MANUTENÇÃO',
  RECEPTION = 'RECEPÇÃO',
  GOVERNANCE = 'GOVERNANÇA'
}

export type PermissionModule = 
  | 'dashboard' 
  | 'rooms' 
  | 'housekeeping' 
  | 'minibar' 
  | 'maintenance' 
  | 'inventory' 
  | 'logbook' 
  | 'reports' 
  | 'performance' 
  | 'team'
  | 'ac_management'
  | 'ai_insights'; // Novo módulo

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  contact: string;
  photo: string;
  active: boolean;
  permissions: PermissionModule[];
}

export enum RoomStatus {
  RELEASED = 'LIBERADO',
  CLEANING = 'EM LIMPEZA',
  INSPECTION = 'VISTORIA',
  OCCUPIED = 'OCUPADO',
  BLOCKED = 'BLOQUEADO',
  MAINTENANCE = 'MANUTENÇÃO',
  DIRTY = 'SUJO'
}

export interface RoomHistory {
  date: string;
  action: string;
  user: string;
  type: 'CLEANING' | 'MAINTENANCE' | 'SYSTEM' | 'INSPECTION' | 'AC_CLEANING';
}

export interface Room {
  id: number;
  number: string;
  floor: number;
  category: string;
  status: RoomStatus;
  lastCleaning: string;
  lastMaintenance: string;
  lastACCleaning: string;
  responsible: string;
  guestName?: string;
  history: RoomHistory[];
  photos: string[];
}

export interface StockItem {
  id: string;
  name: string;
  category: 'CLEANING' | 'MAINTENANCE' | 'AMENITIES';
  quantity: number;
  minQuantity: number;
  unit: string;
  unitPrice: number;
  photo: string;
  location: string;
  supplierContact?: string;
}

export interface MaintenanceTask {
  id: string;
  roomId: string;
  type: string;
  description: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  date: string;
  responsible: string;
  cost: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export type MaintenanceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface RecurringMaintenance {
  id: string;
  target: string; 
  type: string;
  frequency: MaintenanceFrequency;
  lastExecution: string;
  nextExecution: string;
  description: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  active: boolean;
}

export interface MinibarItem {
  id: string;
  name: string;
  price: number;
  category: 'BEVERAGE' | 'SNACK' | 'ALCOHOL';
}

export interface MinibarTransaction {
  id: string;
  roomId: string;
  item: string;
  quantity: number;
  value: number;
  registeredBy: string;
  date: string;
  status: 'CONSUMED' | 'LOSS';
}

export interface LogbookEntry {
  id: string;
  type: 'INFO' | 'ALERT' | 'MAINTENANCE' | 'GUEST';
  text: string;
  author: string;
  department: string;
  time: string;
  turn: string;
  date: string;
}

export interface SystemConfig {
  apiUrl: string;
  syncEnabled: boolean;
  lastSync?: string;
}

// --- Módulo de Manutenção por Ambiente (fotos, materiais, prejuízo, recorrência) ---

export type AmbienteTipo = 'quarto' | 'corredor' | 'area_comum' | 'elevador' | 'escada' | 'outro';

export interface Ambiente {
  id: string;
  tipo: AmbienteTipo;
  identificacao: string;
  andar: number;
  referencia?: string;
  quartoId?: number; // preenchido quando tipo === 'quarto', aponta pra Room.id
  custom?: boolean; // true = cadastrado manualmente (área comum), false/undefined = derivado de Room
}

export type ManutencaoCategoria =
  | 'infiltracao'
  | 'pintura_rodape'
  | 'eletrica'
  | 'hidraulica'
  | 'mobiliario'
  | 'ar_condicionado'
  | 'outro';

export const MANUTENCAO_CATEGORIA_LABELS: Record<ManutencaoCategoria, string> = {
  infiltracao: 'Infiltração',
  pintura_rodape: 'Pintura / Rodapé',
  eletrica: 'Elétrica',
  hidraulica: 'Hidráulica',
  mobiliario: 'Mobiliário',
  ar_condicionado: 'Ar-condicionado',
  outro: 'Outro',
};

export type ManutencaoStatusAmbiente = 'aberto' | 'em_andamento' | 'resolvido';
export type ManutencaoPrioridadeAmbiente = 'baixa' | 'media' | 'alta';

export interface ManutencaoMaterial {
  id: string;
  nomeMaterial: string;
  quantidade: number;
  unidade: string;
  custoUnitario: number;
}

export interface ManutencaoRegistro {
  id: string;
  ambienteId: string;
  dataHora: string; // ISO 8601
  funcionarioId: string;
  funcionarioNome: string;
  categoria: ManutencaoCategoria;
  descricao: string;
  fotosAntes: string[]; // data URLs (comprimidas) ou URLs
  fotosDepois: string[];
  status: ManutencaoStatusAmbiente;
  prioridade: ManutencaoPrioridadeAmbiente;
  dataInicioIndisponivel?: string; // ISO
  dataFimIndisponivel?: string; // ISO
  resolvidoEm?: string; // ISO
  resolvidoPor?: string;
  observacoesResolucao?: string;
  materiais: ManutencaoMaterial[];
  custoMaoDeObra?: number;
}
