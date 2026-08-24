import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Info, Navigation } from 'lucide-react';
import type { Map as LeafletMap, Marker } from 'leaflet';
import { touristSpotImages } from '../data/siteImages';

interface TouristSpot {
  id: string;
  title: string;
  desc: string;
  img: string;
  dist: string;
  type: 'car' | 'walk';
  latlng: [number, number];
  tag: string;
  mapQuery: string;
}

const TouristSpots: React.FC = () => {
  const [activeSpotId, setActiveSpotId] = useState<string>('boiadeiro');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const leafletRef = useRef<typeof import('leaflet') | null>(null);

  const hotelCoords: [number, number] = [-17.317027, -53.213689];

  const spots: TouristSpot[] = [
    {
      id: 'boiadeiro',
      title: 'Balneário Córrego Boiadeiro',
      desc: 'Atrativo urbano a cerca de 500 m do centro, procurado para banho, descanso e pausas rápidas durante a estadia.',
      img: touristSpotImages.balneario,
      dist: '500 m',
      type: 'walk',
      latlng: [-17.3145, -53.2084],
      tag: 'Centro',
      mapQuery: 'Balneario Corrego Boiadeiro, Alto Araguaia, MT',
    },
    {
      id: 'padres',
      title: 'Cachoeira dos Padres',
      desc: 'Queda do Rio Araguaia no bairro Gabiroba, de fácil acesso e uma das visitas mais simples para quem quer conhecer a cidade.',
      img: touristSpotImages.salto,
      dist: '500 m',
      type: 'walk',
      latlng: [-17.3202, -53.2072],
      tag: 'Mais Visitado',
      mapQuery: 'Cachoeira dos Padres, Alto Araguaia, MT',
    },
    {
      id: 'bilinao',
      title: 'Cachoeira do Estádio Bilinão',
      desc: 'Refúgio natural próximo da área urbana, citado pelo município como uma das quedas de fácil acesso no entorno do centro.',
      img: touristSpotImages.encontro,
      dist: '1 km',
      type: 'car',
      latlng: [-17.3242, -53.2205],
      tag: 'Urbano',
      mapQuery: 'Cachoeira do Estadio Bilinao, Alto Araguaia, MT',
    },
    {
      id: 'rio-araguaia',
      title: 'Cachoeira do Rio Araguaia',
      desc: 'Queda situada a cerca de 3 km do centro, boa opção para quem quer estender o roteiro sem sair muito da cidade.',
      img: touristSpotImages.ponton,
      dist: '3 km',
      type: 'car',
      latlng: [-17.3348, -53.2248],
      tag: 'Passeio',
      mapQuery: 'Cachoeira do Rio Araguaia, Alto Araguaia, MT',
    },
    {
      id: 'couto-magalhaes',
      title: 'Cachoeira Couto Magalhães',
      desc: 'Atrativo de natureza mais intensa, a 35 km do centro. O acesso final pede mais atenção e vale combinar apoio local antes de sair.',
      img: touristSpotImages.carapau,
      dist: '35 km',
      type: 'car',
      latlng: [-17.392, -53.358],
      tag: 'Aventura',
      mapQuery: 'Cachoeira Couto Magalhaes, Alto Araguaia, MT',
    },
    {
      id: 'gota-santa',
      title: 'Gruta da Gota Santa',
      desc: 'Opção para quem quer ampliar o roteiro regional. Fica na MT-100, em uma visita mais longa voltada à natureza e contemplação.',
      img: touristSpotImages['santa-barbara'],
      dist: '66 km',
      type: 'car',
      latlng: [-17.548, -53.051],
      tag: 'Regional',
      mapQuery: 'Gruta da Gota Santa, Alto Araguaia, MT',
    },
  ];

  const getDirectionsUrl = (spot: TouristSpot) =>
    `https://www.google.com/maps/dir/?api=1&origin=${hotelCoords[0]},${hotelCoords[1]}&destination=${encodeURIComponent(spot.mapQuery)}`;

  const activeSpot = spots.find((spot) => spot.id === activeSpotId) || spots[0];

  const buildSpotIcon = (L: typeof import('leaflet'), isActive: boolean) =>
    L.divIcon({
      html: `<div class="relative flex flex-col items-center transition-transform duration-300" style="transform:translateY(${isActive ? '-6px' : '0px'}) scale(${isActive ? '1.18' : '1'});">
              <div class="p-2 rounded-xl border-2 border-white bg-white text-[#E31B23] hover:scale-110 transition-transform cursor-pointer" style="box-shadow:0 14px 18px -6px rgba(227,27,35,0.5), 0 3px 6px rgba(0,0,0,0.2);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div class="w-4 h-1.5 rounded-full bg-black/20 blur-[2px] mt-0.5"></div>
            </div>`,
      className: '',
      iconSize: [36, 42],
      iconAnchor: [18, 24],
    });

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import('leaflet');
      if (cancelled || !mapContainerRef.current || mapInstanceRef.current) return;
      leafletRef.current = L;

      const map = L.map(mapContainerRef.current, {
        center: hotelCoords,
        zoom: 12,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const hotelIcon = L.divIcon({
      html: `<div class="relative flex flex-col items-center">
              <div class="bg-[#002D44] p-2.5 rounded-2xl shadow-2xl border-2 border-white flex flex-col items-center transform -translate-y-4 animate-bounce" style="box-shadow:0 18px 24px -8px rgba(0,45,68,0.65), 0 4px 8px rgba(0,0,0,0.25);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div class="w-6 h-2 rounded-full bg-black/25 blur-[3px]" style="transform:translateY(-2px);"></div>
            </div>`,
      className: '',
      iconSize: [44, 48],
      iconAnchor: [22, 26],
      });

      L.marker(hotelCoords, { icon: hotelIcon })
      .addTo(map)
      .bindPopup(
        '<div class="p-4 text-center"><p class="font-black text-[#002D44] text-[10px] uppercase tracking-widest">Sua localização</p><p class="text-sm font-bold text-slate-500">Araguaia Palace Hotel</p></div>',
      );

      spots.forEach((spot) => {
        const spotIcon = buildSpotIcon(L, spot.id === activeSpotId);

        const popupHtml = `
        <div style="width:320px;background:#ffffff;border-radius:28px;overflow:hidden;font-family:Inter,sans-serif;">
          <div style="position:relative;height:210px;overflow:hidden;background:#0f172a;">
            <img src="${spot.img}" alt="${spot.title}" style="width:100%;height:100%;object-fit:cover;display:block;" />
            <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(0,45,68,0.95), rgba(0,45,68,0.25), transparent);"></div>
            <div style="position:absolute;top:16px;left:16px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <span style="background:#FFD700;color:#002D44;padding:7px 12px;border-radius:999px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.22em;">
                ${spot.tag}
              </span>
              <span style="background:rgba(255,255,255,.92);color:#002D44;padding:7px 12px;border-radius:999px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.18em;">
                ${spot.type === 'walk' ? 'A pé' : 'Carro'}
              </span>
            </div>
            <div style="position:absolute;left:16px;right:16px;bottom:16px;color:#ffffff;">
              <p style="margin:0 0 6px 0;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.24em;color:rgba(255,255,255,.72);">Alto Araguaia</p>
              <h4 style="margin:0;font-family:'Playfair Display',serif;font-size:28px;line-height:1.05;font-weight:700;">${spot.title}</h4>
            </div>
          </div>
          <div style="padding:18px;">
            <div style="display:grid;grid-template-columns:1fr 92px;gap:10px;margin-bottom:14px;">
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:12px;">
                <p style="margin:0 0 5px 0;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.22em;color:#94a3b8;">Distância</p>
                <p style="margin:0;font-size:13px;font-weight:800;color:#002D44;">${spot.dist} do centro</p>
              </div>
              <div style="background:#002D44;border-radius:18px;padding:12px;text-align:center;">
                <p style="margin:0 0 5px 0;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.22em;color:rgba(255,255,255,.5);">Roteiro</p>
                <p style="margin:0;font-size:13px;font-weight:800;color:#FFD700;">${spot.type === 'walk' ? 'Curto' : 'Livre'}</p>
              </div>
            </div>
            <p style="margin:0 0 14px 0;font-size:13px;line-height:1.55;color:#475569;">
              ${spot.desc}
            </p>
            <div style="display:flex;gap:10px;align-items:center;">
              <a href="${getDirectionsUrl(spot)}" target="_blank" rel="noopener noreferrer" style="flex:1;background:#E31B23;color:#ffffff;padding:14px 12px;border-radius:18px;text-decoration:none;text-align:center;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.24em;">
                Ver rota
              </a>
              <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.mapQuery)}" target="_blank" rel="noopener noreferrer" style="background:#e2e8f0;color:#475569;padding:14px 12px;border-radius:18px;text-decoration:none;text-align:center;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.2em;min-width:88px;">
                Abrir
              </a>
            </div>
          </div>
        </div>
      `;

        const marker = L.marker(spot.latlng, { icon: spotIcon })
        .addTo(map)
        .on('click', () => {
          setActiveSpotId(spot.id);
        })
        .bindPopup(popupHtml, { className: 'custom-popup', maxWidth: 340, minWidth: 320 });

        markersRef.current[spot.id] = marker;
      });

      mapInstanceRef.current = map;
      markersRef.current[activeSpotId]?.openPopup();
    };

    initMap();

    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markersRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !leafletRef.current) return;

    const marker = markersRef.current[activeSpotId];
    if (!marker) return;

    const L = leafletRef.current;
    spots.forEach((spot) => {
      markersRef.current[spot.id]?.setIcon(buildSpotIcon(L, spot.id === activeSpotId));
    });

    mapInstanceRef.current.flyTo(activeSpot.latlng, activeSpot.id === 'gota-santa' ? 10 : 14, {
      duration: 1.1,
      easeLinearity: 0.25,
    });
    marker.openPopup();
  }, [activeSpot, activeSpotId]);

  return (
    <section id="pontos-turisticos" className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-[2px] bg-[#E31B23]"></div>
            <span className="text-[#E31B23] font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">
              Descubra Alto Araguaia
            </span>
            <div className="w-12 h-[2px] bg-[#E31B23]"></div>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-[#002D44] serif">Exploração Regional</h2>
          <div className="w-24 h-1.5 bg-[#FFD700] mx-auto mt-8 rounded-full"></div>
          <p className="text-slate-500 mt-8 max-w-3xl mx-auto text-lg italic serif">
            Atrativos destacados com base no roteiro turístico oficial do município de Alto Araguaia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div
            className="lg:col-span-8 h-[500px] md:h-[700px] rounded-[3rem] md:rounded-[4rem] overflow-hidden border-[10px] border-white bg-slate-100 z-10 relative"
            style={{ boxShadow: '0 40px 60px -20px rgba(0,45,68,0.45), 0 20px 30px -12px rgba(0,0,0,0.3)' }}
          >
            <div ref={mapContainerRef} className="w-full h-full" />

            <div className="absolute bottom-10 left-10 z-20 hidden md:block">
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-white shadow-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-[#002D44] rounded-full border-2 border-white shadow-md"></div>
                  <span className="text-xs font-bold text-[#002D44] uppercase tracking-wider">
                    Araguaia Palace Hotel
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-[#E31B23] rounded-full border-2 border-white shadow-md"></div>
                  <span className="text-xs font-bold text-[#002D44] uppercase tracking-wider">
                    Atrativos turísticos
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto max-h-[700px] pr-4 custom-scrollbar">
            {spots.map((spot) => (
              <div
                key={spot.id}
                onClick={() => setActiveSpotId(spot.id)}
                className={`overflow-hidden rounded-[2.5rem] transition-all text-left border cursor-pointer group animate-fade-up ${
                  activeSpotId === spot.id
                    ? 'bg-white border-[#E31B23] shadow-2xl shadow-[#E31B23]/10 translate-x-2'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xl'
                }`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={spot.img}
                    alt={spot.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#002D44] via-[#002D44]/30 to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="bg-[#FFD700] text-[#002D44] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.25em] shadow-lg">
                      {spot.tag}
                    </span>
                    <span className="bg-white/90 text-[#002D44] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.18em]">
                      {spot.type === 'walk' ? 'A pé' : 'Carro'}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70 mb-2">
                      Alto Araguaia
                    </p>
                    <h4 className="font-bold text-white text-2xl serif leading-tight drop-shadow-xl">
                      {spot.title}
                    </h4>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
                      <p className="text-[9px] uppercase tracking-[0.22em] font-black text-slate-400 mb-1">
                        Distância
                      </p>
                      <p className="text-sm font-bold text-[#002D44]">{spot.dist} do centro</p>
                    </div>
                    <div className="rounded-2xl bg-[#002D44] px-4 py-3 min-w-[96px] text-center shadow-lg">
                      <p className="text-[9px] uppercase tracking-[0.22em] font-black text-white/50 mb-1">
                        Roteiro
                      </p>
                      <p className="text-sm font-bold text-[#FFD700]">{spot.type === 'walk' ? 'Curto' : 'Livre'}</p>
                    </div>
                  </div>

                  <p className="text-[13px] text-slate-600 line-clamp-3 mb-6 leading-relaxed">
                    {spot.desc}
                  </p>

                  <div className="flex items-center gap-3">
                    <a
                      href={getDirectionsUrl(spot)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all ${
                        activeSpotId === spot.id
                          ? 'bg-[#E31B23] text-white shadow-xl shadow-[#E31B23]/20 hover:bg-[#c4161d]'
                          : 'bg-[#002D44] text-white hover:bg-[#E31B23]'
                      }`}
                    >
                      <Navigation className="w-4 h-4" />
                      Ver rota
                    </a>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveSpotId(spot.id);
                      }}
                      className={`px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.22em] transition-all ${
                        activeSpotId === spot.id
                          ? 'bg-[#FFD700] text-[#002D44]'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      Ver no mapa
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-6 p-10 bg-[#002D44] rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none transform rotate-12 group-hover:scale-125 transition-transform duration-1000">
                <Info size={180} />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="bg-[#FFD700] w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
                  <Info className="w-6 h-6 text-[#002D44]" />
                </div>
                <h4 className="text-2xl font-bold serif leading-tight">Dicas de Viagem</h4>
                <p className="text-sm text-white/70 leading-relaxed font-light italic">
                  Para os passeios mais longos, confirme condições de acesso e apoio local com a recepção antes
                  de sair.
                </p>
                <button
                  onClick={() => window.open('https://wa.me/5566996029294', '_blank')}
                  className="w-full py-4 bg-white/10 hover:bg-[#FFD700] hover:text-[#002D44] transition-all rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 border border-white/20"
                >
                  Falar com Concierge <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TouristSpots;
