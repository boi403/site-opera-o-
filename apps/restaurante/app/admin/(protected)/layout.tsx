import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSignOutButton from "../AdminSignOutButton";

const LAVANDERIA_URL = process.env.NEXT_PUBLIC_LAVANDERIA_URL || "http://localhost:3002";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/admin/login?erro=sem_acesso");
  }

  return (
    <div>
      <div className="bg-hotel-800 text-white">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="font-semibold">Painel administrativo — Restaurante</span>
            <a href={`${LAVANDERIA_URL}/admin`} className="hover:underline opacity-80">
              Lavanderia (LavaPronto)
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="opacity-80">{profile?.full_name}</span>
            <AdminSignOutButton />
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-10">{children}</div>
    </div>
  );
}
