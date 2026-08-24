
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bed, CheckCircle2, Search, LayoutGrid, LayoutList, User as UserIcon,
  Wrench, ClipboardCheck, Star, X, History, Eye, Clock, ShieldCheck,
  Layers, LogOut, Check, Play, UserPlus, ChevronRight, Wind, Sparkles,
  Filter, Calendar, Activity, Info, Settings, AlertTriangle
} from 'lucide-react';
import { Room, RoomStatus, User, UserRole, RoomHistory } from '../types';
import { MOCK_ROOMS } from '../constants';
import { useToast } from '../context/ToastContext';
import { ambienteIdParaQuarto, getAlertasRecorrencia, ambienteTemPendencia, ambienteTemAlerta, subscribeRegistros } from '../lib/manutencao';
import { subscribeRooms, saveRoom, seedRoomsIfEmpty } from '../lib/firestoreData';
import type { ManutencaoRegistro } from '../types';

const Rooms: React.FC<{ user: User }> = ({ user }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filter, setFilter] = useState<RoomStatus | 'ALL'>('ALL');
  const [floorFilter, setFloorFilter] = useState<number | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'GRID' | 'LIST'>('GRID');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [historyTypeFilter, setHistoryTypeFilter] = useState<RoomHistory['type'] | 'ALL'>('ALL');
  const [registros, setRegistros] = useState<ManutencaoRegistro[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    seedRoomsIfEmpty(MOCK_ROOMS).catch(() => {});
    const unsubscribe = subscribeRooms(setRooms);
    return unsubscribe;
  }, []);

  useEffect(() => {
    return subscribeRegistros(setRegistros);
  }, []);

  const manutencaoAlerta = useMemo(() => {
    const alertas = getAlertasRecorrencia(registros);
    const porQuarto = new Map<number, boolean>();
    rooms.forEach((r) => {
      const ambienteId = ambienteIdParaQuarto(r.id);
      porQuarto.set(r.id, ambienteTemPendencia(registros, ambienteId) || ambienteTemAlerta(alertas, ambienteId));
    });
    return porQuarto;
  }, [rooms, registros]);

  const updateRoomStatus = async (roomId: number, newStatus: RoomStatus) => {
    if (newStatus === RoomStatus.RELEASED && user.role !== UserRole.ADMIN && user.role !== UserRole.GOVERNANCE) {
        addToast("Apenas Governança ou Admin podem liberar o quarto para uso.", 'WARNING');
        return;
    }

    const updatedRooms = rooms.map(r => {
      if (r.id === roomId) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR');
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        let logType: RoomHistory['type'] = 'SYSTEM';
        let actionMsg = `Status alterado manualmente para: ${newStatus}`;

        if (newStatus === RoomStatus.RELEASED) { logType = 'INSPECTION'; actionMsg = `Unidade Vistoriada e Liberada para check-in.`; }
        else if (newStatus === RoomStatus.MAINTENANCE) { logType = 'MAINTENANCE'; actionMsg = `Bloqueado para Manutenção Técnica.`; }
        else if (newStatus === RoomStatus.CLEANING) { logType = 'CLEANING'; actionMsg = `Início de higienização de rotina.`; }
        else if (newStatus === RoomStatus.INSPECTION) { logType = 'CLEANING'; actionMsg = `Limpeza concluída. Aguardando conferência da governança.`; }

        const historyEntry: RoomHistory = { 
          date: `${dateStr} ${timeStr}`, 
          action: actionMsg, 
          user: user.name, 
          type: logType 
        };
        return { ...r, status: newStatus, history: [historyEntry, ...(r.history || [])] };
      }
      return r;
    });

    setRooms(updatedRooms);
    const changedRoom = updatedRooms.find(r => r.id === roomId);
    if (changedRoom) await saveRoom(changedRoom);
    if (selectedRoom?.id === roomId) {
      setSelectedRoom(changedRoom || null);
    }
    
    // Feedback visual
    const roomNum = updatedRooms.find(r => r.id === roomId)?.number;
    if (newStatus === RoomStatus.RELEASED) {
      addToast(`Quarto ${roomNum} liberado com sucesso!`, 'SUCCESS');
    } else {
      addToast(`Status do Quarto ${roomNum} atualizado para ${newStatus}`, 'INFO');
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesStatus = filter === 'ALL' || room.status === filter;
    const matchesFloor = floorFilter === 'ALL' || room.floor === floorFilter;
    const matchesSearch = room.number.includes(searchTerm) || room.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesFloor && matchesSearch;
  });

  const getHistoryIcon = (type: string) => {
    switch(type) {
      case 'CLEANING': return <Sparkles size={16} className="text-emerald-500" />;
      case 'MAINTENANCE': return <Wrench size={16} className="text-orange-500" />;
      case 'INSPECTION': return <ShieldCheck size={16} className="text-purple-500" />;
      case 'AC_CLEANING': return <Wind size={16} className="text-blue-500" />;
      default: return <Activity size={16} className="text-slate-400" />;
    }
  };

  const getHistoryBg = (type: string) => {
    switch(type) {
      case 'CLEANING': return 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30';
      case 'MAINTENANCE': return 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800/30';
      case 'INSPECTION': return 'bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800/30';
      case 'AC_CLEANING': return 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30';
      default: return 'bg-slate-50 dark:bg-black/20 border-slate-100 dark:border-slate-800';
    }
  };

  const filteredHistory = useMemo(() => {
    if (!selectedRoom) return [];
    if (historyTypeFilter === 'ALL') return selectedRoom.history || [];
    return (selectedRoom.history || []).filter(h => h.type === historyTypeFilter);
  }, [selectedRoom, historyTypeFilter]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatMiniCard label="Liberados" value={rooms.filter(r => r.status === RoomStatus.RELEASED).length.toString()} color="bg-emerald-50 text-emerald-600" icon={<Bed size={18} />} />
        <StatMiniCard label="Vistoria" value={rooms.filter(r => r.status === RoomStatus.INSPECTION).length.toString()} color="bg-purple-50 text-purple-600" icon={<ClipboardCheck size={18} />} />
        <StatMiniCard label="Ocupados" value={rooms.filter(r => r.status === RoomStatus.OCCUPIED).length.toString()} color="bg-blue-50 text-blue-600" icon={<UserIcon size={18} />} />
        <StatMiniCard label="Alerta" value={rooms.filter(r => r.status === RoomStatus.MAINTENANCE || r.status === RoomStatus.BLOCKED).length.toString()} color="bg-red-50 text-red-600" icon={<Wrench size={18} />} />
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border dark:border-slate-800 shadow-sm space-y-8">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">Gestão de Unidades</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredRooms.length} quartos filtrados</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border dark:border-slate-800 shadow-inner">
              <button onClick={() => setFloorFilter('ALL')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${floorFilter === 'ALL' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>Tudo</button>
              {[1, 2, 3].map(f => <button key={f} onClick={() => setFloorFilter(f)} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${floorFilter === f ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>{f}º</button>)}
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Buscar unidade ou categoria..." className="w-full pl-12 pr-5 py-3.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-xs font-black dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredRooms.map(room => (
            <RoomCardDetailed
              key={room.id}
              room={room}
              userRole={user.role}
              onUpdate={updateRoomStatus}
              onClick={() => { setSelectedRoom(room); setHistoryTypeFilter('ALL'); }}
              alertaManutencao={manutencaoAlerta.get(room.id) || false}
            />
          ))}
        </div>
      </div>

      {/* Modal Detalhado com Timeline de Histórico */}
      {selectedRoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-4xl overflow-hidden shadow-2xl border dark:border-slate-800 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-10 border-b dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50 dark:bg-black/20">
              <div className="flex gap-6 items-center">
                <div className={`w-24 h-24 ${getStatusStyles(selectedRoom.status).bg} text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl transform -rotate-3`}>
                  <Bed size={48} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Unidade {selectedRoom.number}</h2>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] ${getStatusStyles(selectedRoom.status).bg} text-white shadow-sm`}>
                      {selectedRoom.status}
                    </span>
                  </div>
                  <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Layers size={14} /> {selectedRoom.category} • Piso {selectedRoom.floor}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRoom(null)} 
                className="p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-2xl text-slate-400 transition-all shadow-sm"
              >
                <X size={28} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Sidebar do Modal: Info Geral */}
              <div className="lg:w-1/3 p-10 border-r dark:border-slate-800 bg-slate-50/30 dark:bg-black/10 space-y-8 overflow-y-auto scrollbar-hide">
                <div className="space-y-6">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Info size={14} className="text-blue-500" /> Informações do Ativo
                   </h3>
                   <div className="space-y-4">
                      <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-sm">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Responsável Atual</p>
                         <p className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">{selectedRoom.responsible || 'Ninguém designado'}</p>
                      </div>
                      <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-sm">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Hóspede Designado</p>
                         <p className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">{selectedRoom.guestName || 'Quarto Vago'}</p>
                      </div>
                      <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-sm">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Última Higienização</p>
                         <p className="text-sm font-black text-slate-900 dark:text-white">{new Date(selectedRoom.lastCleaning).toLocaleDateString('pt-BR')} {new Date(selectedRoom.lastCleaning).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Settings size={14} className="text-blue-500" /> Ações Rápidas
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => updateRoomStatus(selectedRoom.id, RoomStatus.MAINTENANCE)}
                      className="w-full py-4 px-6 bg-white dark:bg-slate-900 border dark:border-slate-800 text-[10px] font-black text-orange-600 uppercase tracking-widest rounded-2xl hover:bg-orange-50 transition-all flex items-center justify-between"
                    >
                      Solicitar Reparo <Wrench size={16} />
                    </button>
                    {selectedRoom.status === RoomStatus.INSPECTION && (
                      <button 
                        onClick={() => updateRoomStatus(selectedRoom.id, RoomStatus.RELEASED)}
                        className="w-full py-4 px-6 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-between"
                      >
                        Aprovar e Liberar <Check size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Histórico Centralizado */}
              <div className="flex-1 p-10 overflow-y-auto scrollbar-hide space-y-8 bg-white dark:bg-slate-900">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b dark:border-slate-800 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20">
                       <History size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Timeline de Auditoria</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rastro digital completo da unidade</p>
                    </div>
                  </div>

                  {/* Filtro de Histórico */}
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-black/30 p-1.5 rounded-2xl border dark:border-slate-800">
                    <Filter size={14} className="text-slate-400 ml-3 mr-1" />
                    {(['ALL', 'CLEANING', 'MAINTENANCE', 'INSPECTION'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setHistoryTypeFilter(type)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                          historyTypeFilter === type 
                            ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {type === 'ALL' ? 'Tudo' : type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative pl-12 space-y-8 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                  {filteredHistory.length > 0 ? filteredHistory.map((h, i) => (
                    <div key={i} className="relative group animate-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                      {/* Timeline Dot & Icon */}
                      <div className={`absolute -left-12 top-0 w-10 h-10 rounded-2xl border-[4px] border-white dark:border-slate-900 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                        h.type === 'CLEANING' ? 'bg-emerald-500' : 
                        h.type === 'MAINTENANCE' ? 'bg-orange-500' : 
                        h.type === 'INSPECTION' ? 'bg-purple-600' : 
                        h.type === 'AC_CLEANING' ? 'bg-blue-600' : 'bg-slate-600'
                      }`}>
                        {getHistoryIcon(h.type)}
                      </div>

                      <div className={`p-6 rounded-[2rem] border-2 transition-all group-hover:shadow-xl ${getHistoryBg(h.type)} shadow-sm`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                          <div className="flex items-center gap-3">
                             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <Calendar size={12} /> {h.date.split(' ')[0]}
                             </span>
                             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <Clock size={12} /> {h.date.split(' ')[1]}
                             </span>
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] bg-white/50 dark:bg-black/50 border dark:border-slate-700/50`}>
                            {h.type}
                          </span>
                        </div>
                        
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed mb-6">
                          {h.action}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-700 flex items-center justify-center shadow-sm">
                                 <UserIcon size={14} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Operador Responsável</p>
                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{h.user}</p>
                              </div>
                           </div>
                           <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center space-y-4">
                       <History size={64} className="mx-auto text-slate-100 dark:text-slate-800" />
                       <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Nenhum registro encontrado para este filtro.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatMiniCard: React.FC<{ label: string; value: string; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border dark:border-slate-800 shadow-sm flex items-center gap-5 hover:scale-[1.02] transition-all hover:shadow-xl group">
    <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{value}</p>
    </div>
  </div>
);

const RoomCardDetailed: React.FC<{ room: Room; userRole: UserRole; onUpdate: (roomId: number, newStatus: RoomStatus) => void; onClick: () => void; alertaManutencao?: boolean; }> = ({ room, userRole, onUpdate, onClick, alertaManutencao }) => {
  const config = getStatusStyles(room.status);
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border-2 ${config.borderColor} rounded-[3rem] p-6 space-y-6 transition-all hover:shadow-2xl cursor-pointer flex flex-col justify-between h-full group relative overflow-hidden`}
    >
      {alertaManutencao && (
        <div title="Manutenção pendente ou recorrente" className="absolute top-5 left-5 z-10 w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 animate-pulse">
          <AlertTriangle size={16} className="text-white" />
        </div>
      )}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:-rotate-6 ${config.bg}`}>
              <Bed size={28} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block mb-1">#{room.number}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{room.category}</span>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full animate-pulse ${config.dot}`} />
        </div>
        
        <div className="space-y-3 bg-slate-50 dark:bg-black/30 p-5 rounded-[2rem] border dark:border-slate-800 shadow-inner">
           <div className="flex items-center justify-between">
             <p className={`text-[10px] font-black uppercase tracking-widest ${config.text}`}>{room.status}</p>
             <p className="text-[9px] font-black text-slate-400 uppercase">{room.floor}º Piso</p>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 dark:border-slate-700">
                <UserIcon size={12} />
              </div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase truncate">{room.responsible || 'Sem responsável'}</p>
           </div>
        </div>
      </div>

      <div className="pt-2">
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            const nextStatus = room.status === RoomStatus.RELEASED ? RoomStatus.OCCUPIED : RoomStatus.RELEASED;
            onUpdate(room.id, nextStatus); 
          }} 
          className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-95 shadow-lg active:opacity-80"
        >
          {room.status === RoomStatus.RELEASED ? 'Check-in' : 'Liberar Unidade'}
        </button>
      </div>
      
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
    </div>
  );
};

const getStatusStyles = (status: RoomStatus) => {
  switch (status) {
    case RoomStatus.RELEASED: return { borderColor: 'border-emerald-500/10', bg: 'bg-emerald-500', text: 'text-emerald-500', dot: 'bg-emerald-500' };
    case RoomStatus.CLEANING: return { borderColor: 'border-amber-500/10', bg: 'bg-amber-500', text: 'text-amber-500', dot: 'bg-amber-500' };
    case RoomStatus.INSPECTION: return { borderColor: 'border-purple-500/10', bg: 'bg-purple-600', text: 'text-purple-600', dot: 'bg-purple-600' };
    case RoomStatus.OCCUPIED: return { borderColor: 'border-blue-600/10', bg: 'bg-blue-600', text: 'text-blue-600', dot: 'bg-blue-600' };
    case RoomStatus.MAINTENANCE: return { borderColor: 'border-orange-500/10', bg: 'bg-orange-600', text: 'text-orange-600', dot: 'bg-orange-600' };
    default: return { borderColor: 'border-slate-200/10', bg: 'bg-slate-400', text: 'text-slate-500', dot: 'bg-slate-400' };
  }
};

export default Rooms;
