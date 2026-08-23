export default function Footer() {
  return (
    <footer className="relative mt-16 bg-hotel-900 text-hotel-200">
      <div className="h-[3px] w-full bg-gold-gradient" aria-hidden />
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Araguaia Palace Hotel" className="h-8 w-auto object-contain" />
          <span className="font-serif text-lg text-white">
            Room Service
            <span className="block text-xs font-sans font-normal tracking-wide text-hotel-300">
              Restaurante do Hotel Araguaia Palace
            </span>
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-hotel-400">
            © {new Date().getFullYear()} Hotel Araguaia Palace
          </span>
          <a href="/admin/login" className="text-hotel-300 hover:text-white transition-colors">
            Acesso administrativo
          </a>
        </div>
      </div>
    </footer>
  );
}
