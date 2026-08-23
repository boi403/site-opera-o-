import React, { useState } from 'react';
import { Award, Bed, Calendar, Navigation, Search, Users } from 'lucide-react';
import { hotelImages } from '../assets/hotel/images';

const Hero: React.FC = () => {
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    adults: '2',
    children: '0',
    rooms: '1',
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { checkIn, checkOut, adults, children, rooms } = bookingData;

    const emailTo = 'palacehotelaraguaia@gmail.com';
    const subject = encodeURIComponent('Solicitacao de Reserva - Araguaia Palace Hotel');
    const body = encodeURIComponent(
      `--------------------------------------------------\n` +
        `PEDIDO DE RESERVA - SITE OFICIAL\n` +
        `--------------------------------------------------\n\n` +
        `DADOS DA ESTADIA:\n` +
        `- Check-in: ${checkIn || 'A combinar'}\n` +
        `- Check-out: ${checkOut || 'A combinar'}\n\n` +
        `COMPOSICAO DO GRUPO:\n` +
        `- Adultos: ${adults}\n` +
        `- Criancas: ${children}\n` +
        `- Numero de Quartos: ${rooms}\n\n` +
        `--------------------------------------------------\n` +
        `Por favor, confirmar disponibilidade e valores para o periodo informado.\n\n` +
        `Enviado via: Araguaia Palace Hotel`,
    );

    window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {
        alert(
          'Detectamos sua localizacao. O Araguaia Palace Hotel e o ponto central de Alto Araguaia. Complete a busca abaixo para reservar.',
        );
      });
    }
  };

  return (
    <section id="inicio" className="relative pt-12 pb-24 md:pt-20 md:pb-44 bg-white overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16 lg:mb-28">
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

        <div className="max-w-5xl mx-auto relative z-30 -mt-10 md:-mt-32 animate-fade-up delay-300 opacity-0-init px-2 md:px-0">
          <form
            onSubmit={handleBookingSubmit}
            className="bg-white rounded-[3.5rem] shadow-[0_65px_110px_-25px_rgba(0,0,0,0.4)] border-[8px] border-[#FFD700] overflow-hidden flex flex-col"
          >
            <div
              onClick={handleGeoLocation}
              className="p-8 border-b-4 border-[#FFD700]/15 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-6 group"
            >
              <div className="bg-[#002D44] p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-xl">
                <Search className="w-7 h-7 text-[#FFD700]" />
              </div>
              <div className="flex flex-col">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">
                  Seu Destino
                </p>
                <p className="text-2xl md:text-3xl font-black text-[#002D44] tracking-tight group-hover:text-[#E31B23] transition-colors">
                  Proximo a localizacao atual
                </p>
              </div>
              <Navigation className="ml-auto w-6 h-6 text-[#E31B23] animate-pulse hidden md:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 border-b-4 border-[#FFD700]/15">
              <div className="p-8 border-b-4 md:border-b-0 md:border-r-4 border-[#FFD700]/15 hover:bg-slate-50 transition-colors flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-[#E31B23]" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Data de entrada</p>
                </div>
                <input
                  type="date"
                  name="checkIn"
                  required
                  onChange={handleChange}
                  className="w-full text-2xl font-black text-[#002D44] bg-transparent outline-none cursor-pointer focus:text-[#E31B23] transition-colors"
                />
              </div>
              <div className="p-8 hover:bg-slate-50 transition-colors flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-[#E31B23]" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Data de saida</p>
                </div>
                <input
                  type="date"
                  name="checkOut"
                  required
                  onChange={handleChange}
                  className="w-full text-2xl font-black text-[#002D44] bg-transparent outline-none cursor-pointer focus:text-[#E31B23] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 bg-white">
              <div className="p-8 border-r-4 border-[#FFD700]/15 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-slate-400" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Adultos</p>
                </div>
                <select
                  name="adults"
                  onChange={handleChange}
                  value={bookingData.adults}
                  className="w-full text-3xl font-black text-[#002D44] bg-transparent outline-none cursor-pointer appearance-none group-hover:text-[#E31B23]"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <div className="p-8 border-r-4 border-[#FFD700]/15 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-slate-400" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Criancas</p>
                </div>
                <select
                  name="children"
                  onChange={handleChange}
                  value={bookingData.children}
                  className="w-full text-3xl font-black text-[#002D44] bg-transparent outline-none cursor-pointer appearance-none group-hover:text-[#E31B23]"
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>
              <div className="p-8 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-2 mb-3">
                  <Bed className="w-4 h-4 text-slate-400" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Quartos</p>
                </div>
                <select
                  name="rooms"
                  onChange={handleChange}
                  value={bookingData.rooms}
                  className="w-full text-3xl font-black text-[#002D44] bg-transparent outline-none cursor-pointer appearance-none group-hover:text-[#E31B23]"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-10 bg-gradient-to-r from-[#007AFF] to-[#005ec2] text-white font-black text-4xl uppercase tracking-[0.3em] hover:brightness-110 transition-all transform active:scale-[0.99] flex items-center justify-center gap-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
            >
              <Search className="w-8 h-8" />
              Pesquisar
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 mt-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Preco Garantido
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Cancelamento Gratis
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Sem taxas ocultas
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
