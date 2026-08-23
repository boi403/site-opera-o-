
import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Settings, 
  Lock, 
  ShieldCheck, 
  ArrowLeft, 
  ShieldAlert,
  Home,
  LogOut
} from 'lucide-react';
import HotelSettings from './HotelSettings';
import GuestManagement from './GuestManagement';
import AccessManagement from './AccessManagement';

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

interface ProfessionalTabProps {
  onBackToHome?: () => void;
  onLogout?: () => void;
}

const ProfessionalTab: React.FC<ProfessionalTabProps> = ({ onBackToHome, onLogout }) => {
  const [currentView, setCurrentView] = useState<'menu' | 'settings' | 'guests' | 'security'>('menu');
  
  // Gestão de Códigos e Histórico
  const [validCodes, setValidCodes] = useState<AccessCode[]>([
    { id: '1', code: 'ARAGUAIA2024', label: 'Administrador Master', createdAt: new Date().toISOString() }
  ]);
  const [entryHistory, setEntryHistory] = useState<EntryLog[]>([]);

  const adminUrl = "./gest-o-operacional-para-hot-is-main/";

  const addAccessCode = (label: string) => {
    const newCode: AccessCode = {
      id: Math.random().toString(36).substr(2, 9),
      code: Math.random().toString(36).toUpperCase().substr(2, 8),
      label,
      createdAt: new Date().toISOString()
    };
    setValidCodes(prev => [newCode, ...prev]);
  };

  const removeAccessCode = (id: string) => {
    if (validCodes.length === 1) return;
    setValidCodes(prev => prev.filter(c => c.id !== id));
  };

  const menuItems = [
    { id: 'guests', icon: Users, label: 'Gestão de Hóspedes', active: true },
    { id: 'calendar', icon: Calendar, label: 'Calendário de Reservas', active: false },
    { id: 'settings', icon: Settings, label: 'Configurações do Hotel', active: true },
    { id: 'security', icon: ShieldAlert, label: 'Segurança & Acessos', active: true },
    { id: 'admin', icon: Lock, label: 'Drive Administrativo', active: true, url: adminUrl },
  ];

  const handleBack = () => setCurrentView('menu');

  // RENDERIZAÇÃO DAS VISÕES
  const renderView = () => {
    switch (currentView) {
      case 'settings': return <HotelSettings />;
      case 'guests': return <GuestManagement />;
      case 'security': return (
        <AccessManagement 
          accessCodes={validCodes} 
          onAddCode={addAccessCode} 
          onRemoveCode={removeAccessCode} 
          history={entryHistory} 
        />
      );
      default: return (
        <div className="max-w-4xl w-full relative z-10 py-12">
          {/* Botão Superior de Voltar para o Site */}
          <div className="flex justify-center flex-wrap gap-4 mb-12">
            <button 
              onClick={onBackToHome}
              className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/10 px-8 py-3 rounded-2xl transition-all shadow-2xl"
            >
              <Home className="w-5 h-5 text-[#FFD700] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Voltar para o Site</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="group flex items-center gap-3 bg-[#E31B23]/20 hover:bg-[#E31B23]/35 border border-[#E31B23]/40 px-8 py-3 rounded-2xl transition-all shadow-2xl"
              >
                <LogOut className="w-5 h-5 text-[#FFD700] group-hover:translate-x-0.5 transition-transform" />
                <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Sair do painel</span>
              </button>
            )}
          </div>

          <div className="flex flex-col items-center gap-6 mb-16 animate-fade-up">
              <div className="bg-[#E31B23] w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl border-2 border-white/10">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <div className="text-center">
                  <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.5em] block mb-2">Portal de Gestão</span>
                  <h2 className="text-4xl md:text-6xl font-bold serif text-white">Administração</h2>
                  <p className="text-slate-400 mt-4 text-sm max-w-md mx-auto">Acesso direto às ferramentas de controle operacional do Araguaia Palace Hotel.</p>
              </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-up delay-200">
            {menuItems.map((item, idx) => {
              if (item.active) {
                return (
                  <div 
                    key={idx} 
                    onClick={() => {
                      if (item.id === 'settings') setCurrentView('settings');
                      if (item.id === 'guests') setCurrentView('guests');
                      if (item.id === 'security') setCurrentView('security');
                      if (item.url) window.open(item.url, '_blank');
                    }}
                    className="bg-[#002D44] p-10 rounded-[3rem] border-2 border-[#FFD700]/10 hover:border-[#FFD700] flex flex-col items-center justify-center gap-6 hover:bg-[#003d5c] hover:scale-[1.05] transition-all group cursor-pointer shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <item.icon size={80} />
                    </div>
                    <div className="bg-[#FFD700] p-6 rounded-2xl shadow-xl group-hover:rotate-12 transition-transform">
                      <item.icon className="w-8 h-8 text-[#002D44]" />
                    </div>
                    <span className="font-black text-xl text-white font-serif">{item.label}</span>
                  </div>
                );
              }
              return (
                <div 
                  key={idx}
                  className="bg-white/5 p-10 rounded-[3rem] border-2 border-white/5 flex flex-col items-center justify-center gap-6 opacity-40 cursor-not-allowed"
                >
                  <div className="bg-slate-700 p-6 rounded-2xl">
                    <item.icon className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-lg text-slate-500 block">{item.label}</span>
                    <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest mt-1 block">Em Breve</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#001a29]">
      {currentView !== 'menu' && (
        <div className="p-4 md:p-12">
          <div className="mb-10 flex flex-wrap gap-3">
            <button 
              onClick={handleBack}
              className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group bg-white/5 px-6 py-3 rounded-2xl border border-white/10"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold uppercase tracking-widest">Voltar ao Menu Principal</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-3 text-white bg-[#E31B23]/30 hover:bg-[#E31B23]/50 transition-colors group px-6 py-3 rounded-2xl border border-[#E31B23]/40"
              >
                <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-widest">Sair</span>
              </button>
            )}
          </div>
          <div className="animate-fade-up">
            {renderView()}
          </div>
        </div>
      )}
      {currentView === 'menu' && (
        <div className="min-h-[90vh] flex items-center justify-center p-6 text-center">
          {renderView()}
        </div>
      )}
    </div>
  );
};

export default ProfessionalTab;
