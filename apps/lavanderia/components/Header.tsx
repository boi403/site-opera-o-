import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-20 border-b border-hotel-200/70 bg-white/70 backdrop-blur-md shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset,0_12px_30px_-20px_rgba(0,45,68,0.35)]">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Araguaia Palace Hotel"
            className="h-9 w-auto object-contain transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105"
          />
          <span className="border-l border-hotel-200 pl-3 leading-tight">
            <span className="block text-xl font-serif font-bold text-hotel-900">
              LavaPronto
            </span>
            <span className="block text-[10px] tracking-widest text-hotel-500 uppercase font-semibold">
              Araguaia Palace Hotel
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <NavLink href="/reservar">Reservar lavagem</NavLink>
          <NavLink href="/planos">Planos</NavLink>
          {user ? (
            <NavLink href="/conta">Minha conta</NavLink>
          ) : (
            <>
              <NavLink href="/login">Entrar</NavLink>
              <Link href="/cadastro" className="btn-primary px-4 py-2 text-sm">
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group relative text-hotel-700 transition-colors hover:text-hotel-900">
      {children}
      <span className="pointer-events-none absolute -bottom-1 left-0 h-px w-0 bg-gold-gradient transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}
