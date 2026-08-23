export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export const FOOD_STATUS_LABELS: Record<string, string> = {
  recebido: "Recebido",
  preparando: "Preparando",
  pronto: "Pronto / a caminho",
  entregue: "Entregue",
};

export const FOOD_STATUS_COLORS: Record<string, string> = {
  recebido: "bg-slate-100 text-slate-700",
  preparando: "bg-amber-100 text-amber-700",
  pronto: "bg-emerald-100 text-emerald-700",
  entregue: "bg-hotel-100 text-hotel-700",
};
