
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { Bed, Wrench, Package, TrendingUp, AlertCircle, Clock, MessageCircle, ArrowRight, DollarSign, Activity } from 'lucide-react';
import { User, RoomStatus, UserRole, StockItem, MaintenanceTask } from '../types';
import { MOCK_ROOMS, MOCK_MAINTENANCE, MOCK_STOCK } from '../constants';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  const navigate = useNavigate();
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    const savedRooms = localStorage.getItem('araguaia_rooms_data');
    if (savedRooms) setRooms(JSON.parse(savedRooms));

    const savedStock = localStorage.getItem('araguaia_inventory_data');
    if (savedStock) {
      setStock(JSON.parse(savedStock));
    } else {
      setStock(MOCK_STOCK);
    }

    const savedTasks = localStorage.getItem('araguaia_maintenance_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(MOCK_MAINTENANCE);
    }
  }, []);

  const totalRooms = rooms.length;
  const maintenanceRoomsCount = rooms.filter(r => r.status === RoomStatus.MAINTENANCE).length;
  const problemRooms = rooms.filter(r => r.status === RoomStatus.BLOCKED || r.status === RoomStatus.DIRTY).length;
  const lowStockItems = stock.filter(i => i.quantity <= i.minQuantity);
  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');

  // Saudação dinâmica com base no horário
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const handleWhatsAppOperationalReport = () => {
    let message = `*🏨 RELATÓRIO OPERACIONAL - PALÁCIO ARAGUAIA*\n`;
    message += `Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n\n`;
    
    message += `*📦 ESTOQUE CRÍTICO (${lowStockItems.length} itens):*\n`;
    if (lowStockItems.length > 0) {
      lowStockItems.slice(0, 5).forEach(i => {
        message += `• ${i.name}: ${i.quantity} ${i.unit}\n`;
      });
      if (lowStockItems.length > 5) message += `• e outros ${lowStockItems.length - 5} itens...\n`;
    } else {
      message += `✅ Níveis normais.\n`;
    }

    message += `\n*🛠️ MANUTENÇÃO (${pendingTasks.length} pendentes):*\n`;
    if (pendingTasks.length > 0) {
      pendingTasks.slice(0, 5).forEach(t => {
        message += `• Qto ${t.roomId}: ${t.type} (${t.priority})\n`;
      });
      if (pendingTasks.length > 5) message += `• e mais ${pendingTasks.length - 5} chamados...\n`;
    } else {
      message += `✅ Nenhuma pendência.\n`;
    }

    message += `\nPainel: palacioaraguaia.com/gestao`;

    const savedRecipients = localStorage.getItem('araguaia_inventory_recipients');
    const recipients = savedRecipients ? JSON.parse(savedRecipients) : [];
    const whatsappRecipients = recipients.filter((r: any) => r.active && r.type === 'WHATSAPP');

    if (whatsappRecipients.length > 0) {
      const cleanPhone = whatsappRecipients[0].contact.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
      addToast('Relatório gerado e enviado para o WhatsApp!', 'SUCCESS');
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      addToast('Relatório gerado. Selecione um contato no WhatsApp.', 'INFO');
    }
  };

  const estimatedReplacementCost = useMemo(() => {
    return stock
      .filter(item => item.quantity <= item.minQuantity)
      .reduce((acc, item) => {
        const suggestedQty = (item.minQuantity * 2) - item.quantity;
        const finalSuggestion = Math.max(suggestedQty, item.minQuantity);
        const cost = finalSuggestion * (item.unitPrice || 0);
        return acc + cost;
      }, 0);
  }, [stock]);

  const roomStatusData = [
    { name: 'Liberados', value: rooms.filter(r => r.status === RoomStatus.RELEASED).length },
    { name: 'Ocupados', value: rooms.filter(r => r.status === RoomStatus.OCCUPIED).length },
    { name: 'Manutenção', value: maintenanceRoomsCount },
    { name: 'Pendentes', value: problemRooms },
  ];

  const maintenanceCostData = [
    { month: 'Jul', cost: 1200 },
    { month: 'Ago', cost: 1500 },
    { month: 'Set', cost: 1100 },
    { month: 'Out', cost: 1800 },
  ];

  const handleQuickWhatsAppAlert = () => {
    if (lowStockItems.length === 0) {
      addToast("Estoque está em conformidade. Nenhuma ação necessária.", 'SUCCESS');
      return;
    }
    navigate('/inventory');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      {/* Header Premium */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 p-8 md:p-10 rounded-[2.5rem] text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex gap-6 items-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-inner">
            <span className="text-3xl">👋</span>
          </div>
          <div>
            <p className="text-blue-200 font-semibold tracking-wide uppercase text-sm mb-1">{greeting}, {user.name || 'Gestor'}</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Centro de Operações</h1>
          </div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 mt-6 xl:mt-0 w-full xl:w-auto">
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-lg px-5 py-3.5 rounded-2xl border border-white/10 w-full sm:w-auto justify-center sm:justify-start">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">Tempo Real</span>
          </div>
          <button 
            onClick={handleWhatsAppOperationalReport}
            className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3.5 rounded-2xl text-sm font-black shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 uppercase tracking-wider border border-emerald-400/50 w-full sm:w-auto"
          >
            <MessageCircle size={20} /> Relatório Diário
          </button>
        </div>
      </div>

      {/* Stats Grid Modernizado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Bed size={24} className="text-blue-500" />} 
          label="Unidades Prontas" 
          value={rooms.filter(r => r.status === RoomStatus.RELEASED).length.toString()} 
          subValue={`de ${totalRooms} quartos`} 
          gradient="from-blue-500/10 to-transparent"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          action={() => navigate('/rooms')}
        />
        <StatCard 
          icon={<Wrench size={24} className="text-orange-500" />} 
          label="Reparos Ativos" 
          value={maintenanceRoomsCount.toString()} 
          subValue="Nas unidades" 
          gradient="from-orange-500/10 to-transparent"
          iconBg="bg-orange-100 dark:bg-orange-900/30"
          action={() => navigate('/maintenance')}
        />
        <StatCard 
          icon={<Package size={24} className={lowStockItems.length > 0 ? "text-red-500" : "text-emerald-500"} />} 
          label="Insumos Críticos" 
          value={lowStockItems.length.toString()} 
          subValue={lowStockItems.length > 0 ? "Atenção necessária" : "Tudo nos conformes"} 
          gradient={lowStockItems.length > 0 ? "from-red-500/10 to-transparent" : "from-emerald-500/10 to-transparent"}
          iconBg={lowStockItems.length > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-emerald-100 dark:bg-emerald-900/30"}
          action={handleQuickWhatsAppAlert}
          alert={lowStockItems.length > 0}
        />
        {isAdmin && (
          <StatCard 
            icon={<TrendingUp size={24} className="text-purple-500" />} 
            label="Custo de Reposição" 
            value={`R$ ${estimatedReplacementCost.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
            subValue="Planejado" 
            gradient="from-purple-500/10 to-transparent"
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            action={() => navigate('/inventory')}
          />
        )}
      </div>

      {/* Grid de Gráficos e Alertas */}
      <div className={`grid grid-cols-1 ${isAdmin ? 'xl:grid-cols-3' : 'lg:grid-cols-2'} gap-8`}>
        {/* Gráfico de Ocupação */}
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col hover:border-blue-500/20 transition-colors">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Status Geral</h3>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-1">Ocupação e Conservação</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm">
              <Activity size={22} />
            </div>
          </div>
          <div className="h-[280px] w-full mt-auto relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                >
                  {roomStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity focus:outline-none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px 20px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 800 }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <div className="text-center">
                <span className="block text-3xl font-black text-slate-800 dark:text-white">{totalRooms}</span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Custos */}
        {isAdmin && (
          <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:border-purple-500/20 transition-colors">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Investimento em Custos</h3>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-1">Evolução Mensal</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shadow-sm">
                <DollarSign size={22} />
              </div>
            </div>
            <div className="h-[280px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={maintenanceCostData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px 20px', fontWeight: 'bold' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Line type="monotone" dataKey="cost" name="Custo (R$)" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 5, fill: '#8b5cf6', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0, fill: '#6d28d9' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Lista de Alertas Ativos */}
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col h-[420px] hover:border-red-500/20 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Ocorrências</h3>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-1">Ações requeridas</p>
            </div>
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center shadow-sm">
              <AlertCircle size={22} className={problemRooms > 0 || maintenanceRoomsCount > 0 ? "animate-pulse" : ""} />
            </div>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide pr-2">
            {rooms.filter(r => r.status === RoomStatus.BLOCKED || r.status === RoomStatus.DIRTY || r.status === RoomStatus.MAINTENANCE).slice(0, 4).map((room, i) => (
              <div 
                key={room.id} 
                onClick={() => navigate('/rooms')}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg dark:hover:shadow-none hover:-translate-y-1 transition-all cursor-pointer group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black shadow-sm ${
                    room.status === RoomStatus.BLOCKED || room.status === RoomStatus.MAINTENANCE ? 'bg-red-500 text-white' : 'bg-orange-400 text-white'
                  }`}>
                    {room.number}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight uppercase tracking-wide">{room.status}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock size={12} className="text-slate-400" />
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{room.responsible || 'Pendente'}</p>
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors text-slate-400">
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
            
            {rooms.filter(r => r.status === RoomStatus.BLOCKED || r.status === RoomStatus.DIRTY || r.status === RoomStatus.MAINTENANCE).length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                 <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                     <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                   </svg>
                 </div>
                 <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Nenhum alerta crítico</p>
                 <p className="text-xs text-slate-500 mt-1">Tudo operando normalmente.</p>
              </div>
            )}
          </div>
          
          {rooms.filter(r => r.status === RoomStatus.BLOCKED || r.status === RoomStatus.DIRTY || r.status === RoomStatus.MAINTENANCE).length > 0 && (
            <button 
              onClick={() => navigate('/rooms')}
              className="mt-4 w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all uppercase tracking-widest border border-dashed border-slate-200 dark:border-slate-700"
            >
              Ver todas as ocorrências
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subValue: string; 
  gradient: string;
  iconBg: string;
  action: () => void;
  alert?: boolean;
}> = ({ icon, label, value, subValue, gradient, iconBg, action, alert }) => (
  <div 
    onClick={action}
    className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-1.5 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[200px]"
  >
    {/* Dynamic Background Gradient */}
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
    
    {alert && (
      <div className="absolute top-6 right-6 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
    )}
    
    <div className="relative z-10 flex items-start justify-between">
      <div className={`p-4 rounded-2xl ${iconBg} group-hover:scale-110 transition-transform duration-300 shadow-sm inline-flex`}>
        {icon}
      </div>
    </div>
    
    <div className="relative z-10 mt-6 pt-2">
      <p className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tighter mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {value}
      </p>
      <h4 className="text-slate-800 dark:text-slate-200 text-sm font-bold tracking-tight mb-1">{label}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subValue}</p>
    </div>
  </div>
);

export default Dashboard;

