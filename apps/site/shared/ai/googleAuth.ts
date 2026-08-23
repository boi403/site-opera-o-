export interface GoogleUserPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
  email_verified?: boolean;
}

export function parseJwt(token: string): GoogleUserPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as GoogleUserPayload;
  } catch (error) {
    console.error('Erro ao decodificar JWT Google:', error);
    return null;
  }
}

let scriptLoadPromise: Promise<void> | null = null;

export function loadGoogleScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).google?.accounts?.id) return Promise.resolve();

  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Falha ao carregar Google GIS')));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar Google GIS'));
      document.head.appendChild(script);
    });
  }

  return scriptLoadPromise;
}

export const DEFAULT_GOOGLE_CLIENT_ID = '309092794552-7c9mf8vqvs1hgqvcjn95q0mg0qmhucg5.apps.googleusercontent.com';

export function getGoogleClientId(): string {
  if (typeof window === 'undefined') return DEFAULT_GOOGLE_CLIENT_ID;
  const envClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || (window as any).__GOOGLE_CLIENT_ID__ || '';
  return (envClientId.trim() || DEFAULT_GOOGLE_CLIENT_ID);
}

export async function triggerGooglePopup(onSuccess: (user: GoogleUserPayload) => void, onError: (error: string) => void) {
  try {
    await loadGoogleScript();
    const google = (window as any).google;
    const clientId = getGoogleClientId();

    if (!google?.accounts?.oauth2) {
      throw new Error('Google SDK não carregado');
    }

    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'email profile openid',
      callback: async (tokenResponse: any) => {
        if (tokenResponse.error) {
          onError(tokenResponse.error_description || tokenResponse.error || 'Erro na autenticação com Google.');
          return;
        }

        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          });

          if (!res.ok) {
            throw new Error('Falha ao obter dados do perfil Google.');
          }

          const userInfo = await res.json();
          if (!userInfo.email) {
            throw new Error('E-mail não retornado pelo Google.');
          }

          onSuccess({
            email: userInfo.email,
            name: userInfo.name || userInfo.email.split('@')[0],
            picture: userInfo.picture,
            sub: userInfo.sub,
            email_verified: userInfo.email_verified,
          });
        } catch (err: any) {
          onError(err.message || 'Erro ao consultar perfil do Google.');
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: 'select_account' });
  } catch (err: any) {
    onError(err.message || 'Erro ao inicializar login com Google.');
  }
}

