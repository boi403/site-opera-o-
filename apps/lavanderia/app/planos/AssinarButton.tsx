"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AssinarButton({
  planId,
  isLoggedIn,
}: {
  planId: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!isLoggedIn) {
      router.push("/login?next=/planos");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Não foi possível iniciar a assinatura.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn-primary w-full disabled:opacity-60"
      >
        {loading ? "Redirecionando..." : "Assinar este plano"}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
