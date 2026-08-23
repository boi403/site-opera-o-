
import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, CheckCircle, Bed, 
  Trophy, User as UserIcon, Clock, ChevronDown, Loader2,
  ListChecks, History as HistoryIcon, Sparkles, ClipboardCheck,
  ShieldCheck, ArrowRight, Save
} from 'lucide-react';
import { User, Room, RoomStatus, RoomHistory } from '../types';
import { MOCK_ROOMS, CHECKLIST_ITEMS } from '../constants';
import { DatabaseService } from '../database';
import { useToast } from '../context/ToastContext';

const Housekeeping: React.FC<{ user: User }> = ({ user }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>('');
  const [isFinishing, setIsFinishing] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>(
    CHECKLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item]: false }), {})
  );
  const { addToast } = useToast();

  useEffect(() => {
    const roomsData = DatabaseService.getRooms(MOCK_ROOMS);
    setRooms(roomsData);
    if (roomsData.length > 0) {
      const prioritizedRoom = roomsData.find((r: Room) => r.status === RoomStatus.DIRTY || r.status === RoomStatus.CLEANING);
      setSelectedRoomNumber(prioritizedRoom ? prioritizedRoom.number : roomsData[0].number);
    }
  }, []);

  const handleToggle = (item: string) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const progress = (completedCount / CHECKLIST_ITEMS.length) * 100;

  const handleFinish = async () => {
    if (completedCount < CHECKLIST_ITEMS.length) {
      addToast("Padrão de Qualidade: Complete todos os itens do checklist para prosseguir.", 'WARNING');
      return;
    }

    setIsFinishing(true);

    // Simulação de processamento
    setTimeout(async () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR');
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      const completedItemsStr = CHECKLIST_ITEMS
        .filter(item => checklist[item])
        .map(item => `[✓] ${item}`)
        .join('\n');

      const detailedAction = `✨ HIGIENIZAÇÃO CONCLUÍDA (PADRÃO OURO)\n` +
                             `Responsável: ${user.name}\n` +
                             `Data: ${dateStr} - Horário: ${timeStr}\n` +
                             `-------------------------------\n` +
                             `ITENS CONCLUÍDOS:\n${completedItemsStr}`;

      const newHistoryEntry: RoomHistory = {
        date: `${dateStr} ${timeStr}`,
        action: detailedAction,
        user: user.name,
        type: 'CLEANING'
      };

      const updatedRooms = rooms.map(room => {
        if (room.number === selectedRoomNumber) {
          return {
            ...room,
            status: RoomStatus.INSPECTION, 
            lastCleaning: now.toISOString(),
            responsible: user.name,
            history: [newHistoryEntry, ...(room.history || [])]
          };
        }
        return room;
      });

      setRooms(updatedRooms);
      await DatabaseService.saveRooms(updatedRooms);
      
      // Resetar estado local
      setChecklist(CHECKLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item]: false }), {}));
      setIsFinishing(false);
      
      addToast(`Quarto ${selectedRoomNumber} enviado para Vistoria da Governança!`, 'SUCCESS');
    }, 1500);
  };

  const myRecentLogs = rooms
    .flatMap(r => (r.history || []).map(h => ({ ...h, room: r.number })))
    .filter(h => h.type === 'CLEANING' && h.user === user.name)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-700">
      <div className="lg:col-span-8 space-y-6">
        
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col md:flex-row items-center justify-between overflow-hidden relative border border-white/5">
          <div className="relative z-10 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <Sparkles className="text-blue-400" size={20} />
              <p className="text-[10px] text-blue-300 font-black uppercase tracking-[0.3em]">Protocolo de Excelência</p>
            </div>
            <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">{user.name}</h2>
            <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Posto de Trabalho: {user.role}</p>
          </div>
          
          <div className="mt-6 md:mt-0 px-8 py-5 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 text-center z-10">
             <div className="flex items-center gap-3 justify-center">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <p className="text-sm font-black uppercase tracking-widest">Sessão Ativa</p>
             </div>
          </div>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px]" />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border dark:border-slate-800 shadow-sm p-10 space-y-10 transition-all duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-500/20">
                <ListChecks size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Checklist da Unidade</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registro Obrigatório de Tarefas</p>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Quarto em Manuseio:</label>
              <select 
                value={selectedRoomNumber} 
                onChange={(e) => setSelectedRoomNumber(e.target.value)} 
                className="bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-base font-black dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer shadow-inner appearance-none"
              >
                  {rooms.map(r => (
                    <option key={r.id} value={r.number} className="bg-slate-900">
                      QUARTO {r.number} ({r.status})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-black/40 p-10 rounded-[2.5rem] border dark:border-slate-800 shadow-inner relative overflow-hidden">
             <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-600 text-white rounded-lg shadow-lg">
                    <ShieldCheck size={16} />
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Nível de Higiene Alcançado</span>
               </div>
               <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                 {Math.round(progress)}%
               </span>
             </div>
             <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
               <div 
                 className="h-full bg-gradient-to-r from-blue-600 to-emerald-400 transition-all duration-700 ease-out shadow-lg relative" 
                 style={{ width: `${progress}%` }}
               >
                 <div className="absolute inset-0 bg-white/20 animate-pulse" />
               </div>
             </div>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-6 text-center">
               {completedCount} de {CHECKLIST_ITEMS.length} tarefas certificadas
             </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CHECKLIST_ITEMS.map((item, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleToggle(item)} 
                  className={`flex items-center gap-5 p-6 rounded-[2rem] border-2 text-left transition-all active:scale-[0.98] relative group ${
                    checklist[item] 
                      ? 'bg-emerald-50 border-emerald-500/30 text-emerald-800 dark:bg-emerald-900/10 dark:border-emerald-500/40 dark:text-emerald-400 shadow-lg' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-500 hover:border-blue-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-[1.25rem] shrink-0 flex items-center justify-center transition-all ${
                    checklist[item] 
                      ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 rotate-6' 
                      : 'bg-slate-100 dark:bg-slate-800 group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-slate-800'
                  }`}>
                    {checklist[item] ? <CheckCircle size={24} /> : <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />}
                  </div>
                  <span className="text-xs font-black uppercase tracking-tight">{item}</span>
                  {checklist[item] && (
                    <div className="absolute top-3 right-4 text-emerald-500/40">
                      <Sparkles size={14} />
                    </div>
                  )}
                </button>
              ))}
          </div>

          <button 
            onClick={handleFinish} 
            disabled={isFinishing || completedCount < CHECKLIST_ITEMS.length}
            className={`w-full py-8 rounded-[2.5rem] flex items-center justify-center gap-5 font-black text-lg uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 ${
              completedCount === CHECKLIST_ITEMS.length 
                ? 'bg-slate-900 text-white hover:bg-black shadow-blue-500/10' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed border-2 border-dashed border-slate-200 dark:border-slate-800'
            }`}
          >
            {isFinishing ? (
              <><Loader2 className="animate-spin" size={28} /> Sincronizando Log...</>
            ) : (
              <><Save size={28} /> Finalizar & Registrar Log</>
            )}
          </button>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
               <HistoryIcon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Log de Auditoria</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meus últimos registros</p>
            </div>
          </div>

          <div className="space-y-4">
            {myRecentLogs.length > 0 ? myRecentLogs.map((log, i) => (
              <div key={i} className="bg-slate-50 dark:bg-black/30 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 group hover:border-blue-500/20 transition-all cursor-default relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center font-black text-blue-600 shadow-sm">
                       {log.room}
                     </div>
                     <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Certificado</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400">{log.date.split(' ')[1]}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 line-clamp-2">
                    {log.action.split('\n')[0]}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{log.date.split(' ')[0]}</span>
                  <ArrowRight size={14} className="text-blue-500" />
                </div>
              </div>
            )) : (
              <div className="py-20 text-center bg-slate-50 dark:bg-black/20 rounded-[2.5rem] border-2 border-dashed dark:border-slate-800">
                 <Trophy size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4 opacity-30" />
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-6 leading-relaxed">Nenhum registro encontrado para este turno.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
           <div className="relative z-10 space-y-4">
              <div className="p-3 bg-white/20 rounded-2xl w-fit">
                 <ClipboardCheck size={24} />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tighter leading-tight">Segurança dos Dados</h4>
              <p className="text-[11px] font-bold text-blue-100 leading-relaxed uppercase tracking-wider">
                Cada checklist finalizado gera uma assinatura digital irrevogável com seu nome e horário. Mantenha os padrões de qualidade.
              </p>
           </div>
           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};

export default Housekeeping;
