
import React from 'react';
import { 
  Users, BarChart3, TrendingUp, Award, Clock, Star, 
  ThumbsUp, ThumbsDown, ArrowUpRight, Search, Filter 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';

const Performance: React.FC<{ user: any }> = () => {
  const productivityTrend = [
    { day: 'Seg', cleaning: 45, maintenance: 12 },
    { day: 'Ter', cleaning: 52, maintenance: 15 },
    { day: 'Qua', cleaning: 48, maintenance: 10 },
    { day: 'Qui', cleaning: 61, maintenance: 18 },
    { day: 'Sex', cleaning: 55, maintenance: 14 },
    { day: 'Sab', cleaning: 72, maintenance: 20 },
    { day: 'Dom', cleaning: 68, maintenance: 17 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Desempenho da Equipe</h1>
          <p className="text-slate-500">Métricas de produtividade e qualidade do serviço.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
             Exportar PDF
           </button>
           <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
             Relatório Detalhado
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Limpezas/Dia" value="58" icon={<TrendingUp size={20} />} trend="+8%" positive={true} />
        <MetricCard label="T. Médio Reparo" value="2.4h" icon={<Clock size={20} />} trend="-12%" positive={true} />
        <MetricCard label="Checklists OK" value="98.2%" icon={<Award size={20} />} trend="+0.5%" positive={true} />
        <MetricCard label="Satisfação" value="4.8/5" icon={<Star size={20} />} trend="+2%" positive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
              Tendência de Produtividade
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-blue-500" /> LIMPEZA</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-slate-300" /> MANUTENÇÃO</span>
              </div>
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productivityTrend}>
                  <defs>
                    <linearGradient id="colorCleaning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="cleaning" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCleaning)" />
                  <Area type="monotone" dataKey="maintenance" stroke="#94a3b8" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Ranking de Produtividade</h3>
              <div className="flex gap-2">
                <button className="text-xs font-bold text-blue-600 px-3 py-1 bg-blue-50 rounded-lg">Mensal</button>
                <button className="text-xs font-bold text-slate-400 px-3 py-1 hover:bg-slate-50 rounded-lg">Semanal</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr className="text-[10px] uppercase font-bold text-slate-400">
                    <th className="px-6 py-4">Membro da Equipe</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <TeamRow name="Maria Silva" role="Camareira" score={98} status="Online" />
                  <TeamRow name="João Santos" role="Manutenção" score={94} status="Offline" />
                  <TeamRow name="Ana Oliveira" role="Camareira" score={92} status="Online" />
                  <TeamRow name="Pedro Gomes" role="Limpeza" score={88} status="Pausa" />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-200">
            <h3 className="text-lg font-bold mb-6">Próximos Treinamentos</h3>
            <div className="space-y-4">
              <TrainingCard 
                title="Novo Padrão Araguaia" 
                date="Amanhã, 14:00" 
                people={12} 
                color="blue"
              />
              <TrainingCard 
                title="Segurança Manutenção" 
                date="12 Out, 09:00" 
                people={4} 
                color="amber"
              />
              <TrainingCard 
                title="Uso de Novos Insumos" 
                date="15 Out, 10:00" 
                people={20} 
                color="green"
              />
            </div>
            <button className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs font-bold transition-all">
              Agendar Novo Treinamento
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ThumbsUp size={20} className="text-green-600" /> Feedback Recente
            </h3>
            <div className="space-y-4">
              <FeedbackItem 
                type="POSITIVE" 
                text="Quarto 204 estava impecável. Limpeza excelente!" 
                author="Hóspede Suíte 204"
                date="Há 2h"
              />
              <FeedbackItem 
                type="NEGATIVE" 
                text="Demora na troca da lâmpada do corredor B." 
                author="Gerência Noite"
                date="Há 5h"
              />
              <FeedbackItem 
                type="POSITIVE" 
                text="Equipe de manutenção muito cordial e rápida." 
                author="Hóspede Suíte 105"
                date="Ontem"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; icon: React.ReactNode; trend: string; positive: boolean }> = ({ label, value, icon, trend, positive }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <div className="p-2.5 bg-slate-50 rounded-xl text-blue-600">{icon}</div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {positive ? <ArrowUpRight size={10} /> : <ArrowUpRight size={10} className="rotate-90" />} {trend}
      </span>
    </div>
    <p className="text-xs font-medium text-slate-400 mb-0.5">{label}</p>
    <p className="text-xl font-black text-slate-800">{value}</p>
  </div>
);

const TeamRow: React.FC<{ name: string; role: string; score: number; status: string }> = ({ name, role, score, status }) => (
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <img src={`https://picsum.photos/seed/${name}/100`} className="w-8 h-8 rounded-full shadow-sm" />
        <div>
          <p className="text-sm font-bold text-slate-800">{name}</p>
          <p className="text-[10px] font-medium text-slate-500 uppercase">{role}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${status === 'Online' ? 'bg-green-500' : status === 'Pausa' ? 'bg-amber-500' : 'bg-slate-300'}`} />
        <span className="text-xs font-semibold text-slate-600">{status}</span>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500" style={{ width: `${score}%` }} />
        </div>
        <span className="text-xs font-bold text-slate-800">{score}%</span>
      </div>
    </td>
    <td className="px-6 py-4">
       <button className="p-2 hover:bg-slate-100 rounded-lg text-blue-600 transition-all">
         <ArrowUpRight size={16} />
       </button>
    </td>
  </tr>
);

const TrainingCard: React.FC<{ title: string; date: string; people: number; color: string }> = ({ title, date, people, color }) => (
  <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
    <div>
      <h5 className="text-sm font-bold">{title}</h5>
      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
        <Clock size={10} /> {date}
      </p>
    </div>
    <div className="text-right">
      <p className="text-xs font-bold text-blue-400">{people} Colab.</p>
      <button className="text-[10px] font-bold text-slate-500 uppercase mt-1">Detalhes</button>
    </div>
  </div>
);

const FeedbackItem: React.FC<{ type: 'POSITIVE' | 'NEGATIVE'; text: string; author: string; date: string }> = ({ type, text, author, date }) => (
  <div className={`p-4 rounded-2xl border ${type === 'POSITIVE' ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
    <div className="flex justify-between items-start mb-2">
      <div className={`p-1.5 rounded-lg ${type === 'POSITIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {type === 'POSITIVE' ? <ThumbsUp size={14} /> : <ThumbsDown size={14} />}
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase">{date}</span>
    </div>
    <p className="text-xs font-medium text-slate-700 leading-relaxed mb-2">"{text}"</p>
    <p className="text-[10px] font-bold text-slate-500">— {author}</p>
  </div>
);

export default Performance;
