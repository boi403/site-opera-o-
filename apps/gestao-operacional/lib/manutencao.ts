import {
  Ambiente,
  AmbienteTipo,
  ManutencaoCategoria,
  ManutencaoMaterial,
  ManutencaoRegistro,
  Room,
} from '../types';

const STORAGE_KEYS = {
  CUSTOM_AMBIENTES: 'araguaia_manutencao_ambientes_custom',
  REGISTROS: 'araguaia_manutencao_registros',
  DAILY_RATES: 'araguaia_room_daily_rates',
};

const RECORRENCIA_MIN_OCORRENCIAS = 3;
const RECORRENCIA_JANELA_MESES = 6;

const DEFAULT_DAILY_RATES: Record<string, number> = {
  Standard: 220,
  Superior: 280,
  Suíte: 380,
};

// --- Ambientes ---

export function getCustomAmbientes(): Ambiente[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_AMBIENTES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomAmbientes(ambientes: Ambiente[]) {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_AMBIENTES, JSON.stringify(ambientes));
}

export function addCustomAmbiente(input: {
  tipo: Exclude<AmbienteTipo, 'quarto'>;
  identificacao: string;
  andar: number;
  referencia?: string;
}): Ambiente {
  const novo: Ambiente = {
    id: `custom_${Math.random().toString(36).slice(2, 10)}`,
    tipo: input.tipo,
    identificacao: input.identificacao,
    andar: input.andar,
    referencia: input.referencia,
    custom: true,
  };
  const atuais = getCustomAmbientes();
  saveCustomAmbientes([...atuais, novo]);
  return novo;
}

export function removeCustomAmbiente(id: string) {
  saveCustomAmbientes(getCustomAmbientes().filter((a) => a.id !== id));
}

export function ambienteIdParaQuarto(roomId: number): string {
  return `quarto_${roomId}`;
}

/** Unifica quartos (derivados de Room[]) e áreas comuns (cadastro manual) num só registro de ambientes. */
export function getAmbientes(rooms: Room[]): Ambiente[] {
  const dosQuartos: Ambiente[] = rooms.map((r) => ({
    id: ambienteIdParaQuarto(r.id),
    tipo: 'quarto',
    identificacao: r.number,
    andar: r.floor,
    quartoId: r.id,
  }));
  return [...dosQuartos, ...getCustomAmbientes()];
}

export function getAmbienteById(rooms: Room[], ambienteId: string): Ambiente | undefined {
  return getAmbientes(rooms).find((a) => a.id === ambienteId);
}

// --- Registros de manutenção ---

export function getRegistros(): ManutencaoRegistro[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTROS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRegistros(registros: ManutencaoRegistro[]) {
  localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(registros));
}

export function addRegistro(input: {
  ambienteId: string;
  funcionarioId: string;
  funcionarioNome: string;
  categoria: ManutencaoCategoria;
  descricao: string;
  fotosAntes: string[];
  prioridade: ManutencaoRegistro['prioridade'];
  ambienteIndisponivel: boolean;
}): ManutencaoRegistro {
  const agora = new Date().toISOString();
  const novo: ManutencaoRegistro = {
    id: `mr_${Math.random().toString(36).slice(2, 10)}`,
    ambienteId: input.ambienteId,
    dataHora: agora,
    funcionarioId: input.funcionarioId,
    funcionarioNome: input.funcionarioNome,
    categoria: input.categoria,
    descricao: input.descricao,
    fotosAntes: input.fotosAntes,
    fotosDepois: [],
    status: 'aberto',
    prioridade: input.prioridade,
    dataInicioIndisponivel: input.ambienteIndisponivel ? agora : undefined,
    materiais: [],
  };
  const atuais = getRegistros();
  saveRegistros([novo, ...atuais]);
  return novo;
}

export function updateRegistroStatus(id: string, status: ManutencaoRegistro['status']) {
  const registros = getRegistros().map((r) => (r.id === id ? { ...r, status } : r));
  saveRegistros(registros);
}

export function resolverRegistro(
  id: string,
  input: {
    fotosDepois: string[];
    materiais: ManutencaoMaterial[];
    custoMaoDeObra?: number;
    observacoesResolucao?: string;
    resolvidoPor: string;
    liberarAmbiente: boolean;
  },
) {
  const agora = new Date().toISOString();
  const registros = getRegistros().map((r) => {
    if (r.id !== id) return r;
    return {
      ...r,
      status: 'resolvido' as const,
      fotosDepois: input.fotosDepois,
      materiais: input.materiais,
      custoMaoDeObra: input.custoMaoDeObra,
      observacoesResolucao: input.observacoesResolucao,
      resolvidoPor: input.resolvidoPor,
      resolvidoEm: agora,
      dataFimIndisponivel: input.liberarAmbiente ? agora : r.dataFimIndisponivel,
    };
  });
  saveRegistros(registros);
}

export function getRegistrosPorAmbiente(ambienteId: string): ManutencaoRegistro[] {
  return getRegistros()
    .filter((r) => r.ambienteId === ambienteId)
    .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
}

// --- Custos e prejuízo ---

export function getDailyRates(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_RATES);
    return raw ? { ...DEFAULT_DAILY_RATES, ...JSON.parse(raw) } : { ...DEFAULT_DAILY_RATES };
  } catch {
    return { ...DEFAULT_DAILY_RATES };
  }
}

export function setDailyRate(category: string, value: number) {
  const rates = getDailyRates();
  rates[category] = value;
  localStorage.setItem(STORAGE_KEYS.DAILY_RATES, JSON.stringify(rates));
}

export function custoMateriais(registro: ManutencaoRegistro): number {
  return registro.materiais.reduce((acc, m) => acc + m.quantidade * m.custoUnitario, 0);
}

export function custoReparo(registro: ManutencaoRegistro): number {
  return custoMateriais(registro) + (registro.custoMaoDeObra || 0);
}

export function diasIndisponivel(registro: ManutencaoRegistro): number {
  if (!registro.dataInicioIndisponivel) return 0;
  const inicio = new Date(registro.dataInicioIndisponivel).getTime();
  const fim = registro.dataFimIndisponivel ? new Date(registro.dataFimIndisponivel).getTime() : Date.now();
  return Math.max(0, (fim - inicio) / (1000 * 60 * 60 * 24));
}

export function prejuizoDireto(registro: ManutencaoRegistro, ambiente: Ambiente | undefined, room: Room | undefined): number {
  if (!ambiente || ambiente.tipo !== 'quarto' || !room) return 0;
  const diaria = getDailyRates()[room.category] ?? 0;
  return diaria * diasIndisponivel(registro);
}

export function prejuizoTotal(registro: ManutencaoRegistro, ambiente: Ambiente | undefined, room: Room | undefined): number {
  return prejuizoDireto(registro, ambiente, room) + custoReparo(registro);
}

// --- Recorrência (manutenção preventiva) ---

/** Mesma categoria no mesmo ambiente ocorrendo >= 3x nos últimos 6 meses. */
export function isRecorrente(registros: ManutencaoRegistro[], ambienteId: string, categoria: ManutencaoCategoria): boolean {
  const limite = new Date();
  limite.setMonth(limite.getMonth() - RECORRENCIA_JANELA_MESES);
  const ocorrencias = registros.filter(
    (r) => r.ambienteId === ambienteId && r.categoria === categoria && new Date(r.dataHora) >= limite,
  );
  return ocorrencias.length >= RECORRENCIA_MIN_OCORRENCIAS;
}

export interface AlertaAmbiente {
  ambienteId: string;
  categoria: ManutencaoCategoria;
  ocorrencias: number;
}

/** Varre todos os registros e devolve os pares (ambiente, categoria) recorrentes — para o dashboard e o overlay no grid. */
export function getAlertasRecorrencia(registros: ManutencaoRegistro[]): AlertaAmbiente[] {
  const limite = new Date();
  limite.setMonth(limite.getMonth() - RECORRENCIA_JANELA_MESES);

  const contagem = new Map<string, number>();
  for (const r of registros) {
    if (new Date(r.dataHora) < limite) continue;
    const chave = `${r.ambienteId}::${r.categoria}`;
    contagem.set(chave, (contagem.get(chave) || 0) + 1);
  }

  const alertas: AlertaAmbiente[] = [];
  for (const [chave, count] of contagem.entries()) {
    if (count >= RECORRENCIA_MIN_OCORRENCIAS) {
      const [ambienteId, categoria] = chave.split('::');
      alertas.push({ ambienteId, categoria: categoria as ManutencaoCategoria, ocorrencias: count });
    }
  }
  return alertas;
}

export function ambienteTemPendencia(registros: ManutencaoRegistro[], ambienteId: string): boolean {
  return registros.some((r) => r.ambienteId === ambienteId && r.status !== 'resolvido');
}

export function ambienteTemAlerta(alertas: AlertaAmbiente[], ambienteId: string): boolean {
  return alertas.some((a) => a.ambienteId === ambienteId);
}

// --- Relatório consolidado por ambiente ---

export interface RelatorioAmbiente {
  totalManutencoes: number;
  totalPorCategoria: Partial<Record<ManutencaoCategoria, number>>;
  totalGastoMaterial: number;
  totalDiasIndisponivel: number;
  prejuizoAcumulado: number;
  ultimaManutencao?: { data: string; categoria: ManutencaoCategoria };
  registros: ManutencaoRegistro[];
}

export function getRelatorioAmbiente(
  ambiente: Ambiente | undefined,
  room: Room | undefined,
  todosRegistros: ManutencaoRegistro[],
  periodo?: { desde: Date; ate: Date },
): RelatorioAmbiente {
  if (!ambiente) {
    return { totalManutencoes: 0, totalPorCategoria: {}, totalGastoMaterial: 0, totalDiasIndisponivel: 0, prejuizoAcumulado: 0, registros: [] };
  }

  let registros = todosRegistros
    .filter((r) => r.ambienteId === ambiente.id)
    .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());

  if (periodo) {
    registros = registros.filter((r) => {
      const d = new Date(r.dataHora);
      return d >= periodo.desde && d <= periodo.ate;
    });
  }

  const totalPorCategoria: Partial<Record<ManutencaoCategoria, number>> = {};
  let totalGastoMaterial = 0;
  let totalDiasIndisponivel = 0;
  let prejuizoAcumulado = 0;

  for (const r of registros) {
    totalPorCategoria[r.categoria] = (totalPorCategoria[r.categoria] || 0) + 1;
    totalGastoMaterial += custoMateriais(r);
    totalDiasIndisponivel += diasIndisponivel(r);
    prejuizoAcumulado += prejuizoTotal(r, ambiente, room);
  }

  const ultima = registros[0];

  return {
    totalManutencoes: registros.length,
    totalPorCategoria,
    totalGastoMaterial,
    totalDiasIndisponivel,
    prejuizoAcumulado,
    ultimaManutencao: ultima ? { data: ultima.dataHora, categoria: ultima.categoria } : undefined,
    registros,
  };
}

// --- Fotos: compressão client-side (não há storage de imagens configurado neste app) ---

export function comprimirImagem(file: File, maxWidth = 1280, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Falha ao carregar a imagem.'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas não suportado neste navegador.'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
