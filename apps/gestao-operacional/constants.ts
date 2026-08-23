
import { Room, RoomStatus, User, UserRole, StockItem, MaintenanceTask, MinibarTransaction, LogbookEntry, MinibarItem, PermissionModule } from './types';

export const ALL_MODULES: PermissionModule[] = [
  'dashboard', 'rooms', 'housekeeping', 'minibar', 'maintenance', 
  'inventory', 'logbook', 'reports', 'performance', 'team', 'ac_management', 'ai_insights'
];

// IMPORTANTE: nunca coloque senha real aqui. Este arquivo vira parte do
// bundle JavaScript e fica visivel a qualquer visitante (view-source).
// Autenticacao de verdade acontece so via api/auth.php (senha com hash no
// banco, Google login com verificacao de assinatura). Estes registros
// servem apenas para semear nome/cargo/permissoes na equipe local.
export const MOCK_USERS: User[] = [
  {
    id: 'owner',
    name: 'Mateus Rezende',
    email: 'mateus.orezende@gmail.com',
    password: '',
    role: UserRole.ADMIN,
    contact: '(62) 99999-9999',
    photo: 'https://picsum.photos/seed/mateus/200',
    active: true,
    permissions: [...ALL_MODULES]
  },
  {
    id: '1',
    name: 'Admin Araguaia',
    email: 'admin@palacioaraguaia.com',
    password: '',
    role: UserRole.ADMIN,
    contact: '(62) 99999-0001',
    photo: 'https://picsum.photos/seed/admin/200',
    active: true,
    permissions: [...ALL_MODULES]
  },
  {
    id: '2',
    name: 'Maria Silva',
    email: 'maria@palacioaraguaia.com',
    password: '',
    role: UserRole.HOUSEKEEPING,
    contact: '(62) 99999-0002',
    photo: 'https://picsum.photos/seed/maria/200',
    active: true,
    permissions: ['rooms', 'housekeeping', 'minibar', 'logbook']
  },
  {
    id: '3',
    name: 'João Santos',
    email: 'joao@palacioaraguaia.com',
    password: '',
    role: UserRole.MAINTENANCE,
    contact: '(62) 99999-0003',
    photo: 'https://picsum.photos/seed/joao/200',
    active: true,
    permissions: ['rooms', 'maintenance', 'logbook']
  },
];

const now = new Date();
const fourDaysAgo = new Date(now.getTime() - (4 * 24 * 60 * 60 * 1000)).toISOString();
const today = now.toISOString();

const generateRooms = (): Room[] => {
  const rooms: Room[] = [];
  const floor1 = [101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,122,124];
  floor1.forEach(n => {
    rooms.push({
      id: n,
      number: n.toString(),
      floor: 1,
      category: 'Standard',
      status: n % 5 === 0 ? RoomStatus.OCCUPIED : RoomStatus.RELEASED,
      lastCleaning: today,
      lastMaintenance: '-',
      lastACCleaning: today,
      responsible: 'Joana Pereira',
      guestName: n % 5 === 0 ? 'Hóspede' : undefined,
      history: [
        { date: '19/11/2025 08:30', action: 'Limpeza de rotina concluída', user: 'Maria Silva', type: 'CLEANING' },
        { date: '19/11/2025 09:15', action: 'Vistoria aprovada', user: 'Admin Araguaia', type: 'INSPECTION' }
      ],
      photos: []
    });
  });

  for(let n=201; n<=227; n++) {
    rooms.push({
      id: n,
      number: n.toString(),
      floor: 2,
      category: 'Superior',
      status: n % 7 === 0 ? RoomStatus.CLEANING : RoomStatus.RELEASED,
      lastCleaning: today,
      lastMaintenance: '-',
      lastACCleaning: today,
      responsible: 'Ana Costa',
      history: [
        { date: '18/11/2025 14:20', action: 'Reparo no chuveiro', user: 'João Santos', type: 'MAINTENANCE' },
        { date: '18/11/2025 15:45', action: 'Limpeza pós-manutenção', user: 'Ana Costa', type: 'CLEANING' }
      ],
      photos: []
    });
  }

  for(let n=301; n<=327; n++) {
    rooms.push({
      id: n,
      number: n.toString(),
      floor: 3,
      category: 'Suíte',
      status: n === 303 || n === 315 ? RoomStatus.BLOCKED : RoomStatus.RELEASED,
      lastCleaning: fourDaysAgo,
      lastMaintenance: '-',
      lastACCleaning: fourDaysAgo,
      responsible: 'Maria Silva',
      history: [
        { date: '17/11/2025 10:00', action: 'Bloqueio preventivo', user: 'Admin Araguaia', type: 'SYSTEM' }
      ],
      photos: []
    });
  }
  return rooms;
};

export const MOCK_ROOMS: Room[] = generateRooms();

export const MOCK_STOCK: StockItem[] = [
  { id: '1', name: 'Sabonete 20g', category: 'AMENITIES', quantity: 150, minQuantity: 50, unit: 'un', unitPrice: 0.85, photo: 'https://picsum.photos/seed/soap/200', location: 'Depósito A' },
  { id: '2', name: 'Detergente 5L', category: 'CLEANING', quantity: 12, minQuantity: 5, unit: 'galão', unitPrice: 45.00, photo: 'https://picsum.photos/seed/det/200', location: 'Depósito B' },
  { id: '3', name: 'Lâmpada LED 9W', category: 'MAINTENANCE', quantity: 8, minQuantity: 10, unit: 'un', unitPrice: 12.90, photo: 'https://picsum.photos/seed/bulb/200', location: 'Manutenção' },
  { id: '4', name: 'Toalha de Banho', category: 'AMENITIES', quantity: 200, minQuantity: 100, unit: 'un', unitPrice: 28.00, photo: 'https://picsum.photos/seed/towel/200', location: 'Rouparia' },
];

export const MOCK_MAINTENANCE: MaintenanceTask[] = [
  { id: 'm1', roomId: '101', type: 'Ar Condicionado', description: 'Troca de gás', priority: 'Urgente', date: '19/11/2025 às 20:09', responsible: 'mateus.o.rezende@unesp.br', cost: 150.00, status: 'PENDING' },
  { id: 'm2', roomId: '204', type: 'Vazamento Banheiro', description: 'Troca de sifão', priority: 'Alta', date: '20/11/2025 às 10:30', responsible: 'joao.santos@hotel.com', cost: 85.50, status: 'IN_PROGRESS' },
];

export const MOCK_MINIBAR_CATALOG: MinibarItem[] = [
  { id: 'c1', name: 'Água Mineral 500ml', price: 4.00, category: 'BEVERAGE' },
  { id: 'c2', name: 'Cerveja Heineken', price: 15.00, category: 'ALCOHOL' },
  { id: 'c3', name: 'Coca-Cola lata', price: 8.00, category: 'BEVERAGE' },
  { id: 'c4', name: 'Chocolate Lindt', price: 15.00, category: 'SNACK' },
  { id: 'c5', name: 'Vinho Tinto Mini', price: 35.00, category: 'ALCOHOL' },
  { id: 'c6', name: 'Mix de Castanhas', price: 12.00, category: 'SNACK' },
];

export const MOCK_MINIBAR: MinibarTransaction[] = [
  { id: '1', roomId: '301', item: 'Água Mineral 500ml', quantity: 2, value: 8.00, registeredBy: 'Maria Silva', date: 'Hoje 10:30', status: 'CONSUMED' },
  { id: '2', roomId: '205', item: 'Cerveja Heineken', quantity: 3, value: 45.00, registeredBy: 'Ana Costa', date: 'Hoje 09:15', status: 'CONSUMED' },
  { id: '3', roomId: '102', item: 'Coca-Cola lata', quantity: 1, value: 10.00, registeredBy: 'Maria Silva', date: 'Hoje 08:45', status: 'CONSUMED' },
  { id: '4', roomId: '305', item: 'Chocolate Lindt', quantity: 2, value: 30.00, registeredBy: 'Joana Pereira', date: 'Ontem', status: 'LOSS' },
  { id: '5', roomId: '201', item: 'Vinho Tinto Mini', quantity: 1, value: 35.00, registeredBy: 'Ana Costa', date: 'Ontem', status: 'CONSUMED' },
  { id: '6', roomId: '104', item: 'Água Mineral 500ml', quantity: 1, value: 4.00, registeredBy: 'Maria Silva', date: 'Ontem', status: 'LOSS' },
];

export const MOCK_LOGBOOK: LogbookEntry[] = [
  {
    id: '1',
    type: 'ALERT',
    text: 'Hóspede do 305 reclamou de barulho no corredor. Verificar às 22h.',
    author: 'Carlos Souza',
    department: 'Recepção',
    time: '14:30',
    turn: 'Tarde (15h-23h)',
    date: 'Hoje'
  },
  {
    id: '2',
    type: 'MAINTENANCE',
    text: 'Elevador 2 em manutenção preventiva amanhã das 8h às 12h.',
    author: 'José Ferreira',
    department: 'Manutenção',
    time: '12:15',
    turn: 'Tarde (15h-23h)',
    date: 'Hoje'
  },
  {
    id: '3',
    type: 'GUEST',
    text: 'VIP chegando amanhã - Sr. Roberto Campos. Preparar welcome drink e frutas no 301.',
    author: 'Ana Paula',
    department: 'Gerência',
    time: '11:00',
    turn: 'Manhã (07h-15h)',
    date: 'Ontem'
  }
];

export const CHECKLIST_ITEMS = [
  "Cama arrumada", "Banheiro limpo", "Toalhas trocadas", "TV funcionando", "Ar condicionado ligado",
  "Lâmpadas funcionando", "Piso limpo", "Espelho limpo", "Janelas limpas", "Cortinas ajustadas",
  "Amenities repostos", "Lixeiras esvaziadas", "Frigobar reabastecido", "Móveis limpos",
  "Box limpo", "Papel higiênico reposto", "Sabonetes repostos", "Aspirador passado",
  "Porta verificada", "Cofre verificado"
];

export const RECENT_CLEANINGS = [
  { id: 1, room: '203', duration: '0 minutos', date: '19/11/2025 às 21:59', user: 'mateus.o.rezende@unesp.br' },
  { id: 2, room: '102', duration: '1 minutos', date: '19/11/2025 às 17:08', user: 'mateus.o.rezende@unesp.br' },
  { id: 3, room: '102', duration: '0 minutos', date: '03/11/2025 às 21:05', user: 'mateus.rezende@gmail.com' },
  { id: 4, room: '201', duration: '0 minutos', date: '01/11/2025 às 19:28', user: 'mateus.rezende@gmail.com' },
];
