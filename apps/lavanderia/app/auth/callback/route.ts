import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safeNext";

// Troca o code do OAuth (Google) pela sessão e decide para onde mandar o
// usuário: se o perfil ainda não tem telefone (Google não fornece isso),
// completa o cadastro antes de liberar o acesso.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", data.user.id)
        .single();

      if (!profile?.phone) {
        const url = new URL("/cadastro/completar", origin);
        url.searchParams.set("next", next);
        return NextResponse.redirect(url);
      }

      return NextResponse.redirect(new URL(next, origin));
    }
  }

  const errorUrl = new URL("/login", origin);
  errorUrl.searchParams.set("error", "auth");
  return NextResponse.redirect(errorUrl);
}
