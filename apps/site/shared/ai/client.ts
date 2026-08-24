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

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${AI_API_URL}${path}`, {
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
    const errorMessage = parsed?.error || parsed?.message;
    throw new Error(typeof errorMessage === 'string' ? errorMessage : `Erro HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
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

// Login admin: SEMPRE validado no servidor (ai-server.mjs). Nunca adicione
// um fallback client-side que aceite e-mail/credencial sem checagem real —
// isso já foi um bug de seguranca grave neste arquivo (auth bypass).
export async function requestAdminLogin(payload: { email: string; password: string }) {
  return postJSON<{ session: AdminSessionPayload }>('/api/admin/login', payload);
}

export async function requestAdminGoogleLogin(payload: { name?: string; credential?: string }) {
  return postJSON<{ session: AdminSessionPayload }>('/api/admin/google-login', payload);
}

export async function verifyAdminSession(payload: { sessionToken: string }) {
  return postJSON<{ active: boolean; session?: AdminSessionPayload }>('/api/admin/session', payload);
}

export async function requestAdminLogout(payload: { sessionToken: string }) {
  return postJSON<{ ok: boolean }>('/api/admin/logout', payload);
}
