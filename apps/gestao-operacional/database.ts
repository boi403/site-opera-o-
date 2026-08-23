
import { Room, StockItem, MaintenanceTask, User, SystemConfig } from './types';

const STORAGE_KEYS = {
  ROOMS: 'araguaia_rooms_data',
  INVENTORY: 'araguaia_inventory_data',
  MAINTENANCE: 'araguaia_maintenance_tasks',
  TEAM: 'araguaia_team_list',
  CONFIG: 'araguaia_system_config'
};

const DEFAULT_API_URL = typeof window !== 'undefined'
  ? new URL('api', window.location.href.split('#')[0]).toString().replace(/\/$/, '')
  : '';

export class DatabaseService {
  private static config: SystemConfig = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.CONFIG) || JSON.stringify({ apiUrl: DEFAULT_API_URL, syncEnabled: true })
  );

  static getConfig(): SystemConfig {
    return this.config;
  }

  static setConfig(newConfig: SystemConfig) {
    this.config = newConfig;
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(newConfig));
  }

  private static async apiCall(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) {
    if (!this.config.apiUrl || !this.config.syncEnabled) return null;

    try {
      const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined
      });
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error(`Erro ao conectar com Render API (${endpoint}):`, error);
      return null;
    }
  }

  // Autenticacao (login por senha, Google, recuperacao) agora e feita via
  // Firebase Auth — ver lib/authService.ts. O api/auth.php continua no
  // repositorio mas nao e mais chamado pelo frontend.

  // Métodos Genéricos de Persistência
  static async saveData<T>(key: string, endpoint: string, data: T) {
    localStorage.setItem(key, JSON.stringify(data));
    await this.apiCall(endpoint, 'POST', data);
  }

  static loadData<T>(key: string, defaultValue: T): T {
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : defaultValue;
  }

  // Quartos
  static async saveRooms(rooms: Room[]) {
    await this.saveData(STORAGE_KEYS.ROOMS, '/rooms', rooms);
  }

  static getRooms(fallback: Room[]): Room[] {
    return this.loadData(STORAGE_KEYS.ROOMS, fallback);
  }

  // Inventário
  static async saveInventory(items: StockItem[]) {
    await this.saveData(STORAGE_KEYS.INVENTORY, '/inventory', items);
  }

  static getInventory(fallback: StockItem[]): StockItem[] {
    return this.loadData(STORAGE_KEYS.INVENTORY, fallback);
  }

  // Manutenção
  static async saveTasks(tasks: MaintenanceTask[]) {
    await this.saveData(STORAGE_KEYS.MAINTENANCE, '/maintenance', tasks);
  }

  static getTasks(fallback: MaintenanceTask[]): MaintenanceTask[] {
    return this.loadData(STORAGE_KEYS.MAINTENANCE, fallback);
  }
}
