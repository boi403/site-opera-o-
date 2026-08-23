
import React from 'react';
import { Coffee, Car, ShieldCheck, Utensils } from 'lucide-react';

const Services: React.FC = () => {
  const services = [
    { icon: Coffee, title: 'Cafeteria Gourmet', desc: 'Grãos selecionados e lanches artesanais.' },
    { icon: Car, title: 'Transfer Executivo', desc: 'Conforto do aeroporto até o hotel.' },
    { icon: ShieldCheck, title: 'Segurança 24h', desc: 'Monitoramento constante para sua paz.' },
    { icon: Utensils, title: 'Restaurante', desc: 'O melhor da culinária regional.' },
  ];

  return (
    <section id="serviços" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#002D44] mb-2 uppercase tracking-widest">Serviços</h2>
          <p className="text-slate-500 font-medium">O que oferecemos para você</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#002D44] transition-colors">
                <service.icon className="w-8 h-8 text-[#002D44] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-[#002D44] mb-2">{service.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
