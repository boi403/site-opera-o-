
import React, { useState } from 'react';
import { 
  Key, 
  History, 
  Plus, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface AccessCode {
  id: string;
  code: string;
  label: string;
  createdAt: string;
}

interface EntryLog {
  id: string;
  timestamp: string;
  codeUsed: string;
  label: string;
  status: 'success' | 'failure';
}

interface AccessManagementProps {
  accessCodes: AccessCode[];
  onAddCode: (label: string) => void;
  onRemoveCode: (id: string) => void;
  history: EntryLog[];
}

const AccessManagement: React.FC<AccessManagementProps> = ({ 
  accessCodes, 
  onAddCode, 
  onRemoveCode, 
  history 
}) => {
  const [newLabel, setNewLabel] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    onAddCode(newLabel);
    setNewLabel('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Esquerdo: Gestão de Códigos */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#002D44] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-[#FFD700] p-2.5 rounded-xl">
                <Key className="w-5 h-5 text-[#002D44]" />
              </div>
              <h3 className="text-xl font-bold text-white serif">Gerar Novo Acesso</h3>
            </div>

            <form onSubmit={generateCode} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Identificação (Nome/Setor)</label>
                <input 
                  type="text" 
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Ex: Recepção Noturna"
                  className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white outline-none focus:border-[#FFD700] transition-all"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#E31B23] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#c4161d] transition-all shadow-lg shadow-[#E31B23]/20"
              >
                <Plus className="w-4 h-4" /> Gerar Código Único
              </button>
            </form>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <h4 className="text-[#002D44] font-black text-xs uppercase tracking-[0.2em] border-b border-slate-100 pb-4">Códigos Ativos</h4>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {accessCodes.map((item) => (
                <div key={item.id} className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#FFD700]/30 transition-all">
                  <div>
                    <p className="font-bold text-[#002D44] text-sm">{item.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">
                        {item.code}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleCopy(item.code, item.id)}
                      className={`p-2 rounded-xl transition-all ${copiedId === item.id ? 'bg-green-100 text-green-600' : 'hover:bg-slate-200 text-slate-400'}`}
                    >
                      {copiedId === item.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => onRemoveCode(item.id)}
                      className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lado Direito: Histórico de Entradas */}
        <div className="lg:col-span-7 bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-slate-50">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="bg-[#002D44] p-3 rounded-2xl">
                <History className="w-6 h-6 text-[#FFD700]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#002D44] serif">Histórico de Entradas</h3>
                <p className="text-slate-400 text-xs font-medium">Auditoria de acessos ao portal administrativo</p>
              </div>
            </div>
            <div className="bg-slate-100 px-4 py-2 rounded-xl flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#002D44]" />
              <span className="text-[10px] font-black text-[#002D44] uppercase">Tempo Real</span>
            </div>
          </div>

          <div className="space-y-6">
            {history.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <RefreshCw className="w-12 h-12 text-slate-200 mx-auto animate-spin-slow" />
                <p className="text-slate-400 text-sm italic">Nenhum acesso registrado até o momento.</p>
              </div>
            ) : (
              <div className="relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-100">
                {history.map((log, idx) => (
                  <div key={log.id} className="relative pl-12 pb-8 group">
                    <div className={`absolute left-2.5 top-0 w-5 h-5 rounded-full border-4 border-white shadow-md z-10 transition-all ${
                      log.status === 'success' ? 'bg-green-500 group-hover:scale-125' : 'bg-red-500 group-hover:scale-125'
                    }`}></div>
                    
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group-hover:bg-white group-hover:shadow-xl transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                             }`}>
                                {log.status === 'success' ? 'Acesso Concedido' : 'Falha no Acesso'}
                             </span>
                             <span className="text-[10px] text-slate-400 font-bold">{log.timestamp}</span>
                          </div>
                          <h5 className="font-bold text-[#002D44]">
                             {log.status === 'success' ? `Login via ${log.label}` : 'Tentativa de Login Inválida'}
                          </h5>
                          <p className="text-xs text-slate-500 font-mono">Código utilizado: {log.codeUsed}</p>
                        </div>
                        
                        {log.status === 'success' ? (
                          <ShieldCheck className="w-8 h-8 text-green-200 group-hover:text-green-500 transition-colors" />
                        ) : (
                          <AlertTriangle className="w-8 h-8 text-red-200 group-hover:text-red-500 transition-colors" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AccessManagement;
