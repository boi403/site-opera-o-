// Garante que redirecionamentos baseados em "?next=" só apontam para uma
// rota interna do próprio site — nunca para um domínio externo. Sem isso,
// um link como "/login?next=https://site-falso.com" faria o usuário ser
// redirecionado para fora do site depois de um login legítimo (open redirect).
export function safeNext(next: string | null | undefined, fallback = "/conta") {
  if (!next) return fallback;
  // Bloqueia qualquer forma de escapar para outro domínio: "//evil.com"
  // (protocol-relative), "https://evil.com" (URL absoluta), e variantes com
  // barra invertida como "/\/evil.com" — o parser de URL do navegador
  // normaliza "\" para "/", então isso viraria "//evil.com" na prática.
  if (
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\") ||
    next.includes("://")
  ) {
    return fallback;
  }
  return next;
}
