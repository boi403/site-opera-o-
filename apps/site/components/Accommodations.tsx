import React, { useEffect, useMemo, useState } from 'react';
import { suiteImages } from '../data/siteImages';
import {
  ChevronLeft,
  ChevronRight,
  Wind,
  Tv,
  Coffee,
  Shield,
  Bath,
  Wifi,
  BedDouble,
  Users,
  User,
  Briefcase,
  Sparkles,
  Utensils,
  Bed,
  Info,
} from 'lucide-react';

interface Suite {
  id: string;
  name: string;
  category: 'solteiro' | 'casal' | 'grupos';
  subTitle: string;
  description: string;
  amenities: { icon: any; text: string }[];
  images: string[];
  capacity: string;
  price: string;
  quantity: number;
}

const Accommodations: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'solteiro' | 'casal' | 'grupos'>('all');
  const [activeSuiteId, setActiveSuiteId] = useState<string>('std-solteiro');
  const [currentImg, setCurrentImg] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  const suites: Suite[] = [
    {
      id: 'std-solteiro',
      name: 'Standard Solteiro',
      category: 'solteiro',
      subTitle: 'Essencial e Funcional',
      description:
        'Acomodacao pratica para estadias rapidas. Oferece o silencio necessario para um descanso profundo apos um dia de viagem ou trabalho.',
      amenities: [
        { icon: User, text: '1 Cama de Solteiro' },
        { icon: Wind, text: 'Ar-Condicionado' },
        { icon: Wifi, text: 'Wi-Fi 5G' },
        { icon: Tv, text: 'TV LED' },
      ],
      capacity: '1 Pessoa',
      price: '160',
      quantity: 15,
      images: [...suiteImages['std-solteiro']],
    },
    {
      id: 'exec-solteiro',
      name: 'Executivo Solteiro',
      category: 'solteiro',
      subTitle: 'Conforto para o Viajante',
      description:
        'Ambiente planejado com mesa de trabalho ampliada e cadeira ergonomica, focado no hospede que nao para.',
      amenities: [
        { icon: Bed, text: 'Cama Solteiro Especial' },
        { icon: Briefcase, text: 'Estacao Office' },
        { icon: Coffee, text: 'Frigobar Abastecido' },
        { icon: Wind, text: 'Split Silencioso' },
      ],
      capacity: '1 Pessoa',
      price: '195',
      quantity: 12,
      images: [...suiteImages['exec-solteiro']],
    },
    {
      id: 'std-casal',
      name: 'Standard Casal',
      category: 'casal',
      subTitle: 'Tradicao Araguaia',
      description:
        'O quarto mais classico do nosso hotel. Conforto na medida certa para quem busca a melhor relacao custo-beneficio.',
      amenities: [
        { icon: BedDouble, text: '1 Cama de Casal' },
        { icon: Coffee, text: 'Frigobar' },
        { icon: Tv, text: 'Smart TV' },
        { icon: Shield, text: 'Cofre' },
      ],
      capacity: '2 Pessoas',
      price: '220',
      quantity: 20,
      images: [...suiteImages['std-casal']],
    },
    {
      id: 'premium-casal',
      name: 'Premium Casal',
      category: 'casal',
      subTitle: 'Modernidade e Estilo',
      description:
        'Unidades recentemente reformadas com decoracao contemporanea e iluminacao automatizada.',
      amenities: [
        { icon: BedDouble, text: 'Cama Queen Size' },
        { icon: Bath, text: 'Ducha com Aquecimento' },
        { icon: Utensils, text: 'Apoio de Quarto' },
        { icon: Wind, text: 'Ar-Condicionado Inverter' },
      ],
      capacity: '2 Pessoas',
      price: '280',
      quantity: 10,
      images: [...suiteImages['premium-casal']],
    },
    {
      id: 'duplo-twin',
      name: 'Executivo Twin',
      category: 'solteiro',
      subTitle: 'Conforto em Dobro',
      description:
        'Quarto equipado com duas camas de solteiro separadas. Ideal para colegas de trabalho ou amigos.',
      amenities: [
        { icon: Bed, text: '2 Camas Solteiro' },
        { icon: Briefcase, text: 'Mesa de Trabalho' },
        { icon: Wifi, text: 'Internet Alta Vel.' },
        { icon: Tv, text: 'TV por Assinatura' },
      ],
      capacity: '2 Pessoas',
      price: '245',
      quantity: 8,
      images: [...suiteImages['duplo-twin']],
    },
    {
      id: 'triplo-solteiro',
      name: 'Triplo Solteiro',
      category: 'grupos',
      subTitle: 'Foco em Equipes',
      description:
        'Solucao inteligente para grupos. Tres camas de solteiro em um ambiente espacoso e bem distribuido.',
      amenities: [
        { icon: Bed, text: '3 Camas Solteiro' },
        { icon: Users, text: 'Ampla Circulacao' },
        { icon: Wind, text: 'Ar de Alta Cap.' },
        { icon: Wifi, text: 'Conexao Multipla' },
      ],
      capacity: '3 Pessoas',
      price: '360',
      quantity: 4,
      images: [...suiteImages['triplo-solteiro']],
    },
    {
      id: 'suite-master',
      name: 'Suite Master',
      category: 'casal',
      subTitle: 'O Apice do Luxo',
      description:
        'Nossa unidade de elite. Possui sala de estar integrada, antessala e o melhor enxoval do Mato Grosso.',
      amenities: [
        { icon: BedDouble, text: 'Cama King Size' },
        { icon: Bath, text: 'Banheira de Imersao' },
        { icon: Sparkles, text: 'Servico VIP' },
        { icon: Utensils, text: 'Cafe no Quarto' },
      ],
      capacity: 'Casal',
      price: '450',
      quantity: 2,
      images: [...suiteImages['suite-master']],
    },
    {
      id: 'familia-master',
      name: 'Suite Familia',
      category: 'grupos',
      subTitle: 'Conforto para Todos',
      description:
        'Combinando uma cama de casal e duas de solteiro. O refugio perfeito para suas ferias em familia.',
      amenities: [
        { icon: Users, text: 'Casal + 2 Solteiros' },
        { icon: Tv, text: '2 Smart TVs' },
        { icon: Coffee, text: 'Copa Equipada' },
        { icon: Shield, text: 'Seguranca Extra' },
      ],
      capacity: '4 Pessoas',
      price: '490',
      quantity: 5,
      images: [...suiteImages['familia-master']],
    },
  ];

  const filteredSuites = filter === 'all' ? suites : suites.filter((suite) => suite.category === filter);

  useEffect(() => {
    if (!filteredSuites.some((suite) => suite.id === activeSuiteId)) {
      setActiveSuiteId(filteredSuites[0]?.id ?? suites[0].id);
    }
  }, [activeSuiteId, filteredSuites, suites]);

  useEffect(() => {
    setCurrentImg(0);
  }, [activeSuiteId]);

  const activeSuite = useMemo(
    () => filteredSuites.find((suite) => suite.id === activeSuiteId) || filteredSuites[0] || suites[0],
    [activeSuiteId, filteredSuites, suites],
  );

  useEffect(() => {
    if (isCarouselPaused) return;
    if (activeSuite.images.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setCurrentImg((prev) => (prev === activeSuite.images.length - 1 ? 0 : prev + 1));
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [activeSuite, isCarouselPaused]);

  const prevImage = () => {
    setCurrentImg((prev) => (prev === 0 ? activeSuite.images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentImg((prev) => (prev === activeSuite.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="acomodacoes" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <div className="flex items-center justify-center gap-2 mb-6">
            <BedDouble className="w-5 h-5 text-[#E31B23]" />
            <span className="text-[#E31B23] font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">
              Excelencia em 76 Unidades
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-[#002D44] serif leading-tight">
            Escolha sua Experiencia
          </h2>
          <div className="w-24 h-1.5 bg-[#FFD700] mx-auto mt-8 rounded-full"></div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-2xl font-black text-[#002D44]">35</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Opcoes de Casal</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-2xl font-black text-[#002D44]">27</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Opcoes de Solteiro</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-2xl font-black text-[#002D44]">09</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Config. Multiplas</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-2xl font-black text-[#002D44]">05</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Suites Familia</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-12">
            {[
              { id: 'all', label: 'Todas as Suites', icon: Sparkles },
              { id: 'solteiro', label: 'Indiv. / Solteiro', icon: User },
              { id: 'casal', label: 'Casal / Master', icon: BedDouble },
              { id: 'grupos', label: 'Grupos / Familia', icon: Users },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border-2 ${
                  filter === btn.id
                    ? 'bg-[#002D44] text-white border-[#002D44] shadow-xl'
                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 shadow-sm'
                }`}
              >
                <btn.icon className="w-4 h-4" />
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-fade-up">
          <div className="lg:col-span-8">
            <div className="relative rounded-[3rem] overflow-hidden border-[10px] border-white shadow-2xl bg-slate-100">
              <div
                className="relative"
                onMouseEnter={() => setIsCarouselPaused(true)}
                onMouseLeave={() => setIsCarouselPaused(false)}
              >
              <div className="absolute inset-0 bg-gradient-to-t from-[#002D44]/90 via-transparent to-transparent z-10 pointer-events-none" />
              <img
                src={activeSuite.images[currentImg]}
                alt={activeSuite.name}
                loading="lazy"
                decoding="async"
                className="w-full h-[340px] md:h-[620px] object-cover"
              />

              <div className="absolute top-6 left-6 right-6 z-20 flex items-start justify-between gap-4">
                <div className="bg-[#002D44]/85 backdrop-blur-md px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-xl flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FFD700]" />
                  {activeSuite.capacity}
                </div>
                <div className="bg-[#E31B23] px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-xl">
                  {activeSuite.quantity} unidades
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/70 mb-3">
                    {activeSuite.subTitle}
                  </p>
                  <h3 className="text-3xl md:text-5xl font-bold text-white serif leading-tight">
                    {activeSuite.name}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={prevImage}
                    className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-[#002D44] transition-all flex items-center justify-center"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="w-14 h-14 rounded-2xl bg-[#FFD700] text-[#002D44] hover:scale-105 transition-all flex items-center justify-center"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredSuites.map((suite) => (
                <button
                  key={suite.id}
                  type="button"
                  onClick={() => setActiveSuiteId(suite.id)}
                  className={`text-left rounded-[2rem] overflow-hidden border transition-all ${
                    activeSuite.id === suite.id
                      ? 'border-[#E31B23] shadow-xl shadow-[#E31B23]/10 -translate-y-1'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="relative h-28">
                    <img
                      src={suite.images[0]}
                      alt={suite.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white text-sm font-bold serif leading-tight">{suite.name}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-center gap-3">
              {activeSuite.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setCurrentImg(index)}
                  className={`h-3 rounded-full transition-all ${
                    index === currentImg ? 'w-12 bg-[#E31B23]' : 'w-3 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-[#f8fafc] border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-2 rounded-full bg-[#E31B23]/10 text-[#E31B23] text-[10px] font-black uppercase tracking-[0.24em]">
                  Suite ativa
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <h3 className="text-3xl font-bold text-[#002D44] serif leading-tight">{activeSuite.name}</h3>
              <p className="text-slate-500 text-base leading-relaxed mt-5 border-l-4 border-[#FFD700] pl-5">
                {activeSuite.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="rounded-2xl bg-white border border-slate-100 p-4">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-2">Capacidade</p>
                  <p className="text-lg font-black text-[#002D44]">{activeSuite.capacity}</p>
                </div>
                <div className="rounded-2xl bg-[#002D44] p-4">
                  <p className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em] mb-2">Diaria</p>
                  <p className="text-lg font-black text-[#FFD700]">R$ {activeSuite.price}</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {activeSuite.amenities.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 rounded-2xl bg-white p-4 border border-slate-100">
                    <div className="bg-slate-100 p-3 rounded-2xl">
                      <item.icon className="w-5 h-5 text-[#002D44]" />
                    </div>
                    <span className="text-[11px] font-black text-[#002D44] uppercase tracking-[0.14em]">{item.text}</span>
                  </div>
                ))}
              </div>

              <a
                href={`https://wa.me/5566996029294?text=Ola, gostaria de saber a disponibilidade para a acomodacao ${activeSuite.name}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 bg-[#002D44] text-white px-8 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#E31B23] transition-all shadow-2xl flex items-center justify-center gap-3 w-full"
              >
                Consultar Reserva
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-40 p-12 md:p-20 bg-[#002D44] rounded-[3rem] text-white flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transform rotate-12">
            <Sparkles size={250} />
          </div>
          <div className="max-w-2xl space-y-6 relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
              <Info className="w-4 h-4 text-[#FFD700]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Reserva Direta</span>
            </div>
            <h4 className="text-3xl md:text-5xl font-bold serif leading-tight">Garantia de Melhor Tarifa</h4>
            <p className="text-white/70 text-lg leading-relaxed font-light italic">
              "Com 76 unidades a disposicao, temos sempre a configuracao perfeita para sua necessidade. Fale agora
              com nossa recepcao e garanta seu lugar no coracao de Alto Araguaia."
            </p>
          </div>
          <div className="flex flex-col gap-4 min-w-[280px] relative z-10 w-full lg:w-auto">
            <a
              href="https://wa.me/5566996029294"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#E31B23] text-white px-10 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-center shadow-2xl hover:bg-[#c4161d] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
            >
              Reservar Agora
              <ChevronRight className="w-5 h-5" />
            </a>
            <p className="text-[10px] text-center text-white/40 uppercase font-bold tracking-widest">
              Central de Reservas: (66) 9 9602-9294
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Accommodations;
