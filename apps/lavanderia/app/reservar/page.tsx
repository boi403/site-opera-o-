import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ReservaForm from "./ReservaForm";

export default async function ReservarPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="max-w-lg mx-auto px-6 py-20">
      <span className="badge-gold mb-4">Nova reserva</span>
      <h1 className="text-3xl font-serif font-semibold text-hotel-900 mb-2">
        Reservar lavagem
      </h1>
      <p className="text-hotel-600 mb-8">
        Descreva sua roupa e nós cuidamos do resto. Você acompanha o status
        pela sua conta e recebe um aviso no WhatsApp quando estiver pronto.
      </p>

      {user ? (
        <ReservaForm />
      ) : (
        <div className="card-glass rounded-2xl p-8 text-center">
          <p className="mb-5 text-hotel-700">
            Você precisa entrar (ou criar uma conta) para reservar uma
            lavagem.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/login?next=/reservar" className="btn-primary">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-secondary">
              Criar conta
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
