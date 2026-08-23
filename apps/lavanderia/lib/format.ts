export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export const STATUS_LABELS: Record<string, string> = {
  recebido: "Recebido",
  lavando: "Lavando",
  pronto: "Pronto para retirada",
  entregue: "Entregue",
};

export const STATUS_COLORS: Record<string, string> = {
  recebido: "bg-slate-100 text-slate-700",
  lavando: "bg-blue-100 text-blue-700",
  pronto: "bg-emerald-100 text-emerald-700",
  entregue: "bg-hotel-100 text-hotel-700",
};

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
