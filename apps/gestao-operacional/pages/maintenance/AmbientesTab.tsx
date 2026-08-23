import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin, Plus, X, Camera, Mic, MicOff, Package, TrendingDown, DoorOpen,
  Search, AlertTriangle, Clock, DollarSign, CalendarDays, Trash2, ChevronRight,
  CheckCircle2, Play, ImageIcon, Building2, ArrowUpRight, Layers,
} from 'lucide-react';
import {
  User, Room, Ambiente, AmbienteTipo, ManutencaoCategoria, ManutencaoRegistro,
  ManutencaoMaterial, ManutencaoPrioridadeAmbiente, MANUTENCAO_CATEGORIA_LABELS,
} from '../../types';
import { MOCK_ROOMS } from '../../constants';
import { DatabaseService } from '../../database';
import { useToast } from '../../context/ToastContext';
import {
  getAmbientes, getRegistros, addRegistro, resolverRegistro, getAlertasRecorrencia,
  ambienteTemPendencia, ambienteTemAlerta, getRelatorioAmbiente, custoMateriais,
  diasIndisponivel, prejuizoTotal, comprimirImagem, addCustomAmbiente, isRecorrente,
  AlertaAmbiente,
} from '../../lib/manutencao';

const TIPO_LABELS: Record<AmbienteTipo, string> = {
  quarto: 'Quarto',
  corredor: 'Corredor',
  area_comum: 'Área comum',
  elevador: 'Elevador',
  escada: 'Escada',
  outro: 'Outro',
};

const PRIORIDADE_LABELS: Record<ManutencaoPrioridadeAmbiente, string> = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };

type Periodo = 'MES' | 'TRIMESTRE' | 'ANO' | 'TUDO';

function periodoParaIntervalo(periodo: Periodo): { desde: Date; ate: Date } | undefined {
  if (periodo === 'TUDO') return undefined;
  const ate = new Date();
  const desde = new Date();
  if (periodo === 'MES') desde.setMonth(desde.getMonth() - 1);
  if (periodo === 'TRIMESTRE') desde.setMonth(desde.getMonth() - 3);
  if (periodo === 'ANO') desde.setFullYear(desde.getFullYear() - 1);
  return { desde, ate };
}

function formatMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatData(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const AmbientesTab: React.FC<{ user: User }> = ({ user }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [registros, setRegistros] = useState<ManutencaoRegistro[]>([]);
  const [alertas, setAlertas] = useState<AlertaAmbiente[]>([]);

  const [tipoFilter, setTipoFilter] = useState<'ALL' | AmbienteTipo>('ALL');
  const [andarFilter, setAndarFilter] = useState<'ALL' | number>('ALL');
  const [search, setSearch] = useState('');
  const [periodo, setPeriodo] = useState<Periodo>('TUDO');

  const [selectedAmbiente, setSelectedAmbiente] = useState<Ambiente | null>(null);
  const [showNovoRegistro, setShowNovoRegistro] = useState(false);
  const [resolvendoRegistro, setResolvendoRegistro] = useState<ManutencaoRegistro | null>(null);
  const [showNovaArea, setShowNovaArea] = useState(false);

  const { addToast } = useToast();

  const reload = () => {
    const r = DatabaseService.getRooms(MOCK_ROOMS);
    const regs = getRegistros();
    setRooms(r);
    setAmbientes(getAmbientes(r));
    setRegistros(regs);
    setAlertas(getAlertasRecorrencia(regs));
  };

  useEffect(reload, []);

  const andares = useMemo(() => {
    const unicos: number[] = Array.from(new Set(ambientes.map(a => a.andar)));
    return unicos.sort((a: number, b: number) => a - b);
  }, [ambientes]);

  const filteredAmbientes = useMemo(() => ambientes.filter(a => {
    if (tipoFilter !== 'ALL' && a.tipo !== tipoFilter) return false;
    if (andarFilter !== 'ALL' && a.andar !== andarFilter) return false;
    if (search && !a.identificacao.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [ambientes, tipoFilter, andarFilter, search]);

  const roomFor = (ambiente: Ambiente | null | undefined): Room | undefined =>
    ambiente?.quartoId ? rooms.find(r => r.id === ambiente.quartoId) : undefined;

  const relatorioSelecionado = useMemo(
    () => getRelatorioAmbiente(selectedAmbiente || undefined, roomFor(selectedAmbiente), registros, periodoParaIntervalo(periodo)),
    [selectedAmbiente, registros, periodo, rooms],
  );

  const handleNovoRegistroSalvo = () => {
    reload();
    setShowNovoRegistro(false);
    addToast('Manutenção registrada. Ambiente marcado como aberto.', 'SUCCESS');
  };

  const handleResolvido = () => {
    reload();
    setResolvendoRegistro(null);
    addToast('Manutenção concluída e custos registrados.', 'SUCCESS');
  };

  const handleNovaArea = (ambiente: Ambiente) => {
    reload();
    setShowNovaArea(false);
    addToast(`Ambiente "${ambiente.identificacao}" cadastrado.`, 'SUCCESS');
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {alertas.length > 0 && (
        <div className="bg-orange-600 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
          <div className="flex items-start gap-5 relative z-10">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
              <AlertTriangle size={26} />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black uppercase tracking-tighter leading-none">Manutenção recorrente detectada</h4>
              <ul className="space-y-1">
                {alertas.map(a => {
                  const amb = ambientes.find(x => x.id === a.ambienteId);
                  return (
                    <li key={`${a.ambienteId}-${a.categoria}`} className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                      <ArrowUpRight size={12} />
                      Ambiente <button onClick={() => amb && setSelectedAmbiente(amb)} className="underline decoration-2 underline-offset-2">{amb?.identificacao || a.ambienteId}</button>
                      {' '}apresenta <strong>{MANUTENCAO_CATEGORIA_LABELS[a.categoria]}</strong> recorrente ({a.ocorrencias}x em 6 meses) — considerar manutenção preventiva/reforma.
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-[80px]" />
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border dark:border-slate-800 shadow-inner">
            <button onClick={() => setTipoFilter('ALL')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tipoFilter === 'ALL' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>Tudo</button>
            {(Object.keys(TIPO_LABELS) as AmbienteTipo[]).map(t => (
              <button key={t} onClick={() => setTipoFilter(t)} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${tipoFilter === t ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>{TIPO_LABELS[t]}</button>
            ))}
          </div>
          {andares.length > 1 && (
            <select value={andarFilter} onChange={(e) => setAndarFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))} className="px-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest dark:text-white outline-none">
              <option value="ALL">Todos andares</option>
              {andares.map(a => <option key={a} value={a}>{a}º andar</option>)}
            </select>
          )}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Buscar ambiente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-xs font-black dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
        </div>
        <button onClick={() => setShowNovaArea(true)} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all shrink-0">
          <Plus size={16} /> Nova área comum
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAmbientes.map(ambiente => {
          const pendente = ambienteTemPendencia(registros, ambiente.id);
          const recorrente = ambienteTemAlerta(alertas, ambiente.id);
          const relatorio = getRelatorioAmbiente(ambiente, roomFor(ambiente), registros);
          return (
            <button
              key={ambiente.id}
              onClick={() => setSelectedAmbiente(ambiente)}
              className={`text-left bg-white dark:bg-slate-900 border-2 rounded-[3rem] p-6 space-y-5 transition-all hover:shadow-2xl relative overflow-hidden ${
                recorrente ? 'border-orange-400/50' : pendente ? 'border-amber-300/40' : 'border-slate-50 dark:border-slate-800'
              }`}
            >
              {(pendente || recorrente) && (
                <div className={`absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${recorrente ? 'bg-orange-500 animate-pulse' : 'bg-amber-400'}`}>
                  <AlertTriangle size={16} className="text-white" />
                </div>
              )}
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-white shadow-xl ${ambiente.tipo === 'quarto' ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  {ambiente.tipo === 'quarto' ? <DoorOpen size={24} /> : <Building2 size={24} />}
                </div>
                <div className="min-w-0">
                  <span className="text-lg font-black text-slate-900 dark:text-white leading-none block truncate">{ambiente.identificacao}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{TIPO_LABELS[ambiente.tipo]} · {ambiente.andar}º andar</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 dark:bg-black/30 rounded-2xl border dark:border-slate-800">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Manutenções</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{relatorio.totalManutencoes}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-black/30 rounded-2xl border dark:border-slate-800">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Prejuízo</p>
                  <p className="text-xs font-black text-red-500 leading-none">{formatMoeda(relatorio.prejuizoAcumulado)}</p>
                </div>
              </div>

              {relatorio.ultimaManutencao && (
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock size={10} /> {MANUTENCAO_CATEGORIA_LABELS[relatorio.ultimaManutencao.categoria]} · {formatData(relatorio.ultimaManutencao.data)}
                </p>
              )}
            </button>
          );
        })}

        {filteredAmbientes.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-400">
            <Layers size={40} className="mx-auto mb-4 opacity-40" />
            <p className="text-xs font-black uppercase tracking-widest">Nenhum ambiente encontrado com esses filtros.</p>
          </div>
        )}
      </div>

      {selectedAmbiente && (
        <AmbienteDetailModal
          ambiente={selectedAmbiente}
          room={roomFor(selectedAmbiente)}
          relatorio={relatorioSelecionado}
          periodo={periodo}
          onPeriodoChange={setPeriodo}
          onClose={() => setSelectedAmbiente(null)}
          onNovoRegistro={() => setShowNovoRegistro(true)}
          onResolver={(registro) => setResolvendoRegistro(registro)}
        />
      )}

      {showNovoRegistro && selectedAmbiente && (
        <NovoRegistroModal
          ambiente={selectedAmbiente}
          user={user}
          onClose={() => setShowNovoRegistro(false)}
          onSaved={handleNovoRegistroSalvo}
        />
      )}

      {resolvendoRegistro && (
        <ResolverRegistroModal
          registro={resolvendoRegistro}
          user={user}
          onClose={() => setResolvendoRegistro(null)}
          onSaved={handleResolvido}
        />
      )}

      {showNovaArea && (
        <NovaAreaComumModal onClose={() => setShowNovaArea(false)} onSaved={handleNovaArea} />
      )}
    </div>
  );
};

// --- Modal de detalhe / relatório + timeline ---

const AmbienteDetailModal: React.FC<{
  ambiente: Ambiente;
  room: Room | undefined;
  relatorio: ReturnType<typeof getRelatorioAmbiente>;
  periodo: Periodo;
  onPeriodoChange: (p: Periodo) => void;
  onClose: () => void;
  onNovoRegistro: () => void;
  onResolver: (registro: ManutencaoRegistro) => void;
}> = ({ ambiente, room, relatorio, periodo, onPeriodoChange, onClose, onNovoRegistro, onResolver }) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[4rem] w-full max-w-4xl overflow-hidden shadow-2xl border dark:border-slate-800 flex flex-col max-h-[92vh]">
        <div className="p-10 border-b dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-black/20 shrink-0">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center text-white shadow-xl ${ambiente.tipo === 'quarto' ? 'bg-blue-600' : 'bg-slate-700'}`}>
              {ambiente.tipo === 'quarto' ? <DoorOpen size={28} /> : <Building2 size={28} />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">{ambiente.identificacao}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{TIPO_LABELS[ambiente.tipo]} · {ambiente.andar}º andar{ambiente.referencia ? ` · ${ambiente.referencia}` : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 space-y-8 overflow-y-auto scrollbar-hide">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              {(['MES', 'TRIMESTRE', 'ANO', 'TUDO'] as Periodo[]).map(p => (
                <button key={p} onClick={() => onPeriodoChange(p)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${periodo === p ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                  {p === 'MES' ? 'Mês' : p === 'TRIMESTRE' ? 'Trimestre' : p === 'ANO' ? 'Ano' : 'Tudo'}
                </button>
              ))}
            </div>
            <button onClick={onNovoRegistro} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
              <Camera size={16} /> Registrar manutenção
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniKPI label="Manutenções" value={relatorio.totalManutencoes.toString()} icon={<Package size={18} />} color="bg-blue-500" />
            <MiniKPI label="Gasto material" value={formatMoeda(relatorio.totalGastoMaterial)} icon={<DollarSign size={18} />} color="bg-emerald-600" />
            <MiniKPI label="Dias indisponível" value={relatorio.totalDiasIndisponivel.toFixed(1)} icon={<CalendarDays size={18} />} color="bg-purple-600" />
            <MiniKPI label="Prejuízo acumulado" value={formatMoeda(relatorio.prejuizoAcumulado)} icon={<TrendingDown size={18} />} color="bg-red-500" />
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Histórico ({relatorio.registros.length})</p>
            {relatorio.registros.length === 0 && (
              <p className="text-xs font-bold text-slate-400 italic py-8 text-center">Nenhum registro de manutenção nesse período.</p>
            )}
            <div className="space-y-4">
              {relatorio.registros.map(registro => (
                <RegistroCard key={registro.id} registro={registro} ambiente={ambiente} room={room} onResolver={() => onResolver(registro)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MiniKPI: React.FC<{ label: string; value: string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-slate-50 dark:bg-black/30 p-5 rounded-[1.75rem] border dark:border-slate-800">
    <div className={`w-9 h-9 rounded-xl ${color} text-white flex items-center justify-center mb-3 shadow-lg`}>{icon}</div>
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{value}</p>
  </div>
);

const RegistroCard: React.FC<{ registro: ManutencaoRegistro; ambiente: Ambiente; room: Room | undefined; onResolver: () => void }> = ({ registro, ambiente, room, onResolver }) => {
  const materiaisTotal = custoMateriais(registro);
  const dias = diasIndisponivel(registro);
  return (
    <div className="bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-[2.5rem] p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
            registro.status === 'resolvido' ? 'bg-emerald-100 text-emerald-600' : registro.status === 'em_andamento' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
          }`}>
            {registro.status === 'resolvido' ? 'Resolvido' : registro.status === 'em_andamento' ? 'Em andamento' : 'Aberto'}
          </span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{MANUTENCAO_CATEGORIA_LABELS[registro.categoria]}</span>
          <span className={`text-[9px] font-black uppercase tracking-widest ${registro.prioridade === 'alta' ? 'text-red-500' : registro.prioridade === 'media' ? 'text-orange-500' : 'text-slate-400'}`}>
            {PRIORIDADE_LABELS[registro.prioridade]}
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400">{formatData(registro.dataHora)} · {registro.funcionarioNome}</span>
      </div>

      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{registro.descricao}</p>

      <div className="flex gap-3 flex-wrap">
        {registro.fotosAntes.map((foto, i) => (
          <a key={`a${i}`} href={foto} target="_blank" rel="noopener noreferrer" className="relative">
            <img src={foto} className="w-16 h-16 object-cover rounded-xl border-2 border-orange-300" />
            <span className="absolute -top-2 -left-2 bg-orange-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full">ANTES</span>
          </a>
        ))}
        {registro.fotosDepois.map((foto, i) => (
          <a key={`d${i}`} href={foto} target="_blank" rel="noopener noreferrer" className="relative">
            <img src={foto} className="w-16 h-16 object-cover rounded-xl border-2 border-emerald-300" />
            <span className="absolute -top-2 -left-2 bg-emerald-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full">DEPOIS</span>
          </a>
        ))}
        {registro.fotosAntes.length === 0 && registro.fotosDepois.length === 0 && (
          <div className="w-16 h-16 rounded-xl border-2 border-dashed dark:border-slate-800 flex items-center justify-center text-slate-300">
            <ImageIcon size={20} />
          </div>
        )}
      </div>

      {registro.materiais.length > 0 && (
        <div className="bg-slate-50 dark:bg-black/30 rounded-2xl p-4 space-y-1.5">
          {registro.materiais.map(m => (
            <div key={m.id} className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>{m.nomeMaterial} — {m.quantidade}{m.unidade}</span>
              <span>{formatMoeda(m.quantidade * m.custoUnitario)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t dark:border-slate-800">
        <div className="flex gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
          <span>Material: {formatMoeda(materiaisTotal)}</span>
          {dias > 0 && <span>{dias.toFixed(1)} dias indisponível</span>}
          <span>Prejuízo: {formatMoeda(prejuizoTotal(registro, ambiente, room))}</span>
        </div>
        {registro.status !== 'resolvido' && (
          <button onClick={onResolver} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
            <CheckCircle2 size={14} /> Concluir
          </button>
        )}
      </div>
      {registro.observacoesResolucao && (
        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 italic">"{registro.observacoesResolucao}"</p>
      )}
    </div>
  );
};

// --- Captura de foto com compressão ---

const CapturaFotos: React.FC<{ fotos: string[]; onChange: (fotos: string[]) => void; label: string }> = ({ fotos, onChange, label }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLoading(true);
    try {
      const novas = await Promise.all(Array.from(files).map(f => comprimirImagem(f)));
      onChange([...fotos, ...novas]);
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">{label}</label>
      <div className="flex flex-wrap gap-3">
        {fotos.map((foto, i) => (
          <div key={i} className="relative">
            <img src={foto} className="w-20 h-20 object-cover rounded-2xl border-2 dark:border-slate-800" />
            <button type="button" onClick={() => onChange(fotos.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500/40 transition-all disabled:opacity-50"
        >
          <Camera size={20} />
          <span className="text-[7px] font-black uppercase mt-1">{loading ? '...' : 'Foto'}</span>
        </button>
        <input ref={inputRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
      </div>
    </div>
  );
};

// --- Ditado por voz (Web Speech API, com fallback silencioso) ---

const useDitado = (onResult: (texto: string) => void) => {
  const [ouvindo, setOuvindo] = useState(false);
  const recognitionRef = useRef<any>(null);

  const suportado = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const toggle = () => {
    if (!suportado) return;
    if (ouvindo) {
      recognitionRef.current?.stop();
      setOuvindo(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const texto = event.results?.[0]?.[0]?.transcript;
      if (texto) onResult(texto);
    };
    recognition.onend = () => setOuvindo(false);
    recognition.onerror = () => setOuvindo(false);
    recognitionRef.current = recognition;
    recognition.start();
    setOuvindo(true);
  };

  return { suportado, ouvindo, toggle };
};

// --- Modal: novo registro de manutenção ---

const NovoRegistroModal: React.FC<{ ambiente: Ambiente; user: User; onClose: () => void; onSaved: () => void }> = ({ ambiente, user, onClose, onSaved }) => {
  const [categoria, setCategoria] = useState<ManutencaoCategoria>('outro');
  const [prioridade, setPrioridade] = useState<ManutencaoPrioridadeAmbiente>('media');
  const [descricao, setDescricao] = useState('');
  const [fotosAntes, setFotosAntes] = useState<string[]>([]);
  const [indisponivel, setIndisponivel] = useState(ambiente.tipo === 'quarto');

  const ditado = useDitado((texto) => setDescricao((atual) => (atual ? `${atual} ${texto}` : texto)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) return;
    addRegistro({
      ambienteId: ambiente.id,
      funcionarioId: user.id,
      funcionarioNome: user.name,
      categoria,
      descricao: descricao.trim(),
      fotosAntes,
      prioridade,
      ambienteIndisponivel: indisponivel,
    });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[4rem] w-full max-w-xl overflow-hidden shadow-2xl border dark:border-slate-800 max-h-[92vh] flex flex-col">
        <div className="p-10 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-black/20 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">Registrar manutenção</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ambiente.identificacao}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto scrollbar-hide">
          <CapturaFotos fotos={fotosAntes} onChange={setFotosAntes} label="Foto do problema (antes)" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Categoria</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value as ManutencaoCategoria)} className="w-full px-5 py-4 bg-slate-900 text-white border-2 border-slate-800 rounded-2xl text-xs font-black outline-none">
                {Object.entries(MANUTENCAO_CATEGORIA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Prioridade</label>
              <select value={prioridade} onChange={(e) => setPrioridade(e.target.value as ManutencaoPrioridadeAmbiente)} className="w-full px-5 py-4 bg-slate-900 text-white border-2 border-slate-800 rounded-2xl text-xs font-black outline-none">
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 ml-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição do problema</label>
              {ditado.suportado && (
                <button type="button" onClick={ditado.toggle} className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${ditado.ouvindo ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {ditado.ouvindo ? <MicOff size={12} /> : <Mic size={12} />} {ditado.ouvindo ? 'Ouvindo...' : 'Ditar'}
                </button>
              )}
            </div>
            <textarea
              required
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o que precisa ser feito..."
              className="w-full px-6 py-5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold dark:text-white outline-none focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {ambiente.tipo === 'quarto' && (
            <label className="flex items-center gap-3 bg-slate-50 dark:bg-black/30 p-4 rounded-2xl border dark:border-slate-800 cursor-pointer">
              <input type="checkbox" checked={indisponivel} onChange={(e) => setIndisponivel(e.target.checked)} className="w-4 h-4 accent-orange-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quarto indisponível a partir de agora (conta como prejuízo de diária)</span>
            </label>
          )}

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancelar</button>
            <button type="submit" className="flex-[2] px-6 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Abrir manutenção</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Modal: resolver / concluir ---

const ResolverRegistroModal: React.FC<{ registro: ManutencaoRegistro; user: User; onClose: () => void; onSaved: () => void }> = ({ registro, user, onClose, onSaved }) => {
  const [fotosDepois, setFotosDepois] = useState<string[]>([]);
  const [materiais, setMateriais] = useState<ManutencaoMaterial[]>([]);
  const [custoMaoDeObra, setCustoMaoDeObra] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const [liberarAmbiente, setLiberarAmbiente] = useState(true);

  const addMaterial = () => {
    setMateriais([...materiais, { id: Math.random().toString(36).slice(2, 9), nomeMaterial: '', quantidade: 1, unidade: 'un', custoUnitario: 0 }]);
  };

  const updateMaterial = (id: string, patch: Partial<ManutencaoMaterial>) => {
    setMateriais(materiais.map(m => (m.id === id ? { ...m, ...patch } : m)));
  };

  const removeMaterial = (id: string) => setMateriais(materiais.filter(m => m.id !== id));

  const totalMateriais = materiais.reduce((acc, m) => acc + m.quantidade * m.custoUnitario, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resolverRegistro(registro.id, {
      fotosDepois,
      materiais,
      custoMaoDeObra: custoMaoDeObra || undefined,
      observacoesResolucao: observacoes.trim() || undefined,
      resolvidoPor: user.name,
      liberarAmbiente,
    });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[4rem] w-full max-w-xl overflow-hidden shadow-2xl border dark:border-slate-800 max-h-[92vh] flex flex-col">
        <div className="p-10 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-black/20 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">Concluir manutenção</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{MANUTENCAO_CATEGORIA_LABELS[registro.categoria]}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto scrollbar-hide">
          <CapturaFotos fotos={fotosDepois} onChange={setFotosDepois} label="Foto do resultado (depois)" />

          <div>
            <div className="flex items-center justify-between mb-3 ml-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Materiais usados</label>
              <button type="button" onClick={addMaterial} className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase tracking-widest">
                <Plus size={12} /> Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {materiais.map(m => (
                <div key={m.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-black/30 p-2 rounded-2xl">
                  <input placeholder="Material" value={m.nomeMaterial} onChange={(e) => updateMaterial(m.id, { nomeMaterial: e.target.value })} className="col-span-5 px-3 py-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-[11px] font-bold dark:text-white outline-none" />
                  <input type="number" step="0.01" placeholder="Qtd" value={m.quantidade} onChange={(e) => updateMaterial(m.id, { quantidade: Number(e.target.value) })} className="col-span-2 px-2 py-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-[11px] font-bold dark:text-white outline-none" />
                  <input placeholder="Un." value={m.unidade} onChange={(e) => updateMaterial(m.id, { unidade: e.target.value })} className="col-span-2 px-2 py-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-[11px] font-bold dark:text-white outline-none" />
                  <input type="number" step="0.01" placeholder="R$ un." value={m.custoUnitario} onChange={(e) => updateMaterial(m.id, { custoUnitario: Number(e.target.value) })} className="col-span-2 px-2 py-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-[11px] font-bold dark:text-white outline-none" />
                  <button type="button" onClick={() => removeMaterial(m.id)} className="col-span-1 text-red-400 hover:text-red-600 flex justify-center"><Trash2 size={14} /></button>
                </div>
              ))}
              {materiais.length > 0 && (
                <p className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pr-2">Subtotal material: {formatMoeda(totalMateriais)}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Custo de mão de obra (R$, opcional)</label>
            <input type="number" step="0.01" value={custoMaoDeObra} onChange={(e) => setCustoMaoDeObra(Number(e.target.value))} className="w-full px-6 py-4 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all" />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Observações da resolução</label>
            <textarea rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full px-6 py-5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold dark:text-white outline-none focus:border-blue-500 transition-all resize-none" placeholder="O que foi feito..." />
          </div>

          {registro.dataInicioIndisponivel && !registro.dataFimIndisponivel && (
            <label className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border dark:border-emerald-800/30 cursor-pointer">
              <input type="checkbox" checked={liberarAmbiente} onChange={(e) => setLiberarAmbiente(e.target.checked)} className="w-4 h-4 accent-emerald-500" />
              <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Liberar ambiente agora (encerra a contagem de dias indisponível)</span>
            </label>
          )}

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancelar</button>
            <button type="submit" className="flex-[2] px-6 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Finalizar manutenção</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Modal: nova área comum ---

const NovaAreaComumModal: React.FC<{ onClose: () => void; onSaved: (ambiente: Ambiente) => void }> = ({ onClose, onSaved }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const novo = addCustomAmbiente({
      tipo: formData.get('tipo') as Exclude<AmbienteTipo, 'quarto'>,
      identificacao: formData.get('identificacao') as string,
      andar: Number(formData.get('andar')),
      referencia: (formData.get('referencia') as string) || undefined,
    });
    onSaved(novo);
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[4rem] w-full max-w-lg overflow-hidden shadow-2xl border dark:border-slate-800">
        <div className="p-10 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Nova área comum</h2>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tipo</label>
            <select name="tipo" required className="w-full px-5 py-4 bg-slate-900 text-white border-2 border-slate-800 rounded-2xl text-xs font-black outline-none">
              <option value="corredor">Corredor</option>
              <option value="area_comum">Área comum</option>
              <option value="elevador">Elevador</option>
              <option value="escada">Escada</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Identificação</label>
            <input name="identificacao" required placeholder='Ex: "Café / Coffee - 2º andar"' className="w-full px-6 py-4 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Andar</label>
              <input name="andar" type="number" required defaultValue={1} className="w-full px-6 py-4 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Referência</label>
              <input name="referencia" placeholder="Ex: próximo à escada" className="w-full px-6 py-4 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold dark:text-white outline-none focus:border-blue-500 transition-all" />
            </div>
          </div>
          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancelar</button>
            <button type="submit" className="flex-[2] px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Cadastrar ambiente</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AmbientesTab;
