
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wind, AlertCircle, CheckCircle2, MessageCircle, Calendar, 
  Search, Info, Sparkles, Thermometer, ArrowRight, Clock, ShieldAlert
} from 'lucide-react';
import { Room, RoomStatus, User, RoomHistory } from '../types';
import { DatabaseService } from '../database';
import { MOCK_ROOMS } from '../constants';
import { useToast } from '../context/ToastContext';

const ACManagement: React.FC<{ user: User }> = ({ user }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    // Carrega quartos e injeta datas fictícias de AC se não existirem
    const data = DatabaseService.getRooms(MOCK_ROOMS);
    const enrichedData = data.map(r => ({
      ...r,
      lastACCleaning: r.lastACCleaning || new Date(Date.now() - (Math.random() * 45 * 24 * 60 * 60 * 1000)).toISOString()
    }));
    setRooms(enrichedData);
  }, []);

  const evaluateACStatus = (lastCleaning: string) => {
    const last = new Date(lastCleaning);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // IA Simples: Score de 0 a 100 (Urgência)
    const urgencyScore = Math.min(Math.round((diffDays / 30) * 100), 100);
    
    let status: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    if (urgencyScore >= 90) status = 'CRITICAL';
    else if (urgencyScore >= 70) status = 'WARNING';

    return { diffDays, urgencyScore, status };
  };

  const handleCleanAC = async (roomId: number) => {
    const now = new Date();
    const updatedRooms = rooms.map(r => {
      if (r.id === roomId) {
        const historyEntry: RoomHistory = {
          date: `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          action: "❄️ LIMPEZA TÉCNICA DE AR CONDICIONADO CONCLUÍDA. Filtros higienizados e dreno verificado.",
          user: user.name,
          type: 'AC_CLEANING'
        };
        return { 
          ...r, 
          lastACCleaning: now.toISOString(),
          history: [historyEntry, ...(r.history || [])]
        };
      }
      return r;
    });
    setRooms(updatedRooms);
    await DatabaseService.saveRooms(updatedRooms);
    addToast(`Manutenção de Ar Condicionado registrada com sucesso!`, 'SUCCESS');
  };

  const handleSendWhatsAppList = () => {
    const criticalRooms = rooms
      .map(r => ({ ...r, evaluation: evaluateACStatus(r.lastACCleaning) }))
      .filter(r => r.evaluation.status !== 'NORMAL')
      .sort((a, b) => b.evaluation.urgencyScore - a.evaluation.urgencyScore);

    if (criticalRooms.length === 0) {
      addToast("Todos os aparelhos estão em dia. Nenhuma notificação necessária.", 'SUCCESS');
      return;
    }

    let message = `*❄️ LISTA DE MANUTENÇÃO: AR CONDICIONADO*\n`;
    message += `Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
    message += `Protocolo: Ciclo de 30 dias\n\n`;
    
    criticalRooms.forEach(r => {
      const emoji = r.evaluation.status === 'CRITICAL' ? '🔴' : '🟡';
      message += `${emoji} *QUARTO ${r.number}*\n`;
      message += `   • Última Limpeza: ${new Date(r.lastACCleaning).toLocaleDateString('pt-BR')}\n`;
      message += `   • Atraso: ${r.evaluation.diffDays} dias\n`;
      message += `   • IA Urgência: ${r.evaluation.urgencyScore}%\n\n`;
    });

    message += `_Favor realizar a higienização e reportar no sistema._`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    addToast("Lista de pendências enviada para o WhatsApp.", 'INFO');
  };

  const filteredRooms = rooms.filter(r => r.number.includes(searchTerm));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Climatização Inteligente</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
            <Thermometer size={16} className="text-blue-500" /> IA de Monitoramento de Filtros e Drenos
          </p>
        </div>
        <button 
          onClick={handleSendWhatsAppList}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center gap-3 active:scale-95 transition-all"
        >
          <MessageCircle size={18} /> Notificar Lista WhatsApp
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Painel de IA */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-blue-600 p-8 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="p-4 bg-white/20 rounded-2xl w-fit"><Sparkles size={28} /></div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">IA Araguaia</h3>
              <p className="text-sm font-bold text-blue-100 leading-relaxed uppercase tracking-wider">
                Nosso algoritmo avalia o tempo de saturação dos filtros. Unidades em <span className="text-white underline">vermelho</span> possuem alto risco de mau cheiro e ineficiência energética.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border dark:border-slate-800 shadow-sm">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Resumo de Saúde do Ar</h4>
             <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl">
                   <span className="text-xs font-black text-emerald-700 uppercase">Em Dia</span>
                   <span className="text-xl font-black text-emerald-700">{rooms.filter(r => evaluateACStatus(r.lastACCleaning).status === 'NORMAL').length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl">
                   <span className="text-xs font-black text-amber-700 uppercase">Atenção (3 semanas+)</span>
                   <span className="text-xl font-black text-amber-700">{rooms.filter(r => evaluateACStatus(r.lastACCleaning).status === 'WARNING').length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl">
                   <span className="text-xs font-black text-red-700 uppercase">Crítico (30 dias+)</span>
                   <span className="text-xl font-black text-red-700">{rooms.filter(r => evaluateACStatus(r.lastACCleaning).status === 'CRITICAL').length}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Lista de Quartos */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3.5rem] border dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Status por Unidade</h3>
             <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Buscar quarto..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-black rounded-xl text-xs font-black dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500"
               />
             </div>
          </div>

          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-y-auto scrollbar-hide">
            {filteredRooms.map(room => {
              const evalRes = evaluateACStatus(room.lastACCleaning);
              return (
                <div key={room.id} className={`p-6 rounded-[2.5rem] border-2 transition-all hover:shadow-xl ${
                  evalRes.status === 'CRITICAL' ? 'border-red-500/20 bg-red-50/10' :
                  evalRes.status === 'WARNING' ? 'border-amber-500/20 bg-amber-50/10' :
                  'border-slate-100 dark:border-slate-800 bg-slate-50/10'
                }`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                         evalRes.status === 'CRITICAL' ? 'bg-red-600' :
                         evalRes.status === 'WARNING' ? 'bg-amber-500' : 'bg-blue-600'
                       }`}>
                          <Wind size={24} />
                       </div>
                       <div>
                         <span className="text-xl font-black text-slate-900 dark:text-white block leading-none">Qto {room.number}</span>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">IA Score: {evalRes.urgencyScore}%</span>
                       </div>
                    </div>
                    {evalRes.status === 'CRITICAL' && <ShieldAlert className="text-red-600 animate-pulse" size={20} />}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                       <span className="text-slate-400">Última Limpeza</span>
                       <span className="text-slate-900 dark:text-white">{new Date(room.lastACCleaning).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase">
                       <span className="text-slate-400">Dias Corridos</span>
                       <span className={evalRes.status === 'CRITICAL' ? 'text-red-600' : 'text-slate-900 dark:text-white'}>{evalRes.diffDays} dias</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleCleanAC(room.id)}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-md"
                  >
                    Confirmar Higienização
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ACManagement;
