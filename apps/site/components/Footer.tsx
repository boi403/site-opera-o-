
import React, { useEffect, useRef } from 'react';
import { hotelImages } from '../assets/hotel/images';

const Logo: React.FC = () => (
  <img
    src={hotelImages.logo}
    alt="Logo Araguaia Palace Hotel"
    className="h-8 w-auto object-contain"
  />
);

const Footer: React.FC = () => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // @ts-ignore
        if (window.adsbygoogle && adRef.current && adRef.current.offsetWidth > 0) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e) {
        console.error("Ads initialization skipped or failed", e);
      }
    }, 1000); // Aumentado para 1s para garantir renderização total do layout
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <footer className="bg-[#002D44] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Espaço para Google Ads no Rodapé com correção de largura */}
        <div className="mb-16 w-full flex justify-center">
          <div className="w-full max-w-4xl bg-white/5 border border-white/10 rounded-2xl p-4 overflow-hidden min-h-[120px] flex items-center justify-center relative">
            <ins 
                 ref={adRef}
                 className="adsbygoogle"
                 style={{ display: 'block', width: '100%', minWidth: '250px', minHeight: '90px' }}
                 data-ad-client="ca-pub-2091933256294245"
                 data-ad-slot="footer-auto-ads"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <p className="absolute bottom-1 right-3 text-[8px] uppercase tracking-widest text-white/20 font-bold pointer-events-none">Publicidade</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Logo />
              <div>
                <h2 className="text-xl font-bold leading-tight">ARAGUAIA</h2>
                <p className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">Palace Hotel</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm max-w-xs mx-auto md:mx-0 italic serif leading-relaxed">
              "Tudo que merece ser feito merece ser bem feito"
            </p>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-lg font-bold text-[#FFD700] uppercase tracking-widest text-xs">Navegação</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#início" className="hover:text-white transition-colors">Início</a></li>
              <li><a href="#sobre-nós" className="hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="#acomodações" className="hover:text-white transition-colors">Acomodações</a></li>
              <li><a href="#pontos-turísticos" className="hover:text-white transition-colors">Turismo</a></li>
              <li><a href="#serviços" className="hover:text-white transition-colors">Serviços</a></li>
              <li><a href="#localização" className="hover:text-white transition-colors">Localização</a></li>
            </ul>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-lg font-bold text-[#FFD700] uppercase tracking-widest text-xs">Contato Direto</h3>
            <p className="text-sm text-slate-300">
              Av. Carlos Hugueney, 233 - Centro<br />
              Alto Araguaia - MT
            </p>
            <p className="text-sm text-slate-300">
              <a href="tel:66996029294" className="hover:text-white font-bold">(66) 9 9602-9294</a>
            </p>
            <p className="text-sm text-slate-300">
              <a href="mailto:palacehotelaraguaia@gmail.com" className="hover:text-white">palacehotelaraguaia@gmail.com</a>
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500">
          <div className="flex space-x-6 text-[10px] uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
          </div>

          <p className="text-[10px] uppercase tracking-widest font-medium">
            © {new Date().getFullYear()} Araguaia Palace Hotel. Tradição & Conforto.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
