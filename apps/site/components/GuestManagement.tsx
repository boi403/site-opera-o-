
import React, { useState } from 'react';
import { 
  Wifi, 
  Signal, 
  Users, 
  Key, 
  Monitor, 
  Download, 
  Trash2, 
  RefreshCw, 
  Printer, 
  AlertCircle, 
  Loader2, 
  CheckCircle 
} from 'lucide-react';

const GuestManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'vouchers'>('active');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const activeUsers = [
    { name: "João Silva", room: "204", ip: "192.168.88.231", mac: "00:25:96:FF:FE:12", uptime: "2h 15m", signal: 92 },
    { name: "Maria Oliveira", room: "105", ip: "192.168.88.240", mac: "B4:F1:DA:88:CC:11", uptime: "14h 02m", signal: 78 },
    { name: "Suíte Presidencial", room: "401", ip: "192.168.88.10", mac: "DC:A6:32:01:AF:90", uptime: "4d 12h", signal: 100 },
  ];

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    
    // Simula uma chamada de API ao MikroTik
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSyncing(false);
    setSyncSuccess(true);
    
    // Esconde a mensagem de sucesso após 4 segundos
    setTimeout(() => setSyncSuccess(false), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-up">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#002D44] border border-white/10 p-6 rounded-3xl text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <Signal className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-[10px] font-black uppercase text-green-500">MikroTik Online</span>
          </div>
          <p className="text-3xl font-black mb-1">42</p>
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Dispositivos Ativos</p>
        </div>

        <div className="bg-[#002D44] border border-white/10 p-6 rounded-3xl text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Download className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-[10px] font-black uppercase text-blue-500">Peak Load</span>
          </div>
          <p className="text-3xl font-black mb-1">84<span className="text-sm font-medium opacity-50 ml-1">Mbps</span></p>
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Consumo Atual</p>
        </div>

        <div className="bg-[#002D44] border border-white/10 p-6 rounded-3xl text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-[#FFD700]/20 p-2 rounded-lg">
              <Users className="w-6 h-6 text-[#FFD700]" />
            </div>
          </div>
          <p className="text-3xl font-black mb-1">12</p>
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Check-ins Hoje</p>
        </div>

        <div className="bg-[#E31B23] p-6 rounded-3xl text-white shadow-lg shadow-[#E31B23]/20">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-black mb-1">02</p>
          <p className="text-white/80 text-[10px] uppercase font-bold tracking-widest">Alertas de Rede</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
        {/* Toolbar Superior */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex bg-slate-200 p-1 rounded-2xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('active')}
              className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-white text-[#002D44] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Monitoramento Ativo
            </button>
            <button 
              onClick={() => setActiveTab('vouchers')}
              className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'vouchers' ? 'bg-white text-[#002D44] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Gerar Vouchers
            </button>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {syncSuccess && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-100 animate-fade-up">
                <CheckCircle className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">Sincronizado</span>
              </div>
            )}
            
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className={`flex-1 md:flex-none bg-[#002D44] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#003d5c] transition-all relative ${isSyncing ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Sincronizar MikroTik
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-8 flex-grow">
          {activeTab === 'active' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hóspede / Quarto</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Informações de Rede</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempo de Conexão</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeUsers.map((user, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-[#002D44]/5 w-10 h-10 rounded-full flex items-center justify-center text-[#002D44] font-black">
                            {user.room}
                          </div>
                          <div>
                            <p className="font-bold text-[#002D44]">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Suíte Luxo</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6">
                        <div className="space-y-1">
                          <p className="text-xs font-mono text-slate-600 font-bold">{user.ip}</p>
                          <p className="text-[9px] font-mono text-slate-400">{user.mac}</p>
                          <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-green-500" style={{ width: `${user.signal}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-6">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Monitor className="w-4 h-4" />
                          <span className="text-sm font-medium">{user.uptime}</span>
                        </div>
                      </td>
                      <td className="py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Desconectar Hóspede">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="max-w-xl mx-auto py-12 space-y-8 animate-fade-up">
              <div className="text-center">
                <div className="bg-[#FFD700]/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <Key className="w-10 h-10 text-[#FFD700]" />
                </div>
                <h3 className="text-2xl font-bold text-[#002D44] serif">Novo Acesso Hotspot</h3>
                <p className="text-slate-500 text-sm">Gere um código exclusivo para o hóspede acessar o Wi-Fi.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número do Quarto</label>
                  <input type="text" placeholder="Ex: 204" className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#002D44]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duração da Estadia (Dias)</label>
                  <input type="number" defaultValue="1" className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#002D44]" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Limite de Dispositivos</label>
                  <select className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#002D44]">
                    <option>02 Dispositivos (Padrão)</option>
                    <option>05 Dispositivos (Família)</option>
                    <option>Ilimitado (Executivo)</option>
                  </select>
                </div>
              </div>

              <button className="w-full bg-[#E31B23] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#c4161d] transition-all flex items-center justify-center gap-3">
                <Printer className="w-5 h-5" />
                Gerar e Imprimir Voucher
              </button>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  <strong>Integração MikroTik API:</strong> O sistema gerará automaticamente um usuário no profile <code>hospede_standard</code> com validade de acordo com a estadia informada.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestManagement;
