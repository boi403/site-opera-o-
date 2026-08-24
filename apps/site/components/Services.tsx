import React from 'react';
import { Coffee, Car, ShieldCheck, UtensilsCrossed, WashingMachine, Wifi } from 'lucide-react';

const Services: React.FC = () => {
  const services = [
    { 
      icon: WashingMachine, 
      title: 'Lavanderia Express', 
      desc: 'Serviço rápido de lavagem, secagem e passadoria com todo o cuidado para suas roupas e trajes executivos.',
      highlight: true
    },
    { 
      icon: UtensilsCrossed, 
      title: 'Restaurante Regional', 
      desc: 'Café da manhã farto colonial incluso e o melhor da gastronomia regional e brasileira com pratos à la carte.',
      highlight: true
    },
    { 
      icon: Coffee, 
      title: 'Cafeteria Gourmet', 
      desc: 'Cafés especiais, cappuccinos, bolos frescos e lanches artesanais preparados na hora.',
      highlight: false
    },
    { 
      icon: Car, 
      title: 'Estacionamento Privativo', 
      desc: 'Vagas seguras no próprio hotel com fácil acesso e suporte para sua estadia.',
      highlight: false
    },
    { 
      icon: ShieldCheck, 
      title: 'Recepção e Segurança 24h', 
      desc: 'Atendimento humanizado dia e noite e monitoramento contínuo para sua tranquilidade.',
      highlight: false
    },
    { 
      icon: Wifi, 
      title: 'Wi-Fi Fibra de Alta Velocidade', 
      desc: 'Internet rápida e estável liberada em todos os quartos e áreas sociais para trabalho ou lazer.',
      highlight: false
    },
  ];

  return (
    <section id="serviços" className="py-20 bg-slate-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[#E31B23] font-bold text-xs uppercase tracking-widest bg-red-50 px-4 py-1.5 rounded-full inline-block mb-3">
            Comodidades & Experiência
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#002D44] mb-3 uppercase tracking-wider">
            Nossos Serviços
          </h2>
          <p className="text-slate-600 font-medium max-w-2xl mx-auto">
            Tudo o que você precisa para uma estadia confortável, produtiva e inesquecível em Alto Araguaia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div 
              key={idx} 
              className={`bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group border text-left flex flex-col justify-between ${
                service.highlight ? 'border-red-100 ring-1 ring-red-500/10' : 'border-gray-100'
              }`}
            >
              <div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                  service.highlight 
                    ? 'bg-red-50 text-[#E31B23] group-hover:bg-[#E31B23] group-hover:text-white group-hover:shadow-lg group-hover:shadow-red-500/30' 
                    : 'bg-slate-100 text-[#002D44] group-hover:bg-[#002D44] group-hover:text-white'
                }`}>
                  <service.icon className="w-7 h-7 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-[#002D44] mb-2 group-hover:text-[#E31B23] transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {service.desc}
                </p>
              </div>
              {service.highlight && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-[#E31B23]">
                  <span>Serviço no Hotel</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E31B23]" />
                  <span className="text-slate-400 font-normal">Disponível para hóspedes e visitantes</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
