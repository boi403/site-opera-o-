export interface AIChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface AdminSessionPayload {
  sessionToken: string;
  expiresAt: string;
  user: {
    name: string;
    email: string;
  };
}

const configuredApiUrl = ((globalThis as any).__AI_API_URL__ || '').trim();
const AI_API_URL = configuredApiUrl.replace(/\/+$/, '');

async function doFetch<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
    if (parsed?.error || parsed?.message) {
      throw new Error(String(parsed.error || parsed.message));
    }
    if (text.includes('<!DOCTYPE') || text.includes('<html') || response.status === 404) {
      throw new Error('Serviço de autenticação temporariamente indisponível. Verifique suas credenciais.');
    }
    throw new Error(`Erro HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// Endpoints de IA (concierge/copilot/etc.) rodam no ai-server.mjs (Node),
// que pode estar em outra origem — por isso usam AI_API_URL.
async function postJSON<T>(path: string, body: unknown): Promise<T> {
  return doFetch<T>(`${AI_API_URL}${path}`, body);
}

// api/auth.php roda no MESMO hosting PHP que serve o site (kinghost), nunca
// no ai-server.mjs — por isso é sempre same-origin, sem prefixo de AI_API_URL.
//
// NUNCA fabrique um sessionToken aqui no cliente caso a resposta não traga
// 'session' — um token de sessão só é válido se foi gerado E persistido pelo
// servidor (tabela admin_sessions). Um token inventado no navegador não bate
// com nada no banco e não passa numa verificação real, mas ainda assim é o
// mesmo tipo de bypass já corrigido várias vezes neste arquivo.
async function postAdminJSON<T>(path: string, body: unknown): Promise<T> {
  return doFetch<T>(path, body);
}

export async function requestConciergeReply(payload: {
  message: string;
  messages: AIChatMessage[];
}) {
  return postJSON<{ reply: string; escalated?: boolean; suggestions?: string[] }>('/api/concierge', payload);
}

export async function requestOperationalCopilot(payload: {
  message: string;
  snapshot: unknown;
  messages: AIChatMessage[];
}) {
  return postJSON<{ reply: string; tasks?: string[]; alerts?: string[] }>('/api/copilot', payload);
}

export async function requestPredictiveInsights(payload: { snapshot: unknown }) {
  return postJSON<{
    insights: Array<{
      title: string;
      description: string;
      impact: 'ALTO' | 'MEDIO';
      category: string;
      actionLabel: string;
    }>;
    metrics: Array<{ label: string; value: string; trend: string }>;
  }>('/api/predict', payload);
}

export async function requestAIAnalytics(payload: { events: unknown[]; snapshot?: unknown }) {
  return postJSON<{
    summary: string;
    opportunities: string[];
  }>('/api/analytics', payload);
}

// Login admin: SEMPRE validado no servidor (api/auth.php, PHP no kinghost).
// Nunca adicione um fallback client-side que aceite e-mail/credencial sem
// checagem real — isso já foi um bug de seguranca grave neste arquivo
// (auth bypass), duas vezes.
export async function requestAdminLogin(payload: { email: string; password: string }) {
  return postAdminJSON<{ session: AdminSessionPayload }>('/api/auth.php?action=login', payload);
}

export async function requestAdminGoogleLogin(payload: { name?: string; credential?: string }) {
  return postAdminJSON<{ session: AdminSessionPayload }>('/api/auth.php?action=google-login', payload);
}

export async function verifyAdminSession(payload: { sessionToken: string }) {
  return postAdminJSON<{ active: boolean; session?: AdminSessionPayload }>('/api/auth.php?action=session', payload);
}

export async function requestAdminLogout(payload: { sessionToken: string }) {
  return postAdminJSON<{ ok: boolean }>('/api/auth.php?action=logout', payload);
}
