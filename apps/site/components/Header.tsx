
import React from 'react';
import { UserCircle, ShieldCheck, WashingMachine, UtensilsCrossed } from 'lucide-react';
import { hotelImages } from '../assets/hotel/images';

interface HeaderProps {
  onNavigate: (tab: 'home' | 'professional') => void;
  activeTab: 'home' | 'professional';
}

const Logo: React.FC = () => (
  <img
    src={hotelImages.logo}
    alt="Logo Araguaia Palace Hotel"
    className="h-10 w-auto object-contain drop-shadow-sm"
  />
);

const Header: React.FC<HeaderProps> = ({ onNavigate, activeTab }) => {
  const navItems = [
    { label: 'Início', id: 'início' },
    { label: 'Sobre Nós', id: 'sobre-nós' },
    { label: 'Turismo', id: 'pontos-turísticos' },
    { label: 'Serviços', id: 'serviços' },
    { label: 'Localização', id: 'localização' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="flex items-center justify-center">
              <Logo />
            </div>
            <div className="border-l border-gray-200 pl-3">
              <h1 className="text-xl font-bold text-[#002D44] leading-tight tracking-tight">ARAGUAIA</h1>
              <p className="text-[10px] tracking-widest text-slate-500 uppercase font-semibold">Palace Hotel</p>
            </div>
          </div>

          <nav className="hidden md:flex space-x-6 lg:space-x-8 items-center">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-sm font-medium text-slate-600 hover:text-[#E31B23] transition-colors whitespace-nowrap"
                onClick={(e) => {
                  if (activeTab === 'professional') {
                    e.preventDefault();
                    onNavigate('home');
                    setTimeout(() => {
                      const el = document.getElementById(item.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
              >
                {item.label}
              </a>
            ))}
            <a
              href="https://lavanderia.araguaiapalacehotel.com.br"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#E31B23] transition-colors whitespace-nowrap"
            >
              <WashingMachine className="w-4 h-4" />
              Lavanderia
            </a>
            <a
              href="https://lavanderia.araguaiapalacehotel.com.br/restaurante"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#E31B23] transition-colors whitespace-nowrap"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Restaurante
            </a>
            <button
              onClick={() => onNavigate('professional')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all border-2 ${
                activeTab === 'professional' 
                ? 'bg-[#E31B23] text-white border-[#E31B23] shadow-lg shadow-[#E31B23]/20' 
                : 'bg-white text-slate-700 border-slate-200 hover:border-[#002D44] hover:text-[#002D44]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Administrativo</span>
            </button>
          </nav>

          <div className="md:hidden">
            <div className="flex items-center gap-1">
              <a href="https://lavanderia.araguaiapalacehotel.com.br" className="p-2" aria-label="Lavanderia">
                <WashingMachine className="w-6 h-6 text-slate-500" />
              </a>
              <a href="https://lavanderia.araguaiapalacehotel.com.br/restaurante" className="p-2" aria-label="Restaurante">
                <UtensilsCrossed className="w-6 h-6 text-slate-500" />
              </a>
              <button onClick={() => onNavigate('professional')} className="p-2">
                <ShieldCheck className={`w-7 h-7 ${activeTab === 'professional' ? 'text-[#E31B23]' : 'text-slate-500'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
