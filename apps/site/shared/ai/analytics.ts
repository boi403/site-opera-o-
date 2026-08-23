export interface AnalyticsEvent {
  id: string;
  scope: 'site' | 'ops';
  type: string;
  label: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

const STORAGE_KEY = 'araguaia_ai_analytics';

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function trackAIEvent(scope: AnalyticsEvent['scope'], type: string, label: string, meta?: Record<string, unknown>) {
  if (!isBrowser()) return;

  const event: AnalyticsEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    scope,
    type,
    label,
    meta,
    createdAt: new Date().toISOString(),
  };

  const events = getAIEvents();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([event, ...events].slice(0, 250)));
}

export function getAIEvents(): AnalyticsEvent[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function summarizeAIEvents(events: AnalyticsEvent[]) {
  const totals = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([type, total]) => ({ type, total }));
}
