
import React, { useEffect, useRef, useState } from 'react';
import { History, TrendingUp, Award, Camera, ArrowRight, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { hotelImages } from '../assets/hotel/images';

const AboutUs: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mainSlide, setMainSlide] = useState(0);

  const mainCarouselPhotos = [
    {
      url: hotelImages.texacoOne,
      alt: "Posto Texaco 1 - origem do Araguaia Palace Hotel"
    },
    {
      url: hotelImages.texacoMain,
      alt: "Posto Texaco - origem do Araguaia Palace Hotel"
    },
    {
      url: hotelImages.texacoOne,
      alt: "Construcao 1 do Araguaia Palace Hotel"
    },
    {
      url: hotelImages.constructionTwo,
      alt: "Construcao 2 do Araguaia Palace Hotel"
    },
    {
      url: hotelImages.constructionThree,
      alt: "Construcao 3 do Araguaia Palace Hotel"
    }
  ];

  const historicalPhotos = [
    {
      url: hotelImages.constructionThree,
      title: "O Marco Zero",
      desc: "Nossa fundação sobre os pilares de um antigo posto Texaco, o primeiro ponto de acolhimento em Alto Araguaia.",
      era: "Anos 70"
    },
    {
      url: hotelImages.texacoMain,
      title: "Construindo um Legado",
      desc: "Cada tijolo foi assentado com a visão de transformar o cansaço do viajante em repouso absoluto.",
      era: "Construção"
    },
    {
      url: hotelImages.texacoOne,
      title: "Parte da Construcao",
      desc: "Registro de uma etapa da construcao do hotel, marcando o crescimento das primeiras unidades.",
      era: "Inauguracao"
    },
    {
      url: hotelImages.facade,
      title: "O Araguaia Hoje",
      desc: "Um complexo de 76 suítes modernas, mantendo a mesma alma acolhedora de quatro décadas atrás.",
      era: "Atualidade"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === historicalPhotos.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? historicalPhotos.length - 1 : prev - 1));
  };

  const nextMainSlide = () => {
    setMainSlide((prev) => (prev === mainCarouselPhotos.length - 1 ? 0 : prev + 1));
  };

  const prevMainSlide = () => {
    setMainSlide((prev) => (prev === 0 ? mainCarouselPhotos.length - 1 : prev - 1));
  };

  useEffect(() => {
    let frameId = 0;

    const updateParallax = () => {
      const viewportHeight = window.innerHeight;

      // Parallax para a imagem principal
      if (sectionRef.current && mainImageRef.current) {
        const sectionRect = sectionRef.current.getBoundingClientRect();
        if (sectionRect.top < viewportHeight && sectionRect.bottom > 0) {
          const scrollProgress = (viewportHeight - sectionRect.top) / (viewportHeight + sectionRect.height);
          const offset = (scrollProgress - 0.5) * 60;
          mainImageRef.current.style.transform = `translateY(${offset}px)`;
        }
      }

      // Parallax para as imagens da galeria histórica
      if (galleryRef.current) {
        const galleryRect = galleryRef.current.getBoundingClientRect();
        if (galleryRect.top < viewportHeight && galleryRect.bottom > 0) {
          const galleryProgress = (viewportHeight - galleryRect.top) / (viewportHeight + galleryRect.height);
          const images = galleryRef.current.querySelectorAll('.parallax-img');
          const offset = (galleryProgress - 0.5) * 80; // Intensidade do movimento
          
          images.forEach((img) => {
            (img as HTMLElement).style.transform = `translateY(${offset}px) scale(1.1)`;
          });
        }
      }
    };

    const handleScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateParallax();
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMainSlide((prev) => (prev === mainCarouselPhotos.length - 1 ? 0 : prev + 1));
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [mainCarouselPhotos.length]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentSlide((prev) => (prev === historicalPhotos.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [historicalPhotos.length]);

  return (
    <section id="sobre-nós" ref={sectionRef} className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#E31B23]/10 text-[#E31B23] rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-8 animate-fade-up">
            <Award className="w-4 h-4" /> Tradição que Transforma
          </div>
          <h2 className="text-4xl md:text-7xl font-bold text-[#002D44] mb-8 serif animate-fade-up delay-100">Uma História de Fé e Trabalho</h2>
          <div className="w-24 h-1.5 bg-[#FFD700] mx-auto mb-10 rounded-full animate-scale delay-200"></div>
          
          <div className="max-w-3xl mx-auto relative animate-fade-up delay-300">
            <Quote className="absolute -top-6 -left-8 w-12 h-12 text-[#FFD700]/20 hidden md:block" />
            <p className="text-slate-600 text-xl md:text-2xl leading-relaxed italic serif font-light">
              "Nascemos no coração do Brasil, entre o asfalto e o rio, com a promessa de que cada hóspede encontraria aqui não apenas uma cama, mas um lar."
            </p>
          </div>
        </div>

        {/* Narrativa Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
          <div className="space-y-10">
            <div className="space-y-6 animate-fade-left delay-100">
              <h3 className="text-3xl font-bold text-[#002D44] serif border-l-8 border-[#E31B23] pl-6 py-2">
                Das Raízes do Posto Texaco...
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Tudo começou há <span className="text-[#002D44] font-bold">48 anos</span>. O Araguaia Palace Hotel não nasceu em pranchetas de luxo, mas na energia vibrante de um antigo posto Texaco. Naquela época, o fundador percebeu que Alto Araguaia precisava de algo mais: um refúgio que honrasse o viajante.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 animate-fade-left delay-200">
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 group hover:-translate-y-2 transition-transform duration-500">
                <div className="bg-[#FFD700]/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#FFD700] transition-colors">
                  <TrendingUp className="w-6 h-6 text-[#002D44]" />
                </div>
                <p className="text-4xl font-black text-[#002D44] mb-1">07</p>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Suítes de Origem</p>
              </div>
              <div className="bg-[#002D44] p-8 rounded-3xl shadow-2xl shadow-[#002D44]/20 border border-[#002D44] group hover:-translate-y-2 transition-transform duration-500">
                <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#E31B23] transition-colors">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <p className="text-4xl font-black text-[#FFD700] mb-1">76</p>
                <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Unidades de Modernidade</p>
              </div>
            </div>

            <div className="space-y-6 animate-fade-left delay-300">
              <h3 className="text-3xl font-bold text-[#002D44] serif border-l-8 border-[#FFD700] pl-6 py-2">
                ...ao Legado das 76 Suítes
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Nossa evolução é o reflexo de um lema familiar: <span className="italic font-medium text-[#E31B23]">"Tudo que merece ser feito, merece ser bem feito"</span>. De 7 pequenas unidades a um complexo de 76 suítes, cada passo foi dado com os pés no chão e os olhos na satisfação de quem nos visita.
              </p>
              <button className="flex items-center gap-4 bg-white text-[#002D44] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-[#002D44] hover:bg-[#002D44] hover:text-white transition-all shadow-lg group">
                Nossa Galeria Completa
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

          <div className="relative animate-fade-right">
             <div className="absolute -inset-6 bg-[#E31B23]/5 rounded-[4rem] rotate-3 -z-10"></div>
             <div className="absolute -inset-6 bg-[#FFD700]/5 rounded-[4rem] -rotate-3 -z-10"></div>
             <div className="relative bg-white p-5 rounded-[3rem] shadow-2xl border border-slate-100 will-change-transform" ref={mainImageRef} style={{ transition: 'transform 0.1s linear' }}>
                <div className="relative rounded-[2.5rem] w-full aspect-[4/3] overflow-hidden shadow-inner">
                  {mainCarouselPhotos.map((photo, idx) => (
                    <img
                      key={`${photo.url}-${idx}`}
                      src={photo.url}
                      alt={photo.alt}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
                        idx === mainSlide ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={prevMainSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-xl bg-black/40 text-white hover:bg-black/60 transition-colors flex items-center justify-center"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextMainSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-xl bg-black/40 text-white hover:bg-black/60 transition-colors flex items-center justify-center"
                    aria-label="Proxima foto"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                    {mainCarouselPhotos.map((photo, idx) => (
                      <button
                        key={`dot-${photo.url}-${idx}`}
                        type="button"
                        onClick={() => setMainSlide(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          idx === mainSlide ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Ir para foto ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-12 -right-8 bg-[#E31B23] text-white px-10 py-8 rounded-[2rem] shadow-2xl hidden md:block transform hover:scale-105 transition-transform">
                  <p className="text-5xl font-black mb-1">48</p>
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Anos de Histórias</p>
                </div>
             </div>
          </div>
        </div>

        {/* Galeria Histórica de Evolução com Parallax */}
        <div className="mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 animate-fade-up">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <Camera className="w-6 h-6 text-[#E31B23]" />
                <span className="text-[#E31B23] font-black uppercase tracking-[0.3em] text-[10px]">Acervo Araguaia Palace</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-[#002D44] serif leading-tight">Retratos da Nossa Jornada</h3>
              <p className="text-slate-500 mt-4 font-medium italic">"As fotos em preto e branco contam a verdade que as cores de hoje celebram."</p>
            </div>
            
            <div className="flex items-center gap-5">
              <button 
                onClick={prevSlide}
                className="w-14 h-14 rounded-2xl border-2 border-slate-200 flex items-center justify-center bg-white text-[#002D44] hover:bg-[#002D44] hover:text-white hover:border-[#002D44] transition-all shadow-xl group active:scale-95"
              >
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={nextSlide}
                className="w-14 h-14 rounded-2xl border-2 border-slate-200 flex items-center justify-center bg-white text-[#002D44] hover:bg-[#002D44] hover:text-white hover:border-[#002D44] transition-all shadow-xl group active:scale-95"
              >
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div ref={galleryRef} className="relative overflow-hidden rounded-[3.5rem] h-[600px] md:h-[650px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] bg-[#001a29]">
            {historicalPhotos.map((photo, idx) => (
              <div 
                key={idx}
                className={`absolute inset-0 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${
                  idx === currentSlide ? 'opacity-100 translate-x-0 scale-100' : 
                  idx < currentSlide ? 'opacity-0 -translate-x-full scale-105' : 'opacity-0 translate-x-full scale-105'
                }`}
              >
                <div className="relative w-full h-full overflow-hidden">
                  <div className={`absolute inset-0 z-10 bg-gradient-to-t from-[#002D44] via-[#002D44]/40 to-transparent ${idx < 3 ? 'sepia-[.2]' : ''}`}></div>
                  <img 
                    src={photo.url} 
                    alt={photo.title} 
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="parallax-img absolute inset-0 w-full h-[120%] object-cover transform scale-110 transition-transform duration-100 ease-linear"
                  />
                  
                  <div className="absolute top-10 left-10 z-20">
                    <div className="bg-[#FFD700] text-[#002D44] px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2">
                      <History className="w-4 h-4" />
                      {photo.era}
                    </div>
                  </div>

                  <div className="absolute bottom-16 left-10 md:left-20 right-10 md:right-20 z-20">
                    <h4 className="text-4xl md:text-6xl font-bold text-white mb-6 serif drop-shadow-2xl">
                      {photo.title}
                    </h4>
                    <div className="max-w-2xl bg-white/10 backdrop-blur-md p-8 rounded-3xl border-l-8 border-[#FFD700]">
                      <p className="text-white text-lg md:text-xl leading-relaxed font-light italic">
                        "{photo.desc}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-2">
            {historicalPhotos.map((photo, idx) => (
              <button
                key={`historical-dot-${photo.title}`}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentSlide ? 'bg-[#002D44] scale-110' : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Ir para slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutUs;



