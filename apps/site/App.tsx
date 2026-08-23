import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Home, ShieldCheck } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import TouristSpots from './components/TouristSpots';
import Services from './components/Services';
import Location from './components/Location';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdBanner from './components/AdBanner';
import { hotelImages } from './assets/hotel/images';
import ProfessionalTab from './components/ProfessionalTab';
import ChatWidget from './components/ChatWidget';
import {
  requestAdminLogin,
  requestAdminGoogleLogin,
  requestAdminLogout,
  type AdminSessionPayload,
  verifyAdminSession,
} from './shared/ai/client';
import {
  loadGoogleScript,
  parseJwt,
  getGoogleClientId,
  triggerGooglePopup,
  type GoogleUserPayload,
} from './shared/ai/googleAuth';

const ADMIN_SESSION_KEY = 'araguaia_site_admin_session_v2';

function readStoredAdminSession(): AdminSessionPayload | null {
  if (typeof localStorage === 'undefined') return null;

  const raw = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.sessionToken === 'string' &&
      typeof parsed?.expiresAt === 'string' &&
      typeof parsed?.user?.email === 'string' &&
      typeof parsed?.user?.name === 'string'
    ) {
      return parsed as AdminSessionPayload;
    }
  } catch {
    return null;
  }

  return null;
}

function persistAdminSession(session: AdminSessionPayload) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

function clearStoredAdminSession() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const AdminLogin: React.FC<{
  onLogin: (session: AdminSessionPayload) => void;
  onBackToHome: () => void;
}> = ({ onLogin, onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleProcessGoogleUser = async (googleUser: { email: string; name?: string; credential?: string }) => {
    setError('');
    setIsGoogleLoading(true);

    try {
      // A sessão só é criada pelo servidor, que verifica a assinatura do
      // token do Google (audience/expiração) antes de aceitar o login.
      // Nunca confie em um e-mail decodificado no cliente para autenticar.
      const response = await requestAdminGoogleLogin({
        name: googleUser.name || 'Admin Google',
        credential: googleUser.credential,
      });

      onLogin(response.session);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : '';
      setError(message || 'Não foi possível validar o login com Google. Tente novamente em instantes.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const clientId = getGoogleClientId();

    loadGoogleScript().then(() => {
      if (!isMounted) return;
      const google = (window as any).google;
      if (!google?.accounts?.id || !clientId) return;

      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential: string }) => {
            if (!response?.credential) return;
            const payload = parseJwt(response.credential);
            if (payload?.email) {
              handleProcessGoogleUser({
                email: payload.email,
                name: payload.name,
                credential: response.credential,
              });
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      } catch (err) {
        console.warn('Google GIS init:', err);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleGoogleClick = () => {
    setIsGoogleLoading(true);
    triggerGooglePopup(
      (googleUser) => {
        handleProcessGoogleUser(googleUser);
      },
      (errorMessage) => {
        setIsGoogleLoading(false);
        if (errorMessage.includes('popup_closed') || errorMessage.includes('access_denied')) {
          return;
        }
        setError('Não foi possível abrir o login do Google. Tente novamente.');
      }
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      const response = await requestAdminLogin({
        email: email.trim(),
        password,
      });
      onLogin(response.session);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Falha ao autenticar administrador.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4 py-16">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col items-center p-8 md:p-12 border border-slate-200 animate-scale">
        <button
          type="button"
          onClick={onBackToHome}
          className="self-start mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#002D44] transition-colors"
        >
          <Home className="w-4 h-4" />
          Voltar para o site
        </button>

        <div className="mb-8 bg-white w-24 h-24 rounded-[2rem] p-3 flex items-center justify-center shadow-2xl shadow-blue-500/20 border border-slate-100">
          <img src={hotelImages.logo} alt="Logo Araguaia Palace Hotel" className="w-full h-full object-contain" />
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.22em] mb-4">
            <ShieldCheck className="w-4 h-4" />
            Acesso restrito
          </div>
          <h2 className="text-slate-900 font-black text-3xl tracking-tighter">Palacio Araguaia</h2>
          <p className="text-slate-400 text-[10px] mt-1 font-black uppercase tracking-[0.3em]">
            Sistema de Gestao
          </p>
        </div>

        {/* Botão Oficial do Google */}
        <div className="w-full mb-6">
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isGoogleLoading || isSubmitting}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-slate-300 py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-sm active:scale-95 disabled:opacity-60"
          >
            <GoogleIcon className="w-5 h-5 shrink-0" />
            <span>{isGoogleLoading ? 'Verificando cadastro Google...' : 'Continuar com o Google'}</span>
          </button>
          <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
            * Somente e-mails Google pré-cadastrados têm permissão de acesso
          </p>
        </div>

        {/* Separador Visual */}
        <div className="w-full flex items-center gap-4 mb-6">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            ou acesse com senha
          </span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-2">
            <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
              }}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 font-bold"
              placeholder="nome@hotel.com"
              autoComplete="email"
              required
              disabled={isSubmitting || isGoogleLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError('');
                }}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 pr-14 text-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 font-bold"
                placeholder="********"
                autoComplete="current-password"
                required
                disabled={isSubmitting || isGoogleLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-xs font-bold text-red-700 leading-relaxed animate-fade-up">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-transform active:scale-95 disabled:opacity-60 shadow-lg shadow-blue-600/20"
            disabled={isSubmitting || isGoogleLoading}
          >
            {isSubmitting ? 'Validando acesso...' : 'Acessar Painel'}
          </button>
        </form>
      </div>
    </section>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'professional'>('home');
  const [shouldMountChat, setShouldMountChat] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isCheckingAdminSession, setIsCheckingAdminSession] = useState(true);
  const [adminSession, setAdminSession] = useState<AdminSessionPayload | null>(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAdminSession = async () => {
      const storedSession = readStoredAdminSession();
      if (!storedSession) {
        if (isMounted) setIsCheckingAdminSession(false);
        return;
      }

      try {
        const result = await verifyAdminSession({ sessionToken: storedSession.sessionToken });
        if (!isMounted) return;

        if (result.active && result.session) {
          setAdminSession(result.session);
          setIsAdminAuthenticated(true);
          persistAdminSession(result.session);
        } else {
          clearStoredAdminSession();
          setAdminSession(null);
          setIsAdminAuthenticated(false);
        }
      } catch {
        clearStoredAdminSession();
        setAdminSession(null);
        setIsAdminAuthenticated(false);
      } finally {
        if (isMounted) setIsCheckingAdminSession(false);
      }
    };

    bootstrapAdminSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const windowWithIdle = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (windowWithIdle.requestIdleCallback) {
      const idleId = windowWithIdle.requestIdleCallback(() => setShouldMountChat(true), { timeout: 2500 });
      return () => windowWithIdle.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(() => setShouldMountChat(true), 1200);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleAdminLogin = (session: AdminSessionPayload) => {
    persistAdminSession(session);
    setAdminSession(session);
    setIsAdminAuthenticated(true);
    setActiveTab('professional');
  };

  const handleAdminLogout = async () => {
    const sessionToken = adminSession?.sessionToken;

    clearStoredAdminSession();
    setAdminSession(null);
    setIsAdminAuthenticated(false);

    if (sessionToken) {
      try {
        await requestAdminLogout({ sessionToken });
      } catch {
        // Logout local ja finalizado; ignorar erro de rede.
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={setActiveTab} activeTab={activeTab} />

      <main className="flex-grow">
        {activeTab === 'home' ? (
          <>
            <Hero />
            <AboutUs />
            <AdBanner />
            <TouristSpots />
            <Services />
            <Location />
            <FAQ />
            <Contact />
          </>
        ) : isCheckingAdminSession ? (
          <section className="min-h-screen bg-slate-100 flex items-center justify-center">
            <div className="bg-white border border-slate-200 rounded-3xl px-10 py-12 text-center shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-3">Acesso administrativo</p>
              <p className="text-slate-700 font-bold">Validando sessao...</p>
            </div>
          </section>
        ) : isAdminAuthenticated ? (
          <ProfessionalTab onBackToHome={() => setActiveTab('home')} onLogout={handleAdminLogout} />
        ) : (
          <AdminLogin
            onLogin={handleAdminLogin}
            onBackToHome={() => setActiveTab('home')}
          />
        )}
      </main>

      <Footer />
      {shouldMountChat && <ChatWidget />}
    </div>
  );
};

export default App;
