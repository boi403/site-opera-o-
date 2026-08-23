
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Calendar, Download, Clock, Bed, Wrench, Package, 
  TrendingDown, TrendingUp, Star, CheckCircle2, AlertTriangle, User as UserIcon,
  // Fix: Added Users to the imports
  Users
} from 'lucide-react';

const COLORS = ['#3b82f6', '#60a5fa', '#94a3b8', '#1e293b', '#64748b'];

const productivityData = [
  { name: 'Maria Silva', value: 18 },
  { name: 'Ana Costa', value: 22 },
  { name: 'Joana Pereira', value: 16 },
  { name: 'Carla Santos', value: 20 },
  { name: 'Paula Lima', value: 19 },
];

const weeklyActivity = [
  { day: 'Seg', limpezas: 45, manutencao: 4 },
  { day: 'Ter', limpezas: 52, manutencao: 6 },
  { day: 'Qua', limpezas: 48, manutencao: 3 },
  { day: 'Qui', limpezas: 55, manutencao: 5 },
  { day: 'Sex', limpezas: 60, manutencao: 7 },
  { day: 'Sab', limpezas: 65, manutencao: 8 },
  { day: 'Dom', limpezas: 42, manutencao: 3 },
];

const costDistribution = [
  { name: 'Produtos Limpeza', value: 3500 },
  { name: 'Enxoval', value: 2200 },
  { name: 'Manutenção', value: 1800 },
  { name: 'Frigobar', value: 1200 },
  { name: 'Outros', value: 800 },
];

const Reports: React.FC<{ user: any }> = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
          <p className="text-slate-500">Indicadores operacionais e análises</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50">
            <Calendar size={14} /> Esta semana <ChevronDown size={14} />
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            <Download size={14} /> Exportar
          </button>
        </div>
      </div>

      {/* Top row: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          label="Tempo Médio Limpeza" 
          value="18 min" 
          change="-12% vs mês anterior" 
          positive={true} 
          icon={<Clock size={16} />} 
        />
        <KPICard 
          label="Limpezas Realizadas" 
          value="367" 
          change="Esta semana" 
          positive={true} 
          icon={<Bed size={16} />} 
        />
        <KPICard 
          label="Chamados Manutenção" 
          value="25" 
          change="+8% vs mês anterior" 
          positive={false} 
          icon={<Wrench size={16} />} 
        />
        <KPICard 
          label="Custos Operacionais" 
          value="R$ 9.500" 
          change="-5% vs mês anterior" 
          positive={true} 
          icon={<Package size={16} />} 
        />
      </div>

      {/* Middle row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
            <Users size={16} className="text-blue-500" /> Produtividade por Camareira
          </h3>
          <p className="text-[10px] text-slate-400 mb-6 uppercase font-black tracking-widest">Tempo médio de limpeza (min) e quartos limpos</p>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#475569'}} width={100} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" /> Atividade Semanal
          </h3>
          <p className="text-[10px] text-slate-400 mb-6 uppercase font-black tracking-widest">Limpezas realizadas e chamados de manutenção</p>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip />
                <Line type="monotone" dataKey="limpezas" stroke="#3b82f6" strokeWidth={2} dot={{r: 3, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2}} />
                <Line type="monotone" dataKey="manutencao" stroke="#ef4444" strokeWidth={2} dot={{r: 3, fill: '#fff', stroke: '#ef4444', strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row: Costs and Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
            <Package size={16} className="text-blue-500" /> Distribuição de Custos
          </h3>
          <p className="text-[10px] text-slate-400 mb-8 uppercase font-black tracking-widest">Gastos por categoria</p>
          
          <div className="flex flex-col items-center">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {costDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full space-y-2 mt-4">
              {costDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}} />
                    <span className="text-[10px] font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-800">R$ {item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Destaques do Período</h3>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Principais indicadores e alertas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HighlightCard 
              label="Quarto mais problemático" 
              value="305" 
              sub="3 chamados de manutenção este mês"
              icon={<AlertTriangle size={18} className="text-amber-500" />}
            />
            <HighlightCard 
              label="Camareira destaque" 
              value="Joana Pereira" 
              sub="16 min média • 26 quartos"
              icon={<Star size={18} className="text-blue-500" />}
            />
            <HighlightCard 
              label="Taxa de aprovação" 
              value="94%" 
              sub="Limpezas aprovadas na primeira vistoria"
              icon={<CheckCircle2 size={18} className="text-green-500" />}
              valueColor="text-green-600"
            />
            <HighlightCard 
              label="Tempo resolução manutenção" 
              value="2.5h" 
              sub="Média de tempo para resolver chamados"
              icon={<Clock size={18} className="text-slate-500" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard: React.FC<{ label: string; value: string; change: string; positive: boolean; icon: React.ReactNode }> = ({ label, value, change, positive, icon }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm group hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-4">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
        {icon}
      </div>
    </div>
    <p className="text-xl font-black text-slate-800 mb-1">{value}</p>
    <p className={`text-[10px] font-bold ${positive ? 'text-green-600' : 'text-red-500'}`}>{change}</p>
  </div>
);

const HighlightCard: React.FC<{ label: string; value: string; sub: string; icon: React.ReactNode; valueColor?: string }> = ({ label, value, sub, icon, valueColor = 'text-slate-800' }) => (
  <div className="bg-slate-100/50 p-5 rounded-2xl border border-slate-200/50 flex flex-col justify-between">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{label}</p>
    <div>
      <h4 className={`text-lg font-black ${valueColor} mb-0.5`}>{value}</h4>
      <p className="text-[10px] text-slate-500 font-medium">{sub}</p>
    </div>
    <div className="absolute top-5 right-5 opacity-20">
      {icon}
    </div>
  </div>
);

const ChevronDown = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export default Reports;
