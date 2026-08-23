
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Bed, Wrench, Package, Users, LogOut, Search,
  CheckSquare, BarChart3, GlassWater, Building2, BookOpen, FileText,
  Moon, Sun, ShieldCheck, Eye, EyeOff, Bell, User as UserIcon, Menu, X,
  Cloud, CloudOff, RefreshCw, Settings, Database, Wind, Sparkles
} from 'lucide-react';
import { User, UserRole, PermissionModule, SystemConfig } from './types';
import { MOCK_LOGBOOK, MOCK_MAINTENANCE, MOCK_ROOMS, MOCK_STOCK } from './constants';
import { DatabaseService } from './database';
import { ToastProvider, useToast } from './context/ToastContext'; // Importar Toast
import { scoreSearch, SearchResultItem } from '../shared/ai/search';
import { trackAIEvent } from '../shared/ai/analytics';
import logoAraguaia from './assets/logo-removebg-preview.png';

// Pages
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Housekeeping from './pages/Housekeeping';
import Maintenance from './pages/Maintenance';
import Inventory from './pages/Inventory';
import Performance from './pages/Performance';
import TeamManagement from './pages/TeamManagement';
import Minibar from './pages/Minibar';
import Logbook from './pages/Logbook';
import Reports from './pages/Reports';
import ACManagement from './pages/ACManagement';
import AIInsights from './pages/AIInsights';

const BrandMark: React.FC<{ size?: 'sm' | 'md'; tileClassName?: string }> = ({ size = 'md', tileClassName = '' }) => {
  const sizeClasses = size === 'sm' ? 'w-12 h-12 rounded-2xl p-2.5' : 'w-24 h-24 rounded-[2rem] p-3';

  return (
    <div className={`${sizeClasses} bg-white flex items-center justify-center shadow-2xl shadow-blue-500/20 ${tileClassName}`}>
      <img src={logoAraguaia} alt="Logo Araguaia Palace Hotel" className="w-full h-full object-contain" />
    </div>
  );
};

const BrandTitle: React.FC<{ compact?: boolean; centered?: boolean }> = ({ compact = false, centered = false }) => (
  <div className={centered ? 'text-center' : ''}>
    <h2 className={`${compact ? 'text-lg' : 'text-3xl'} text-slate-900 dark:text-white font-black tracking-tighter`}>
      Palacio Araguaia
    </h2>
    <p className={`${compact ? 'text-[9px]' : 'text-[10px]'} text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em]`}>
      Sistema de Gestao
    </p>
  </div>
);

const AdSenseWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: any;
    
    const checkAndPush = () => {
      // Verifica se o elemento existe e se tem largura maior que zero
      if (containerRef.current && containerRef.current.offsetWidth > 0) {
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          console.error("Erro ao carregar AdSense:", e);
        }
      } else {
        // Se a largura ainda for zero (por causa de animações ou renderização), tenta novamente em 100ms
        timer = setTimeout(checkAndPush, 100);
      }
    };

    // Inicia a verificação com um pequeno delay inicial
    timer = setTimeout(checkAndPush, 300);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full overflow-hidden flex justify-center" style={{ minHeight: '250px' }}>
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%', height: '280px' }}
           data-ad-format="rectangle"
           data-ad-client="ca-pub-2091933256294245"
           data-ad-slot="7199067151"
           data-full-width-responsive="true"></ins>
    </div>
  );
};

import { signInWithEmailPassword, signInWithGoogle, setupPassword, sendPasswordReset, getUserProfile, getAllUserProfiles, watchAuthState, signOutUser } from './lib/authService';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

// Componente Wrapper para usar o Toast no Login
const LoginWrapper: React.FC<{
  onLogin: (u: User) => void;
  toggleDarkMode: () => void;
  darkMode: boolean;
}> = ({ onLogin, toggleDarkMode, darkMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recoverEmail, setRecoverEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'recover' | 'setup'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { addToast } = useToast();

  const handleGoogleClick = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.user) {
        addToast(`Bem-vindo(a) de volta, ${result.user.name.split(' ')[0]}!`, 'SUCCESS');
        onLogin(result.user);
        return;
      }
      if (result.error) addToast(result.error, 'ERROR');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await signInWithEmailPassword(email, password);
      if (response.user) {
        addToast(`Bem-vindo de volta, ${response.user.name.split(' ')[0]}!`, 'SUCCESS');
        onLogin(response.user);
        return;
      }
      addToast(response.error || 'E-mail ou senha incorretos.', 'ERROR');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      addToast('A senha precisa ter pelo menos 6 caracteres.', 'WARNING');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await setupPassword(email, password);
      if (response.user) {
        addToast(`Acesso criado! Bem-vindo(a), ${response.user.name.split(' ')[0]}!`, 'SUCCESS');
        onLogin(response.user);
        return;
      }
      addToast(response.error || 'Não foi possível criar o acesso.', 'ERROR');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = recoverEmail.trim().toLowerCase();
    if (!normalizedEmail) return;

    setIsSubmitting(true);
    try {
      await sendPasswordReset(normalizedEmail);
    } catch {
      // Não revela se o e-mail existe ou não — mesma mensagem em ambos os casos.
    } finally {
      addToast('Se o e-mail tiver uma conta, enviamos um link de redefinição de senha.', 'SUCCESS');
      setAuthMode('login');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-500">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col items-center p-8 md:p-12 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-500">
          <div className="mb-6 transform -rotate-3 transition-transform hover:rotate-0 cursor-pointer">
            <BrandMark size="md" />
          </div>
          <h2 className="text-slate-900 dark:text-white font-black text-3xl mb-1 text-center tracking-tighter">Palácio Araguaia</h2>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] mb-8 text-center font-black uppercase tracking-[0.3em]">Sistema de Gestão</p>
          
          {authMode === 'login' && (
          <div className="w-full space-y-6">
            {/* Botão Oficial do Google */}
            <div className="w-full">
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isGoogleLoading || isSubmitting}
                className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-sm active:scale-95 disabled:opacity-60"
              >
                <GoogleIcon className="w-5 h-5 shrink-0" />
                <span>{isGoogleLoading ? 'Verificando cadastro Google...' : 'Continuar com o Google'}</span>
              </button>
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2 font-medium">
                * Acesso liberado apenas para e-mails cadastrados na equipe
              </p>
            </div>

            {/* Separador Visual */}
            <div className="w-full flex items-center gap-4">
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                ou acesse com senha
              </span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            </div>

            <form onSubmit={handleLoginSubmit} className="w-full space-y-5">
              <div className="space-y-2">
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">E-mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-black border-none rounded-2xl py-4 px-6 text-sm dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500 font-bold" placeholder="nome@hotel.com" required />
              </div>
              <div className="space-y-2">
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Senha</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-black border-none rounded-2xl py-4 px-6 text-sm dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500 font-bold" placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting || isGoogleLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-transform active:scale-95 disabled:opacity-60 shadow-lg shadow-blue-600/20">{isSubmitting ? 'Entrando...' : 'Acessar Painel'}</button>
              <div className="flex items-center justify-between gap-4">
                <button type="button" onClick={() => { setRecoverEmail(email); setAuthMode('recover'); }} className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest hover:underline text-left">Esqueci minha senha</button>
                <button type="button" onClick={() => setAuthMode('setup')} className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest hover:underline text-right">Primeiro acesso</button>
              </div>
            </form>
          </div>
          )}

          {authMode === 'recover' && (
            <form onSubmit={handleRecoverSubmit} className="w-full space-y-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                Informe o e-mail cadastrado. O sistema envia um link seguro para redefinir a senha.
              </p>
              <div className="space-y-2">
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">E-mail cadastrado</label>
                <input type="email" value={recoverEmail} onChange={(e) => setRecoverEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-black border-none rounded-2xl py-5 px-6 text-sm dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500 font-bold" placeholder="nome@hotel.com" required />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-transform active:scale-95 disabled:opacity-60">{isSubmitting ? 'Enviando...' : 'Enviar recuperacao'}</button>
              <button type="button" onClick={() => setAuthMode('login')} className="w-full text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-blue-500">Voltar ao login</button>
            </form>
          )}

          {authMode === 'setup' && (
            <form onSubmit={handleSetupSubmit} className="w-full space-y-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                Defina sua senha de acesso. Só funciona se o seu e-mail já foi cadastrado como colaborador pelo administrador do sistema.
              </p>
              <div className="space-y-2">
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">E-mail cadastrado pelo administrador</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-black border-none rounded-2xl py-5 px-6 text-sm dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500 font-bold" placeholder="nome@hotel.com" required />
              </div>
              <div className="space-y-2">
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Escolha uma senha</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-black border-none rounded-2xl py-5 px-6 text-sm dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500 font-bold" placeholder="Mínimo 6 caracteres" required />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-transform active:scale-95 disabled:opacity-60">{isSubmitting ? 'Criando acesso...' : 'Criar acesso'}</button>
              <button type="button" onClick={() => setAuthMode('login')} className="w-full text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-blue-500">Voltar ao login</button>
            </form>
          )}
          <button onClick={toggleDarkMode} className="mt-10 text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-3">{darkMode ? <Sun size={14} /> : <Moon size={14} />} Visual {darkMode ? 'Claro' : 'Escuro'}</button>
        </div>
        
        {/* Espaço Publicitário - Design Retangular */}
        <div className="mt-6 w-full max-w-md bg-white/50 dark:bg-slate-900/30 p-4 rounded-xl border dark:border-slate-800/50 shadow-sm overflow-hidden">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Espaço Publicitário</p>
          <div className="min-h-[250px] w-full block bg-slate-100 dark:bg-black/20 rounded-lg overflow-hidden">
            <AdSenseWidget />
          </div>
        </div>
      </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [dbConfig, setDbConfig] = useState<SystemConfig>(DatabaseService.getConfig());

  const refreshTeam = async () => {
    try {
      setAllUsers(await getAllUserProfiles());
    } catch {
      // Sem permissão de leitura (ex: usuário não-admin) — mantém a lista atual.
    }
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('araguaia_dark_mode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) document.documentElement.classList.add('dark');

    // A sessao e mantida pelo proprio Firebase Auth (persistencia local do
    // SDK), nao mais por um objeto de usuario salvo a mao no localStorage.
    const unsubscribe = watchAuthState(async (firebaseUser) => {
      if (!firebaseUser?.email) {
        setUser(null);
        setAllUsers([]);
        setAuthChecked(true);
        return;
      }
      try {
        const profile = await getUserProfile(firebaseUser.email);
        if (profile?.active) {
          setUser(profile);
          refreshTeam();
        } else {
          setUser(null);
          await signOutUser();
        }
      } finally {
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newConfig: SystemConfig = {
      apiUrl: formData.get('apiUrl') as string,
      syncEnabled: formData.get('syncEnabled') === 'on',
      lastSync: new Date().toISOString()
    };
    DatabaseService.setConfig(newConfig);
    setDbConfig(newConfig);
    setShowCloudModal(false);
    // Note: Can't use toast here easily without wrapper, falling back to alert for this system modal
    alert("Configurações de banco de dados Render salvas com sucesso.");
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('araguaia_dark_mode', String(newMode));
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleLogin = (u: User) => {
    setUser(u);
    refreshTeam();
  };

  const logout = () => { signOutUser(); setUser(null); setAllUsers([]); };

  const hasPermission = (module: PermissionModule) => user?.permissions?.includes(module) || false;

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <HashRouter>
        {!user ? (
          <LoginWrapper
            onLogin={handleLogin}
            toggleDarkMode={toggleDarkMode}
            darkMode={darkMode}
          />
        ) : (
          <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-500 font-sans">
            <Sidebar user={user} onLogout={logout} darkMode={darkMode} onToggleDark={toggleDarkMode} hasPermission={hasPermission} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Navbar user={user} config={dbConfig} onOpenCloud={() => setShowCloudModal(true)} />
              <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
                <Routes>
                  <Route path="/" element={<Navigate to={hasPermission('dashboard') ? '/dashboard' : '/rooms'} />} />
                  <Route path="/dashboard" element={hasPermission('dashboard') ? <Dashboard user={user} /> : <Navigate to="/rooms" />} />
                  <Route path="/rooms" element={hasPermission('rooms') ? <Rooms user={user} /> : <Navigate to="/" />} />
                  <Route path="/housekeeping" element={hasPermission('housekeeping') ? <Housekeeping user={user} /> : <Navigate to="/rooms" />} />
                  <Route path="/minibar" element={hasPermission('minibar') ? <Minibar user={user} /> : <Navigate to="/rooms" />} />
                  <Route path="/maintenance" element={hasPermission('maintenance') ? <Maintenance user={user} /> : <Navigate to="/rooms" />} />
                  <Route path="/ac_management" element={hasPermission('maintenance') || hasPermission('admin' as any) ? <ACManagement user={user} /> : <Navigate to="/rooms" />} />
                  <Route path="/ai_insights" element={hasPermission('admin' as any) || hasPermission('dashboard') ? <AIInsights user={user} /> : <Navigate to="/rooms" />} />
                  <Route path="/inventory" element={hasPermission('inventory') ? <Inventory user={user} /> : <Navigate to="/rooms" />} />
                  <Route path="/logbook" element={hasPermission('logbook') ? <Logbook user={user} /> : <Navigate to="/rooms" />} />
                  <Route path="/reports" element={hasPermission('reports') ? <Reports user={user} /> : <Navigate to="/rooms" />} />
                  <Route path="/performance" element={hasPermission('performance') ? <Performance user={user} /> : <Navigate to="/rooms" />} />
                  <Route path="/team" element={hasPermission('team') ? <TeamManagement user={user} allUsers={allUsers} onUsersChanged={refreshTeam} /> : <Navigate to="/rooms" />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </div>
        )}

        {showCloudModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-lg overflow-hidden border dark:border-slate-800 shadow-2xl">
              <div className="p-10 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20"><Database size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Conexão Render.com</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Banco de Dados Cloud</p>
                  </div>
                </div>
                <button onClick={() => setShowCloudModal(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleUpdateConfig} className="p-10 space-y-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">URL da API (Backend no Render)</label>
                  <input name="apiUrl" defaultValue={dbConfig.apiUrl} className="w-full bg-slate-50 dark:bg-black px-6 py-4 rounded-2xl text-sm dark:text-white font-bold border-2 border-slate-100 dark:border-slate-800 outline-none focus:border-blue-500 transition-all" placeholder="https://seu-projeto.onrender.com" />
                </div>
                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-black/30 rounded-3xl border dark:border-slate-800">
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase">Sincronização Ativa</p>
                    <p className="text-[10px] font-bold text-slate-400">Salvar dados no Render automaticamente</p>
                  </div>
                  <input name="syncEnabled" type="checkbox" defaultChecked={dbConfig.syncEnabled} className="w-6 h-6 rounded-lg border-2 border-blue-600 bg-transparent text-blue-600 focus:ring-0 cursor-pointer" />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">Salvar Configuração</button>
              </form>
            </div>
          </div>
        )}
      </HashRouter>
    </ToastProvider>
  );
};

const Sidebar: React.FC<{ 
  user: User; 
  onLogout: () => void; 
  darkMode: boolean; 
  onToggleDark: () => void;
  hasPermission: (module: PermissionModule) => boolean;
}> = ({ user, onLogout, darkMode, onToggleDark, hasPermission }) => {
  const location = useLocation();
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' as PermissionModule },
    { path: '/ai_insights', label: 'Cérebro IA', icon: Sparkles, module: 'ai_insights' as any }, // Manual permission check
    { path: '/rooms', label: 'Quartos', icon: Bed, module: 'rooms' as PermissionModule },
    { path: '/housekeeping', label: 'Limpeza', icon: CheckSquare, module: 'housekeeping' as PermissionModule },
    { path: '/minibar', label: 'Frigobar', icon: GlassWater, module: 'minibar' as PermissionModule },
    { path: '/maintenance', label: 'Manutenção', icon: Wrench, module: 'maintenance' as PermissionModule },
    { path: '/ac_management', label: 'Ar Condicionado', icon: Wind, module: 'maintenance' as PermissionModule },
    { path: '/inventory', label: 'Estoque', icon: Package, module: 'inventory' as PermissionModule },
    { path: '/logbook', label: 'Logbook', icon: BookOpen, module: 'logbook' as PermissionModule },
    { path: '/reports', label: 'Relatórios', icon: FileText, module: 'reports' as PermissionModule },
    { path: '/performance', label: 'Desempenho', icon: BarChart3, module: 'performance' as PermissionModule },
    { path: '/team', label: 'Equipe', icon: Users, module: 'team' as PermissionModule },
  ];
  return (
    <div className="w-20 md:w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-800 flex flex-col transition-all duration-300 shadow-2xl z-50">
      <div className="p-6 flex items-center gap-4">
        <BrandMark size="sm" tileClassName="shrink-0" />
        <span className="hidden md:block font-black text-slate-800 dark:text-white tracking-tighter text-xl leading-none">PALÁCIO<br/><span className="text-blue-600">ARAGUAIA</span></span>
      </div>
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto scrollbar-hide py-6">
        {navItems.filter(item => item.path === '/ai_insights' ? (user.role === UserRole.ADMIN || user.permissions.includes('dashboard')) : hasPermission(item.module)).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-200 group ${isActive ? (item.path === '/ai_insights' ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-xl shadow-blue-500/30' : 'bg-blue-600 text-white shadow-xl shadow-blue-500/30') : 'text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600'}`}>
              <item.icon size={22} className={isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
              <span className={`hidden md:block text-xs font-black uppercase tracking-widest ${isActive ? 'text-white' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t dark:border-slate-800 space-y-2">
        <button onClick={onToggleDark} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">{darkMode ? <Sun size={20} /> : <Moon size={20} />}<span className="hidden md:block text-xs font-black uppercase tracking-widest">Tema</span></button>
        <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><LogOut size={20} /><span className="hidden md:block text-xs font-black uppercase tracking-widest">Sair</span></button>
      </div>
    </div>
  );
};

const Navbar: React.FC<{ user: User; config: SystemConfig; onOpenCloud: () => void }> = ({ user, config, onOpenCloud }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);

  useEffect(() => {
    const rooms = DatabaseService.getRooms(MOCK_ROOMS).map<SearchResultItem>((room) => ({
      id: `room-${room.id}`,
      title: `Quarto ${room.number}`,
      subtitle: `${room.category} • ${room.status}`,
      category: 'Quartos',
      route: '/rooms',
      keywords: [room.number, room.category, room.status, room.responsible, room.guestName || ''],
    }));

    const inventory = DatabaseService.getInventory(MOCK_STOCK).map<SearchResultItem>((item) => ({
      id: `stock-${item.id}`,
      title: item.name,
      subtitle: `${item.quantity} ${item.unit} • minimo ${item.minQuantity}`,
      category: 'Estoque',
      route: '/inventory',
      keywords: [item.category, item.location, item.name],
    }));

    const maintenance = DatabaseService.getTasks(MOCK_MAINTENANCE).map<SearchResultItem>((task) => ({
      id: `task-${task.id}`,
      title: `${task.type} • Qto ${task.roomId}`,
      subtitle: `${task.priority} • ${task.status}`,
      category: 'Manutencao',
      route: '/maintenance',
      keywords: [task.description, task.responsible, task.roomId, task.status],
    }));

    const logbook = MOCK_LOGBOOK.map<SearchResultItem>((entry) => ({
      id: `log-${entry.id}`,
      title: entry.text,
      subtitle: `${entry.department} • ${entry.type}`,
      category: 'Logbook',
      route: '/logbook',
      keywords: [entry.author, entry.department, entry.type, entry.turn],
    }));

    setResults(scoreSearch(query, [...rooms, ...inventory, ...maintenance, ...logbook]));
  }, [query]);

  return (
    <header className="h-24 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b dark:border-slate-800 px-8 flex items-center justify-between z-40">
      <div className="flex items-center gap-6 flex-1">
        <div className="hidden xl:flex items-center gap-4 min-w-fit">
          <BrandMark size="sm" />
          <div className="leading-none">
            <p className="text-base font-black text-slate-900 dark:text-white tracking-tighter">Palacio Araguaia</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.28em] mt-1">Sistema de Gestao</p>
          </div>
        </div>
        <div className="relative hidden lg:block w-full max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              const nextValue = e.target.value;
              setQuery(nextValue);
              if (nextValue.trim()) trackAIEvent('ops', 'smart_search', nextValue);
            }}
            placeholder="Buscar quarto, item, tarefa, ocorrencia..."
            className="w-full pl-14 pr-6 py-3.5 bg-slate-50 dark:bg-black border-none rounded-[1.25rem] text-sm outline-none ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500 dark:text-white transition-all font-medium"
          />
          {query.trim() && (
            <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[1.5rem] shadow-2xl overflow-hidden">
              {results.length > 0 ? results.map((result) => (
                <Link
                  key={result.id}
                  to={result.route || '/'}
                  onClick={() => setQuery('')}
                  className="block px-5 py-4 border-b last:border-b-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <p className="text-sm font-black text-slate-900 dark:text-white">{result.title}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {result.category} • {result.subtitle}
                  </p>
                </Link>
              )) : (
                <div className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Nenhum resultado para esta busca
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button onClick={onOpenCloud} className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all ${config.apiUrl && config.syncEnabled ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/10 dark:border-emerald-900/20' : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-black dark:border-slate-800'}`}>
          {config.apiUrl && config.syncEnabled ? <Cloud size={18} /> : <CloudOff size={18} />}
          <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
            {config.apiUrl && config.syncEnabled ? 'Cloud Conectado' : 'Offline Mode'}
          </span>
        </button>
        <button className="p-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl relative transition-all group">
          <Bell size={22} /><span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-[3px] border-white dark:border-slate-900"></span>
        </button>
        <div className="h-10 w-[1px] bg-slate-100 dark:bg-slate-800"></div>
        <div className="flex items-center gap-4 pl-2">
          <div className="text-right hidden sm:block"><p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{user.name}</p><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{user.role}</p></div>
          <img src={user.photo} alt={user.name} className="w-12 h-12 rounded-2xl border-2 border-white dark:border-slate-700 shadow-xl object-cover" />
        </div>
      </div>
    </header>
  );
};

export default App;
