
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((state) => [...state, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((state) => state.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-6 right-6 z-[200] space-y-3 flex flex-col items-end pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`pointer-events-auto min-w-[320px] max-w-md p-4 rounded-2xl shadow-2xl flex items-start gap-4 transform transition-all animate-in slide-in-from-right-full duration-300 border-l-4 backdrop-blur-xl ${
              toast.type === 'SUCCESS' ? 'bg-white/90 dark:bg-slate-900/90 border-emerald-500 text-slate-800 dark:text-white' :
              toast.type === 'ERROR' ? 'bg-white/90 dark:bg-slate-900/90 border-red-500 text-slate-800 dark:text-white' :
              toast.type === 'WARNING' ? 'bg-white/90 dark:bg-slate-900/90 border-amber-500 text-slate-800 dark:text-white' :
              'bg-white/90 dark:bg-slate-900/90 border-blue-500 text-slate-800 dark:text-white'
            }`}
          >
            <div className={`mt-0.5 ${
               toast.type === 'SUCCESS' ? 'text-emerald-500' :
               toast.type === 'ERROR' ? 'text-red-500' :
               toast.type === 'WARNING' ? 'text-amber-500' : 'text-blue-500'
            }`}>
              {toast.type === 'SUCCESS' && <CheckCircle size={20} />}
              {toast.type === 'ERROR' && <AlertCircle size={20} />}
              {toast.type === 'WARNING' && <AlertTriangle size={20} />}
              {toast.type === 'INFO' && <Info size={20} />}
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black uppercase tracking-widest mb-1 opacity-70">
                {toast.type === 'SUCCESS' ? 'Sucesso' : toast.type === 'ERROR' ? 'Erro' : toast.type === 'WARNING' ? 'Atenção' : 'Informação'}
              </h4>
              <p className="text-sm font-bold leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
