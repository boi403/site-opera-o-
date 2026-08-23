
import React, { useState } from 'react';
import { Save, Globe, DollarSign, ShieldAlert, Bell, Image as ImageIcon, Plus, Trash2, Dog, Clock, Info } from 'lucide-react';

const HotelSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geral' | 'tarifas' | 'politicas' | 'conteudo'>('geral');
  const [petFriendly, setPetFriendly] = useState(true);

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Globe },
    { id: 'tarifas', label: 'Tarifas & Reservas', icon: DollarSign },
    { id: 'politicas', label: 'Políticas & Pets', icon: ShieldAlert },
    { id: 'conteudo', label: 'Conteúdo Site', icon: ImageIcon },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-up">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[750px] flex flex-col md:flex-row">
        
        {/* Sidebar de Navegação Interna */}
        <div className="w-full md:w-72 bg-slate-50 border-r border-slate-100 p-8 space-y-2">
          <div className="mb-10">
            <h3 className="text-[#002D44] font-black text-xs uppercase tracking-[0.2em] mb-2">Painel de Ajustes</h3>
            <p className="text-slate-400 text-[10px] font-medium leading-tight">Configure as diretrizes operacionais do hotel.</p>
          </div>
          
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
                activeTab === tab.id 
                ? 'bg-[#002D44] text-white shadow-xl translate-x-2' 
                : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-[#FFD700]' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          ))}

          <div className="pt-10 mt-10 border-t border-slate-200">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black text-blue-800 uppercase">Segurança</span>
              </div>
              <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                Sempre salve as alterações antes de navegar para outra aba.
              </p>
            </div>
          </div>
        </div>

        {/* Área de Conteúdo */}
        <div className="flex-grow p-8 md:p-12 overflow-y-auto">
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-3xl font-bold text-[#002D44] serif capitalize">{activeTab}</h2>
              <p className="text-slate-500 text-sm">Gerencie as definições de {activeTab} do hotel.</p>
            </div>
            <button className="bg-[#E31B23] text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-[#c4161d] transition-all shadow-lg active:scale-95">
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>

          <div className="space-y-8 animate-fade-up delay-100">
            {activeTab === 'geral' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome do Empreendimento</label>
                  <input type="text" defaultValue="Araguaia Palace Hotel" className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002D44] outline-none font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">E-mail Operacional</label>
                  <input type="email" defaultValue="palacehotelaraguaia@gmail.com" className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002D44] outline-none font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Telefone Principal</label>
                  <input type="text" defaultValue="(66) 9 9602-9294" className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002D44] outline-none font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">CNPJ</label>
                  <input type="text" placeholder="00.000.000/0000-00" className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#002D44] outline-none font-medium" />
                </div>
              </div>
            )}

            {activeTab === 'tarifas' && (
              <div className="space-y-6">
                <div className="bg-[#002D44] p-6 rounded-2xl text-white flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-lg">Tarifa Base Atual</h4>
                    <p className="text-white/60 text-xs">Média para suíte standard (individual)</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-[#FFD700]">R$ 180,00</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Por Diária</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Fim de Semana</p>
                    <p className="text-xl font-bold text-[#002D44]">+ 15%</p>
                  </div>
                  <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Hóspede Extra</p>
                    <p className="text-xl font-bold text-[#002D44]">R$ 60,00</p>
                  </div>
                  <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Crianças (até 5a)</p>
                    <p className="text-xl font-bold text-green-600">Cortesia</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'politicas' && (
              <div className="space-y-12">
                {/* Horários */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#002D44] flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Horários de Operação
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Horário Padrão de Check-in</label>
                      <input type="time" defaultValue="14:00" className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold text-[#002D44] focus:border-[#002D44] transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Horário Padrão de Check-out</label>
                      <input type="time" defaultValue="12:00" className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold text-[#002D44] focus:border-[#002D44] transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Pets */}
                <div className="space-y-6 pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#002D44] flex items-center gap-2">
                      <Dog className="w-6 h-6" /> Política de Pets
                    </h3>
                    <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-full">
                      <button 
                        onClick={() => setPetFriendly(false)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!petFriendly ? 'bg-red-500 text-white shadow-md' : 'text-slate-400'}`}
                      >
                        Não Aceita
                      </button>
                      <button 
                        onClick={() => setPetFriendly(true)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${petFriendly ? 'bg-green-600 text-white shadow-md' : 'text-slate-400'}`}
                      >
                        Pet Friendly
                      </button>
                    </div>
                  </div>

                  {petFriendly && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-up">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Porte Máximo (kg)</label>
                        <select className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 outline-none font-medium">
                          <option>Até 10kg (Pequeno)</option>
                          <option>Até 25kg (Médio)</option>
                          <option>Sem restrição de peso</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Taxa de Higienização Pet (R$)</label>
                        <input type="number" defaultValue="50" className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold text-[#002D44]" />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Regras Detalhadas para Pets</label>
                        <textarea 
                          rows={4}
                          defaultValue="O pet deve estar sempre com coleira nas áreas comuns. Não é permitido o acesso de pets ao salão de café da manhã. O tutor é responsável por qualquer dano ao mobiliário."
                          className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 outline-none font-medium leading-relaxed"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cancelamento */}
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    <h4 className="font-bold text-red-900">Políticas de Cancelamento Padrão</h4>
                  </div>
                  <textarea 
                    rows={2}
                    defaultValue="Cancelamento gratuito até 24h antes do check-in. Após este prazo, será cobrado o valor da primeira diária (No-show)."
                    className="w-full bg-white/50 px-4 py-3 rounded-xl border border-red-200 text-sm text-red-800 outline-none focus:ring-1 focus:ring-red-300"
                  />
                </div>
              </div>
            )}

            {activeTab === 'conteudo' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-[#002D44]">Galeria Principal</h4>
                  <button className="text-[#002D44] flex items-center gap-2 text-sm font-bold hover:text-[#E31B23]">
                    <Plus className="w-4 h-4" /> Adicionar Mídia
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-slate-100">
                      <img src={`https://picsum.photos/400/400?random=${i+100}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button className="bg-white/20 backdrop-blur-md p-2 rounded-lg hover:bg-white/40 transition-all">
                          <ImageIcon className="w-4 h-4 text-white" />
                        </button>
                        <button className="bg-red-500/80 backdrop-blur-md p-2 rounded-lg hover:bg-red-600 transition-all">
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelSettings;
