import React from 'react';
import { Award } from 'lucide-react';
import { hotelImages } from '../assets/hotel/images';

const Hero: React.FC = () => {
  return (
    <section id="inicio" className="relative pt-12 pb-24 md:pt-20 md:pb-28 bg-white overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 text-center lg:text-left relative z-10">
            <div className="animate-fade-up opacity-0-init">
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-slate-50 border border-slate-200 rounded-full shadow-sm">
                <Award className="w-4 h-4 text-[#E31B23]" />
                <p className="text-[#E31B23] text-[10px] font-black uppercase tracking-[0.25em]">
                  48 Anos de Tradicao e Excelencia
                </p>
              </div>
            </div>

            <div className="space-y-4 animate-fade-up delay-100 opacity-0-init">
              <h2 className="text-5xl md:text-8xl font-bold text-[#002D44] leading-[1] serif tracking-tight">
                Sinta-se em <br />
                <span className="text-[#E31B23]">Casa</span>
              </h2>
              <div className="w-24 h-2 bg-[#FFD700] rounded-full mx-auto lg:mx-0 mt-6"></div>
              <p className="text-xl md:text-2xl font-medium text-slate-500 italic serif max-w-lg mx-auto lg:mx-0 pt-4 leading-relaxed">
                "Onde cada detalhe foi planejado para o seu descanso executivo ou lazer em familia."
              </p>
            </div>
          </div>

          <div className="relative group animate-fade-right opacity-0-init">
            <div className="absolute -inset-6 bg-[#002D44]/5 rounded-[4rem] rotate-3 -z-10 group-hover:rotate-0 transition-all duration-700"></div>
            <div className="relative aspect-video lg:aspect-[4/3] rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border-[14px] border-white">
              <img
                src={hotelImages.facade}
                alt="Entrada principal do Araguaia Palace Hotel"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#002D44]/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-12 left-12 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#FFD700] mb-3">
                  Fachada Principal
                </p>
                <h3 className="text-3xl md:text-4xl font-bold serif">Araguaia Palace Hotel</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
