
import React from 'react';
import { MapPin, Phone, Mail, ExternalLink, Clock, Globe, PhoneCall } from 'lucide-react';

const Location: React.FC = () => {
  const mapUrl = "https://www.google.com/maps/place/Araguaia+Palace+Hotel/@-17.317028,-53.2136898,17z";

  const contactItems = [
    {
      icon: Phone,
      title: "TELEFONE",
      value: "66 9 9602-9294",
      link: "tel:66996029294",
      isPhone: true
    },
    {
      icon: MapPin,
      title: "ENDEREÇO",
      value: "Av. Carlos Hugueney, 233 - Centro, Alto Araguaia - MT",
      link: mapUrl
    },
    {
      icon: Globe,
      title: "SITE",
      value: "www.araguaiapalacehotel.com.br",
      link: "https://www.araguaiapalacehotel.com.br"
    },
    {
      icon: Mail,
      title: "EMAIL",
      value: "palacehotelaraguaia@gmail.com",
      link: "mailto:palacehotelaraguaia@gmail.com"
    }
  ];

  return (
    <section id="localização" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
          
          {/* Informações de Contato - Estilo baseado no Flyer */}
          <div className="bg-[#2D4263] p-10 md:p-16 text-white relative overflow-hidden">
            {/* Elemento Decorativo (as ondas da logo ao fundo) */}
            <div className="absolute right-[-10%] bottom-[-5%] opacity-10 pointer-events-none">
               <svg width="400" height="400" viewBox="0 0 100 100" fill="white">
                  <path d="M45 75C45 75 55 50 85 45C95 43 100 35 100 25C100 15 90 0 75 5C55 12 40 40 40 75H45Z" />
                  <path d="M65 75C65 75 75 55 100 50C110 48 115 40 115 30C115 20 105 10 95 15C80 22 60 45 60 75H65Z" transform="translate(15, 10)" />
               </svg>
            </div>

            <div className="relative z-10 space-y-12">
              <div className="space-y-2">
                <h2 className="text-4xl md:text-5xl font-light serif italic">Contatos</h2>
                <div className="w-16 h-1 bg-[#FFD700]"></div>
              </div>

              <div className="space-y-8">
                {contactItems.map((item, idx) => (
                  <a 
                    key={idx} 
                    href={item.link} 
                    target={item.icon === MapPin || item.icon === Globe ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-start gap-6 group"
                  >
                    <div className="bg-[#C1A376] p-3 rounded-full shadow-lg group-hover:bg-[#FFD700] transition-colors duration-300 relative">
                      <item.icon className="w-6 h-6 text-[#2D4263]" />
                      {item.isPhone && (
                        <span className="absolute inset-0 rounded-full bg-[#FFD700] animate-ping opacity-20 group-hover:opacity-40"></span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs tracking-[0.2em] font-bold text-[#C1A376] group-hover:text-[#FFD700] transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <p className="text-lg md:text-xl font-light text-slate-100 leading-tight">
                          {item.value}
                        </p>
                        {item.isPhone && (
                          <div className="bg-[#E31B23] p-1.5 rounded-full shadow-md transform group-hover:scale-110 transition-transform">
                            <PhoneCall className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="pt-8 border-t border-white/10 flex items-center gap-4 text-sm text-slate-300">
                <Clock className="w-5 h-5 text-[#FFD700]" />
                <p>Check-in: 14h | Check-out: 12h</p>
              </div>
            </div>
          </div>

          {/* Mapa / Visual */}
          <div className="relative min-h-[500px] lg:min-h-full bg-slate-200">
            {/* Usando um iFrame real do Google Maps para o hotel */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3844.249410189447!2d-53.21626472491104!3d-17.317027983693444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x937c9ab3a7e0bf67%3A0x652b4eeeb4533033!2sAraguaia%20Palace%20Hotel!5e0!3m2!1spt-BR!2sbr!4v1710000000000!5m2!1spt-BR!2sbr" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
            ></iframe>
            
            <a 
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-8 right-8 bg-white text-[#2D4263] px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 hover:bg-[#FFD700] transition-all transform hover:scale-105 active:scale-95"
            >
              Abrir no Google Maps
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Location;
