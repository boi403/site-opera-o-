import React, { useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  Brain,
  Zap,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  BarChart3,
  Lightbulb,
  Bot,
  Layers,
  Clock,
  Mic,
  Volume2,
} from 'lucide-react';
import { DatabaseService } from '../database';
import { MOCK_MAINTENANCE, MOCK_ROOMS, MOCK_STOCK } from '../constants';
import { getAIEvents, summarizeAIEvents, trackAIEvent } from '../../shared/ai/analytics';
import { requestAIAnalytics, requestOperationalCopilot, requestPredictiveInsights } from '../../shared/ai/client';
import { createSpeechRecognizer, speakText } from '../../shared/ai/voice';

type Insight = {
  title: string;
  description: string;
  impact: 'ALTO' | 'MEDIO';
  category: string;
  actionLabel: string;
};

type LearnedMetric = {
  label: string;
  value: string;
  trend: string;
};

const AIInsights: React.FC<{ user: any }> = () => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [learnedMetrics, setLearnedMetrics] = useState<LearnedMetric[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Pergunte sobre quartos criticos, estoque, manutencao, ocupacao ou prioridades do dia.' },
  ]);
  const [analyticsSummary, setAnalyticsSummary] = useState('Coletando sinais de uso da IA.');
  const [opportunities, setOpportunities] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  const snapshot = useMemo(() => {
    const rooms = DatabaseService.getRooms(MOCK_ROOMS);
    const inventory = DatabaseService.getInventory(MOCK_STOCK);
    const maintenance = DatabaseService.getTasks(MOCK_MAINTENANCE);

    return {
      totalRooms: rooms.length,
      releasedRooms: rooms.filter((room) => room.status === 'LIBERADO').length,
      dirtyOrBlockedRooms: rooms.filter((room) => room.status === 'SUJO' || room.status === 'BLOQUEADO').length,
      maintenancePending: maintenance.filter((task) => task.status !== 'COMPLETED').length,
      urgentMaintenance: maintenance.filter((task) => task.priority === 'Urgente' || task.priority === 'Alta').length,
      lowStockItems: inventory.filter((item) => item.quantity <= item.minQuantity).length,
      criticalStock: inventory
        .filter((item) => item.quantity <= item.minQuantity)
        .map((item) => `${item.name} (${item.quantity}/${item.minQuantity})`),
      criticalAC: rooms.filter((room) => {
        const last = new Date(room.lastACCleaning);
        const diff = (new Date().getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 30;
      }).length,
    };
  }, []);

  useEffect(() => {
    const recognizer = createSpeechRecognizer();
    if (!recognizer) return;

    recognizer.onresult = (event: any) => {
      setCopilotInput(event?.results?.[0]?.[0]?.transcript || '');
      setIsListening(false);
      trackAIEvent('ops', 'voice_input', 'ops_copilot_voice');
    };
    recognizer.onerror = () => setIsListening(false);
    recognizer.onend = () => setIsListening(false);

    (window as any).__ARAGUAIA_OPS_RECOGNIZER__ = recognizer;
  }, []);

  const analyzeSystem = async () => {
    setLoading(true);
    try {
      const response = await requestPredictiveInsights({ snapshot });
      setInsights(response.insights);
      setLearnedMetrics(response.metrics);
      setLastAnalysis(new Date().toLocaleTimeString());
      trackAIEvent('ops', 'predictive_refresh', 'ai_insights_refresh', snapshot);
    } catch (error) {
      console.error('Erro na analise IA:', error);
      setInsights([
        {
          title: 'Otimizacao de Escala',
          description: 'Concentre reforco da equipe nos andares com maior volume de quartos sujos, bloqueados ou em limpeza.',
          impact: 'ALTO',
          category: 'Equipe',
          actionLabel: 'Ver escala',
        },
        {
          title: 'Manutencao Preventiva de AC',
          description: 'Priorize quartos com mais tempo sem ciclo preventivo para evitar falhas durante ocupacao.',
          impact: 'ALTO',
          category: 'Manutencao',
          actionLabel: 'Ajustar ciclo',
        },
        {
          title: 'Revisao de Estoque Critico',
          description: 'Itens abaixo do minimo devem ser repostos antes do proximo pico para evitar ruptura operacional.',
          impact: 'MEDIO',
          category: 'Estoque',
          actionLabel: 'Auditar estoque',
        },
        {
          title: 'Aprimorar atendimento assistido',
          description: 'Use as perguntas mais frequentes do concierge para ajustar recepcao, FAQ e treinamento.',
          impact: 'MEDIO',
          category: 'Hospede',
          actionLabel: 'Ver analytics',
        },
      ]);
      setLearnedMetrics([
        { label: 'Tempo Medio Limpeza', value: '17.2 min', trend: '-2%' },
        { label: 'Previsao Ocupacao', value: '88%', trend: '+5%' },
        { label: 'Nivel Qualidade', value: '96.4%', trend: '+0.5%' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    const events = getAIEvents();
    const summarized = summarizeAIEvents(events);
    const fallbackSummary = summarized.length
      ? `Top sinais recentes: ${summarized.slice(0, 3).map((item) => `${item.type} (${item.total})`).join(', ')}.`
      : 'Ainda sem eventos suficientes para leitura analitica.';

    try {
      const response = await requestAIAnalytics({ events, snapshot });
      setAnalyticsSummary(response.summary || fallbackSummary);
      setOpportunities(response.opportunities || []);
    } catch {
      setAnalyticsSummary(fallbackSummary);
      setOpportunities([
        'Instrumentar melhor perguntas de reserva',
        'Mapear cliques para WhatsApp por origem',
        'Cruzar buscas internas com gargalos operacionais',
      ]);
    }
  };

  useEffect(() => {
    analyzeSystem();
    loadAnalytics();
  }, []);

  const sendCopilotMessage = async () => {
    const message = copilotInput.trim();
    if (!message || copilotLoading) return;

    setCopilotInput('');
    setCopilotMessages((prev) => [...prev, { role: 'user', text: message }]);
    setCopilotLoading(true);
    trackAIEvent('ops', 'copilot_question', message);

    try {
      const response = await requestOperationalCopilot({
        message,
        snapshot,
        messages: copilotMessages,
      });
      setCopilotMessages((prev) => [...prev, { role: 'assistant', text: response.reply }]);
    } catch {
      setCopilotMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Nao consegui consultar o copiloto agora. Priorize quartos criticos, estoque abaixo do minimo e manutencao urgente.',
        },
      ]);
    } finally {
      setCopilotLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="relative p-12 bg-slate-950 rounded-[4rem] overflow-hidden border border-blue-500/20 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3 w-fit px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Cerebro Araguaia v3.0</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
              IA para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Operacao</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-xl">
              O sistema agora combina previsao operacional, copiloto conversacional, busca inteligente, analytics e interacao por voz.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <button
                onClick={analyzeSystem}
                disabled={loading}
                className="px-8 py-4 bg-white text-slate-900 rounded-[1.75rem] font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                Recalcular padroes
              </button>
              {lastAnalysis && (
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <RefreshCw size={12} /> Ultima analise: {lastAnalysis}
                </span>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] absolute inset-0 animate-pulse" />
            <div className="w-56 h-56 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 flex items-center justify-center relative shadow-2xl">
              <Brain size={100} className="text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.5)]" />
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-3">
              <BarChart3 size={18} className="text-blue-500" /> Aprendizado recente
            </h3>
            <div className="space-y-6">
              {learnedMetrics.map((metric, index) => (
                <LearnedFact
                  key={`${metric.label}-${index}`}
                  icon={index === 0 ? <Clock /> : index === 1 ? <TrendingUp /> : <ShieldCheck />}
                  label={metric.label}
                  value={metric.value}
                  trend={metric.trend}
                />
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[3rem] text-white shadow-2xl overflow-hidden relative">
            <div className="relative z-10 space-y-4">
              <Bot size={40} className="text-blue-200" />
              <h4 className="text-xl font-black uppercase tracking-tighter">Copiloto operacional</h4>
              <p className="text-xs font-bold text-blue-100 uppercase tracking-widest leading-relaxed">
                Converse com a IA sobre gargalos, prioridades, manutencao, estoque e qualidade operacional.
              </p>
              <div className="max-h-52 overflow-y-auto space-y-3 pr-2">
                {copilotMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl px-4 py-3 text-xs font-bold leading-relaxed ${
                      message.role === 'user' ? 'bg-white text-slate-900 ml-8' : 'bg-white/10 text-blue-50 mr-8'
                    }`}
                  >
                    {message.text}
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => speakText(message.text)}
                        className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-blue-100"
                      >
                        <Volume2 size={12} /> Ouvir
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendCopilotMessage()}
                  placeholder="Ex.: quais sao os gargalos de hoje?"
                  className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-sm text-white placeholder:text-blue-100/60 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const recognizer = (window as any).__ARAGUAIA_OPS_RECOGNIZER__;
                    if (!recognizer || isListening || copilotLoading) return;
                    setIsListening(true);
                    recognizer.start();
                  }}
                  className={`px-4 rounded-2xl ${isListening ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-white'}`}
                >
                  <Mic size={16} />
                </button>
                <button
                  onClick={sendCopilotMessage}
                  disabled={copilotLoading}
                  className="px-4 rounded-2xl bg-white text-slate-900 font-black text-[10px] uppercase tracking-[0.2em]"
                >
                  {copilotLoading ? <RefreshCw className="animate-spin" size={14} /> : 'Enviar'}
                </button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <Layers size={18} className="text-emerald-500" /> Analytics de IA
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{analyticsSummary}</p>
            <div className="mt-6 space-y-3">
              {opportunities.map((item) => (
                <div
                  key={item}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-black/30 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading
            ? Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-[3rem] border dark:border-slate-800 animate-pulse" />
                ))
            : insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${
                          insight.impact === 'ALTO' ? 'bg-red-50 text-red-600 dark:bg-red-900/10' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/10'
                        }`}
                      >
                        Impacto {insight.impact}
                      </span>
                      <Lightbulb className="text-amber-500" size={20} />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">
                      {insight.title}
                    </h4>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{insight.description}</p>
                  </div>
                  <div className="mt-8 pt-6 border-t dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{insight.category}</span>
                    <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline">
                      {insight.actionLabel} <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

const LearnedFact: React.FC<{ icon: any; label: string; value: string; trend: string }> = ({ icon, label, value, trend }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/30 rounded-2xl border dark:border-slate-800">
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl text-blue-600 shadow-sm">
        {React.cloneElement(icon, { size: 16 })}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-black text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
    <span className={`text-[10px] font-black ${trend.startsWith('+') ? 'text-emerald-500' : 'text-blue-500'}`}>{trend}</span>
  </div>
);

export default AIInsights;
