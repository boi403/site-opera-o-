import http from 'node:http';
import crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import { OAuth2Client } from 'google-auth-library';
import { getKnowledgeContext } from './shared/ai/hotelKnowledge.js';

try {
  // Em producao as variaveis costumam vir injetadas pela plataforma;
  // .env so existe (e so precisa ser lido) em ambiente local.
  process.loadEnvFile();
} catch {
  // Sem .env no diretorio (producao ou variaveis ja exportadas no shell).
}

const PORT = Number(process.env.AI_PORT || 3001);
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
const googleOAuthClient = googleClientId ? new OAuth2Client(googleClientId) : null;
const MAX_BODY_BYTES = Number(process.env.AI_MAX_BODY_BYTES || 12_000);
const RATE_LIMIT_WINDOW_MS = Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX = Number(process.env.AI_RATE_LIMIT_MAX || 30);
const ADMIN_SESSION_TTL_MS = Number(process.env.ADMIN_SESSION_TTL_MS || 8 * 60 * 60 * 1000);
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const rateLimitBuckets = new Map();
const adminSessions = new Map();

function getSecurityHeaders(req) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers.Vary = 'Origin';
  }

  return headers;
}

function sendJSON(req, res, status, payload) {
  res.writeHead(status, getSecurityHeaders(req));
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Payload too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function getClientKey(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
}

function isRateLimited(req) {
  const now = Date.now();
  const key = getClientKey(req);
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || now - bucket.startedAt > RATE_LIMIT_WINDOW_MS) {
    rateLimitBuckets.set(key, { count: 1, startedAt: now });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

function sanitizeText(value, maxLength = 500) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function sanitizeMessages(value) {
  if (!Array.isArray(value)) return [];

  return value.slice(-10).map((message) => ({
    role: message?.role === 'assistant' ? 'assistant' : 'user',
    text: sanitizeText(message?.text || '', 500),
  }));
}

function sanitizeBody(body) {
  return {
    ...body,
    message: sanitizeText(body?.message || '', 500),
    messages: sanitizeMessages(body?.messages),
    email: sanitizeText(body?.email || '', 160),
    password: sanitizeText(body?.password || '', 160),
    sessionToken: sanitizeText(body?.sessionToken || '', 240),
  };
}

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(String(left || ''), 'utf8');
  const rightBuffer = Buffer.from(String(right || ''), 'utf8');
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function normalizeAdminUsers(rawUsers) {
  if (!Array.isArray(rawUsers)) return [];

  return rawUsers
    .map((user) => ({
      name: sanitizeText(user?.name || 'Admin Araguaia', 80),
      email: sanitizeText(user?.email || '', 160).toLowerCase(),
      password: String(user?.password || ''),
      active: user?.active !== false,
    }))
    .filter((user) => user.email && user.password);
}

function getAdminUsers() {
  const users = [];

  if (process.env.ADMIN_USERS_JSON) {
    try {
      const parsed = JSON.parse(process.env.ADMIN_USERS_JSON);
      users.push(...normalizeAdminUsers(parsed));
    } catch {
      // Ignora erro de parse
    }
  }

  const fallbackEmail = sanitizeText(process.env.ADMIN_LOGIN_EMAIL || '', 160).toLowerCase();
  const fallbackPassword = String(process.env.ADMIN_LOGIN_PASSWORD || '');
  if (fallbackEmail && fallbackPassword) {
    if (!users.some(u => u.email === fallbackEmail)) {
      users.push({
        name: sanitizeText(process.env.ADMIN_LOGIN_NAME || 'Admin Araguaia', 80),
        email: fallbackEmail,
        password: fallbackPassword,
        active: true,
      });
    }
  }

  // E-mails autorizados padrão do hotel
  const defaultAdmins = [
    { name: 'Mateus Rezende', email: 'mateus.orezende@gmail.com', password: '', active: true },
    { name: 'Admin Araguaia', email: 'admin@palacioaraguaia.com', password: '', active: true },
  ];

  for (const def of defaultAdmins) {
    if (!users.some(u => u.email === def.email)) {
      users.push(def);
    }
  }

  return users;
}

function pruneAdminSessions() {
  const now = Date.now();
  for (const [token, session] of adminSessions.entries()) {
    if (!session || session.expiresAt <= now) {
      adminSessions.delete(token);
    }
  }
}

function createAdminSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
  const session = {
    sessionToken: token,
    expiresAt: new Date(expiresAt).toISOString(),
    user: {
      name: user.name || 'Admin Araguaia',
      email: user.email,
    },
  };
  adminSessions.set(token, { ...session, expiresAt });
  return session;
}

function getAdminSession(sessionToken) {
  if (!sessionToken) return null;
  const session = adminSessions.get(sessionToken);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    adminSessions.delete(sessionToken);
    return null;
  }

  return {
    sessionToken,
    expiresAt: new Date(session.expiresAt).toISOString(),
    user: session.user,
  };
}

async function generateText(systemInstruction, prompt, fallback) {
  if (!ai) return fallback;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.4,
        systemInstruction,
      },
    });

    return response.text || fallback;
  } catch {
    return fallback;
  }
}

async function handleConcierge(body) {
  const message = body.message || '';
  if (!message) {
    return {
      reply: 'Envie uma pergunta curta sobre hospedagem, horarios, servicos ou localizacao para eu ajudar.',
      escalated: false,
      suggestions: ['Horarios de check-in', 'Cafe da manha incluso?', 'Hotel aceita pet?'],
    };
  }

  const knowledge = getKnowledgeContext(message);
  const fallback =
    'Posso ajudar com horarios, servicos, localizacao e estrutura do hotel. Se precisar confirmar reserva ou regra especifica, fale com a recepcao no WhatsApp (66) 9 9602-9294.';
  const prompt = `Pergunta do hospede: ${message}\n\nBase de conhecimento:\n${knowledge
    .map((entry) => `- ${entry.title}: ${entry.content}`)
    .join('\n')}\n\nResponda em portugues, de forma curta, objetiva e cordial. Se houver duvida operacional, direcione para o WhatsApp.`;
  const reply = await generateText('Voce e o concierge virtual do hotel.', prompt, fallback);
  return {
    reply,
    escalated: /whatsapp|recepcao/i.test(reply),
    suggestions: ['Horarios de check-in', 'Cafe da manha incluso?', 'Hotel aceita pet?'],
  };
}

async function handleCopilot(body) {
  const message = body.message || '';
  const snapshot = JSON.stringify(body.snapshot || {}, null, 2);
  const fallback =
    'Priorize quartos bloqueados ou sujos, itens abaixo do minimo e manutencoes urgentes. Se quiser, pergunte por setor.';
  const prompt = `Pergunta operacional: ${message}\n\nSnapshot operacional:\n${snapshot}\n\nResponda em portugues com foco em acao pratica.`;
  const reply = await generateText('Voce e um copiloto operacional para hotelaria.', prompt, fallback);
  return {
    reply,
    tasks: ['Revisar quartos criticos', 'Checar estoque minimo', 'Priorizar manutencao urgente'],
    alerts: ['Monitorar gargalos de limpeza', 'Evitar ruptura de amenities'],
  };
}

async function handlePredict(body) {
  const snapshot = body.snapshot || {};
  const fallbackInsights = [
    {
      title: 'Ajuste de escala de limpeza',
      description: 'Concentre reforco nos andares com quartos sujos, bloqueados ou em limpeza para reduzir atraso de liberacao.',
      impact: 'ALTO',
      category: 'Equipe',
      actionLabel: 'Revisar escala',
    },
    {
      title: 'Reposicao antecipada de itens criticos',
      description: 'Itens abaixo do minimo devem ser repostos antes do pico de ocupacao para evitar ruptura operacional.',
      impact: 'ALTO',
      category: 'Estoque',
      actionLabel: 'Gerar compras',
    },
    {
      title: 'Ciclo preventivo de manutencao',
      description: 'Quartos com mais tempo sem manutencao preventiva merecem janela dedicada ainda nesta semana.',
      impact: 'MEDIO',
      category: 'Manutencao',
      actionLabel: 'Planejar manutencao',
    },
    {
      title: 'Acompanhamento de experiencia do hospede',
      description: 'Use o concierge para capturar duvidas recorrentes e transformar isso em melhorias de atendimento.',
      impact: 'MEDIO',
      category: 'Hospede',
      actionLabel: 'Ver analytics',
    },
  ];

  const prompt = `A partir deste snapshot operacional, gere 4 insights em JSON no formato [{"title":"","description":"","impact":"ALTO|MEDIO","category":"","actionLabel":""}]. Snapshot: ${JSON.stringify(
    snapshot,
  )}`;
  let insights = fallbackInsights;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      insights = JSON.parse(response.text || '[]');
    } catch {
      insights = fallbackInsights;
    }
  }

  return {
    insights: Array.isArray(insights) && insights.length ? insights.slice(0, 4) : fallbackInsights,
    metrics: [
      { label: 'Tempo Medio Limpeza', value: '17.2 min', trend: '-2%' },
      { label: 'Previsao de Ocupacao', value: '88%', trend: '+5%' },
      { label: 'Risco de Ruptura', value: 'Baixo', trend: '+1 item' },
      { label: 'Qualidade Operacional', value: '96.4%', trend: '+0.5%' },
    ],
  };
}

async function handleAnalytics(body) {
  const events = Array.isArray(body.events) ? body.events : [];
  const fallback = {
    summary: `Foram registrados ${events.length} eventos recentes de IA entre site e operacao.`,
    opportunities: [
      'Transformar duvidas repetidas em FAQ visivel',
      'Medir cliques para WhatsApp por origem',
      'Cruzar buscas internas com gargalos operacionais',
    ],
  };

  const prompt = `Analise estes eventos de IA do hotel e retorne JSON com {"summary":"","opportunities":["","",""]}. Eventos: ${JSON.stringify(
    events.slice(0, 100),
  )}`;

  if (!ai) return fallback;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(response.text || '{}');
    return {
      summary: parsed.summary || fallback.summary,
      opportunities: Array.isArray(parsed.opportunities) && parsed.opportunities.length
        ? parsed.opportunities.slice(0, 3)
        : fallback.opportunities,
    };
  } catch {
    return fallback;
  }
}

async function handleAdminLogin(body) {
  const users = getAdminUsers();
  if (!users.length) {
    return { statusCode: 503, payload: { error: 'Login admin indisponivel: configure ADMIN_USERS_JSON ou ADMIN_LOGIN_EMAIL/ADMIN_LOGIN_PASSWORD.' } };
  }

  const email = sanitizeText(body?.email || '', 160).toLowerCase();
  const password = String(body?.password || '');
  const user = users.find((candidate) => candidate.email === email);

  if (!user || !user.active || !safeCompare(user.password, password)) {
    return { statusCode: 401, payload: { error: 'Credenciais invalidas.' } };
  }

  pruneAdminSessions();
  const session = createAdminSession(user);
  return { statusCode: 200, payload: { session } };
}

async function handleAdminGoogleLogin(body) {
  const users = getAdminUsers();
  const credential = typeof body?.credential === 'string' ? body.credential : '';

  if (!googleOAuthClient) {
    return { statusCode: 503, payload: { error: 'Login com Google não configurado no servidor.' } };
  }

  if (!credential) {
    return { statusCode: 400, payload: { error: 'Credencial do Google não informada.' } };
  }

  let email;
  try {
    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    const claims = ticket.getPayload();
    if (!claims?.email || !claims.email_verified) {
      return { statusCode: 401, payload: { error: 'E-mail do Google não verificado.' } };
    }
    email = sanitizeText(claims.email, 160).toLowerCase();
  } catch {
    return { statusCode: 401, payload: { error: 'Credencial do Google inválida ou expirada.' } };
  }

  const user = users.find((candidate) => candidate.email === email);

  if (!user) {
    return {
      statusCode: 403,
      payload: {
        error: `Acesso negado: O e-mail "${email}" não possui cadastro como administrador autorizado.`,
      },
    };
  }

  if (!user.active) {
    return {
      statusCode: 403,
      payload: { error: 'Conta de administrador desativada. Contate a administração.' },
    };
  }

  pruneAdminSessions();
  const session = createAdminSession({
    name: body?.name || user.name || 'Admin Araguaia',
    email: user.email,
  });

  return { statusCode: 200, payload: { session } };
}

async function handleAdminSession(body) {
  pruneAdminSessions();
  const session = getAdminSession(body?.sessionToken || '');
  if (!session) {
    return { statusCode: 401, payload: { active: false } };
  }

  return { statusCode: 200, payload: { active: true, session } };
}

async function handleAdminLogout(body) {
  const token = body?.sessionToken || '';
  if (token) {
    adminSessions.delete(token);
  }

  return { statusCode: 200, payload: { ok: true } };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJSON(req, res, 204, {});
    return;
  }

  if (req.method !== 'POST') {
    sendJSON(req, res, 404, { error: 'Not found' });
    return;
  }

  if (req.headers.origin && !allowedOrigins.has(req.headers.origin)) {
    sendJSON(req, res, 403, { error: 'Origin not allowed' });
    return;
  }

  if (isRateLimited(req)) {
    sendJSON(req, res, 429, { error: 'Too many requests' });
    return;
  }

  try {
    const body = sanitizeBody(await parseBody(req));

    if (req.url === '/api/concierge') {
      sendJSON(req, res, 200, await handleConcierge(body));
      return;
    }

    if (req.url === '/api/admin/login') {
      const result = await handleAdminLogin(body);
      sendJSON(req, res, result.statusCode, result.payload);
      return;
    }

    if (req.url === '/api/admin/google-login') {
      const result = await handleAdminGoogleLogin(body);
      sendJSON(req, res, result.statusCode, result.payload);
      return;
    }

    if (req.url === '/api/admin/session') {
      const result = await handleAdminSession(body);
      sendJSON(req, res, result.statusCode, result.payload);
      return;
    }

    if (req.url === '/api/admin/logout') {
      const result = await handleAdminLogout(body);
      sendJSON(req, res, result.statusCode, result.payload);
      return;
    }

    if (req.url === '/api/copilot') {
      sendJSON(req, res, 200, await handleCopilot(body));
      return;
    }

    if (req.url === '/api/predict') {
      sendJSON(req, res, 200, await handlePredict(body));
      return;
    }

    if (req.url === '/api/analytics') {
      sendJSON(req, res, 200, await handleAnalytics(body));
      return;
    }

    sendJSON(req, res, 404, { error: 'Endpoint not found' });
  } catch (error) {
    const statusCode = Number(error?.statusCode || 500);
    sendJSON(req, res, statusCode, {
      error: statusCode === 500 ? 'Internal server error' : error.message,
    });
  }
});

server.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});
