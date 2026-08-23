import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/format";
import AssinarButton from "./AssinarButton";
import TiltCard from "@/components/TiltCard";

export default async function PlanosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("active", true)
    .order("price_cents");

  const highlightIndex = plans && plans.length > 1 ? 1 : -1;

  return (
    <div className="relative max-w-4xl mx-auto px-6 py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-72 w-[36rem] rounded-full bg-hotel-300/25 blur-3xl"
      />
      <div className="relative text-center mb-14">
        <span className="badge-gold mb-4">Assinatura</span>
        <h1 className="text-4xl font-serif font-semibold text-hotel-900 mb-2">
          Planos mensais
        </h1>
        <p className="text-hotel-600 max-w-md mx-auto">
          Para quem lava roupa toda semana — pessoa física ou empresa.
        </p>
      </div>

      <div className="relative grid sm:grid-cols-2 gap-8">
        {plans?.map((plan, i) => {
          const highlighted = i === highlightIndex;
          return (
            <TiltCard key={plan.id} className="h-full">
              <div
                className={`relative flex h-full flex-col rounded-2xl p-8 transition-shadow ${
                  highlighted
                    ? "bg-hotel-900 text-white shadow-gold-lg"
                    : "card-glass"
                }`}
              >
                {highlighted && (
                  <span className="absolute -top-3 right-6 rounded-full bg-gold-gradient text-hotel-900 text-xs font-semibold uppercase tracking-wide px-3 py-1 shadow-gold">
                    Mais popular
                  </span>
                )}
                <span
                  className={`text-xs uppercase tracking-wide font-semibold mb-2 ${
                    highlighted ? "text-hotel-300" : "text-hotel-500"
                  }`}
                >
                  {plan.type === "empresa" ? "Empresas" : "Pessoa física"}
                </span>
                <h2
                  className={`text-2xl font-serif font-semibold mb-1 ${
                    highlighted ? "text-white" : "text-hotel-800"
                  }`}
                >
                  {plan.name}
                </h2>
                <p
                  className={`text-3xl font-semibold mb-4 ${
                    highlighted ? "text-gold-gradient" : "text-hotel-700"
                  }`}
                >
                  {formatBRL(plan.price_cents)}
                  <span
                    className={`text-sm font-normal ${
                      highlighted ? "text-hotel-400" : "text-hotel-500"
                    }`}
                  >
                    /mês
                  </span>
                </p>
                <p
                  className={`text-sm mb-6 flex-1 ${
                    highlighted ? "text-hotel-300" : "text-hotel-600"
                  }`}
                >
                  {plan.description}
                </p>
                <AssinarButton planId={plan.id} isLoggedIn={!!user} />
              </div>
            </TiltCard>
          );
        })}
      </div>
    </div>
  );
}
