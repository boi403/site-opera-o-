import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safeNext";
import CompletarCadastroForm from "./CompletarCadastroForm";

export default async function CompletarCadastroPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <span className="badge-gold mb-4">Quase lá</span>
      <h1 className="text-3xl font-serif font-semibold text-hotel-900 mb-2">
        Complete seu cadastro
      </h1>
      <p className="text-hotel-600 mb-8">
        Sua conta Google não nos conta seu WhatsApp — precisamos dele para
        avisar quando sua roupa estiver pronta.
      </p>

      <CompletarCadastroForm
        defaultFullName={profile?.full_name || user.user_metadata?.full_name || ""}
        defaultPhone={profile?.phone || ""}
        next={safeNext(searchParams.next)}
      />
    </div>
  );
}
