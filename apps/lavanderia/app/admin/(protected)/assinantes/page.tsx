import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/format";

export default async function AdminAssinantesPage() {
  const supabase = createClient();

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*, plans(*), profiles(full_name, phone, is_company, company_name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-serif font-semibold text-hotel-800 mb-6">
        Assinantes dos planos
      </h1>

      <div className="space-y-3">
        {subscriptions && subscriptions.length > 0 ? (
          subscriptions.map((s: any) => (
            <div
              key={s.id}
              className="bg-white border border-hotel-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-hotel-800">
                  {s.profiles?.company_name || s.profiles?.full_name}
                </p>
                <p className="text-sm text-hotel-600">
                  {s.plans?.name} · {formatBRL(s.plans?.price_cents || 0)}/mês
                </p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-hotel-100 text-hotel-700 capitalize">
                {s.status}
              </span>
            </div>
          ))
        ) : (
          <p className="text-hotel-500 text-sm">Nenhum assinante ainda.</p>
        )}
      </div>
    </div>
  );
}
