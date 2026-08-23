
import React, { useState } from 'react';
import { 
  Plus, Search, Filter, Clock, AlertCircle, Wrench, User as UserIcon, 
  MessageSquare, Info, ChevronRight, X 
} from 'lucide-react';
import { User, LogbookEntry } from '../types';
import { MOCK_LOGBOOK } from '../constants';

const Logbook: React.FC<{ user: User }> = ({ user }) => {
  const [entries, setEntries] = useState<LogbookEntry[]>(MOCK_LOGBOOK);
  const [newEntryText, setNewEntryText] = useState('');
  const [newEntryType, setNewEntryType] = useState<'INFO' | 'ALERT' | 'MAINTENANCE' | 'GUEST'>('INFO');
  const [filterTurn, setFilterTurn] = useState('Todos os turnos');

  const handleAddEntry = () => {
    if (!newEntryText.trim()) return;

    const newEntry: LogbookEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type: newEntryType,
      text: newEntryText,
      author: user.name,
      department: user.role === 'ADMIN' ? 'Administração' : 'Equipe',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      turn: 'Tarde (15h-23h)', // Mock current turn
      date: 'Hoje'
    };

    setEntries([newEntry, ...entries]);
    setNewEntryText('');
  };

  const getIcon = (type: LogbookEntry['type']) => {
    switch (type) {
      case 'ALERT': return <AlertCircle size={18} className="text-amber-500" />;
      case 'MAINTENANCE': return <Wrench size={18} className="text-slate-500" />;
      case 'GUEST': return <UserIcon size={18} className="text-green-500" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  const getTypeLabel = (type: LogbookEntry['type']) => {
    switch (type) {
      case 'ALERT': return 'Alerta';
      case 'MAINTENANCE': return 'Manutenção';
      case 'GUEST': return 'Hóspede';
      default: return 'Informação';
    }
  };

  const getTypeBadgeColor = (type: LogbookEntry['type']) => {
    switch (type) {
      case 'ALERT': return 'bg-amber-100 text-amber-700';
      case 'MAINTENANCE': return 'bg-slate-100 text-slate-700';
      case 'GUEST': return 'bg-green-100 text-green-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Logbook Digital</h1>
          <p className="text-slate-500">Registro de ocorrências e comunicação entre turnos.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
          <Clock size={14} /> Turno atual: Tarde (15h-23h)
        </div>
      </div>

      {/* New Entry Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
          <MessageSquare size={18} />
          <span>Nova Ocorrência</span>
        </div>
        <textarea 
          value={newEntryText}
          onChange={(e) => setNewEntryText(e.target.value)}
          placeholder="Registre uma ocorrência, comunicado ou informação importante para os próximos turnos..."
          className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <select 
            value={newEntryType}
            onChange={(e) => setNewEntryType(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="INFO">Informação</option>
            <option value="ALERT">Alerta</option>
            <option value="MAINTENANCE">Manutenção</option>
            <option value="GUEST">Hóspede</option>
          </select>
          <button 
            onClick={handleAddEntry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
          >
            <Plus size={18} /> Registrar
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select 
            value={filterTurn}
            onChange={(e) => setFilterTurn(e.target.value)}
            className="pl-9 pr-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          >
            <option>Todos os turnos</option>
            <option>Manhã (07h-15h)</option>
            <option>Tarde (15h-23h)</option>
            <option>Noite (23h-07h)</option>
          </select>
        </div>
      </div>

      {/* Entry List */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex gap-4 hover:shadow-md transition-all group">
            <div className={`p-3 rounded-xl h-fit ${getTypeBadgeColor(entry.type).split(' ')[0]}`}>
              {getIcon(entry.type)}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${getTypeBadgeColor(entry.type)}`}>
                  {getTypeLabel(entry.type)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.turn}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{entry.text}</p>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><UserIcon size={12} /> {entry.author} • {entry.department}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {entry.time}</span>
                {entry.date !== 'Hoje' && (
                  <>
                    <span>•</span>
                    <span>{entry.date}</span>
                  </>
                )}
              </div>
            </div>
            <button className="text-slate-300 hover:text-slate-500 transition-colors self-center">
              <MoreHorizontal size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const MoreHorizontal = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
  </svg>
);

export default Logbook;
