import Link from "next/link";
import TiltCard from "@/components/TiltCard";

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="relative max-w-5xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
        {/* decorative depth blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-hotel-300/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-10 right-0 h-64 w-64 rounded-full bg-hotel-400/20 blur-3xl"
        />

        <div className="relative text-center lg:text-left">
          <span className="badge-gold mb-5">
            Serviço exclusivo do Hotel Araguaia Palace
          </span>
          <h1 className="text-5xl lg:text-6xl font-serif font-semibold text-hotel-900 mb-5 leading-[1.1]">
            A lavanderia do hotel, agora aberta{" "}
            <span className="text-gold-gradient">para toda a cidade</span>
          </h1>
          <p className="text-lg text-hotel-700 max-w-xl mx-auto lg:mx-0 mb-8">
            Hóspedes, moradores e empresas podem reservar a lavagem de roupas
            online. Avisamos por WhatsApp assim que ficar pronto para
            retirada.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <Link href="/reservar" className="btn-primary">
              Reservar lavagem
            </Link>
            <Link href="/planos" className="btn-secondary">
              Ver planos mensais
            </Link>
          </div>
        </div>

        {/* Floating 3D status card mockup */}
        <div className="relative hidden lg:flex justify-center perspective">
          <div className="animate-float preserve-3d">
            <TiltCard className="card-glass w-72 rounded-3xl p-6" glow>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-semibold uppercase tracking-wide text-hotel-500">
                  Pedido #A472
                </span>
                <span className="rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1">
                  Pronto
                </span>
              </div>
              <div className="space-y-3 mb-6">
                <StatusRow label="Recebido" done />
                <StatusRow label="Lavando" done />
                <StatusRow label="Pronto para retirada" done active />
                <StatusRow label="Entregue" />
              </div>
              <div className="rounded-xl bg-hotel-900 text-hotel-50 text-sm px-4 py-3 flex items-center gap-2">
                <span aria-hidden>📲</span>
                Aviso enviado no WhatsApp
              </div>
            </TiltCard>
            <div
              aria-hidden
              className="absolute -z-10 inset-4 rounded-3xl bg-gold-gradient blur-2xl opacity-40"
            />
          </div>
        </div>
      </section>

      <section className="relative bg-white/70 backdrop-blur-sm border-y border-hotel-200/70">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <span className="badge-gold mb-4">Como funciona</span>
            <h2 className="text-3xl font-serif font-semibold text-hotel-900">
              Do quarto (ou de casa) até a roupa pronta
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            <Feature
              number="1"
              title="Reserve online"
              text="Cadastre-se e envie sua roupa para lavar em poucos cliques, sem precisar ligar ou ir até a recepção."
            />
            <Feature
              number="2"
              title="Acompanhe o status"
              text="Veja em tempo real se sua roupa está recebida, lavando ou pronta para retirada."
            />
            <Feature
              number="3"
              title="Receba o aviso"
              text="Mandamos uma mensagem automática no WhatsApp assim que sua roupa estiver pronta."
            />
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <TiltCard className="rounded-3xl" glow={false}>
          <div className="relative overflow-hidden rounded-3xl bg-hotel-900 text-center px-8 py-16 shadow-gold-lg">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-hotel-400/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-hotel-300/10 blur-3xl"
            />
            <div className="relative">
              <h2 className="text-3xl font-serif font-semibold text-white mb-3">
                Lava roupa toda semana?{" "}
                <span className="text-gold-gradient">Assine um plano.</span>
              </h2>
              <p className="text-hotel-300 max-w-xl mx-auto mb-8">
                Planos mensais para pessoa física e para empresas da cidade,
                com cobrança automática e sem burocracia.
              </p>
              <Link href="/planos" className="btn-primary">
                Conhecer os planos
              </Link>
            </div>
          </div>
        </TiltCard>
      </section>
    </div>
  );
}

function StatusRow({
  label,
  done,
  active,
}: {
  label: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          active
            ? "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]"
            : done
              ? "bg-hotel-400"
              : "bg-hotel-200"
        }`}
      />
      <span
        className={`text-sm ${
          active ? "text-hotel-900 font-semibold" : done ? "text-hotel-600" : "text-hotel-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function Feature({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <TiltCard className="card-glass h-full rounded-2xl p-7">
      <span aria-hidden className="coin-3d mb-5">
        {number}
      </span>
      <h3 className="text-xl font-serif font-semibold text-hotel-900 mb-2">
        {title}
      </h3>
      <p className="text-hotel-600 text-sm leading-relaxed">{text}</p>
    </TiltCard>
  );
}
