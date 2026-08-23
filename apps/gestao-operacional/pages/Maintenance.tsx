
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, DollarSign, Clock, AlertTriangle, Filter, Search, History, X, Wrench,
  CheckCircle2, MoreVertical, Calendar, User as UserIcon, MessageCircle,
  RefreshCcw, CalendarDays, Zap, Activity, ShieldCheck, ChevronRight, Settings,
  RotateCcw, Info, Check, Play, ListTodo, Archive, ArrowRight, MapPin
} from 'lucide-react';
import { User, MaintenanceTask, UserRole, RoomStatus, RoomHistory, RecurringMaintenance, MaintenanceFrequency, Room } from '../types';
import { MOCK_MAINTENANCE, MOCK_ROOMS } from '../constants';
import { useToast } from '../context/ToastContext';
import { DatabaseService } from '../database';
import { getAmbientes, getRegistros, getAlertasRecorrencia, ambienteTemPendencia } from '../lib/manutencao';
import AmbientesTab from './maintenance/AmbientesTab';

const Maintenance: React.FC<{ user: User }> = ({ user }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  const [activeTab, setActiveTab] = useState<'TASKS' | 'RECURRING' | 'AMBIENTES'>('TASKS');
  const [ambientesAlertCount, setAmbientesAlertCount] = useState(0);

  useEffect(() => {
    const rooms = DatabaseService.getRooms(MOCK_ROOMS);
    const registros = getRegistros();
    const alertas = getAlertasRecorrencia(registros);
    const pendentesGraves = rooms.length ? getAmbientes(rooms).filter(a => ambienteTemPendencia(registros, a.id)).length : 0;
    setAmbientesAlertCount(alertas.length + pendentesGraves);
  }, [activeTab]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [recurringSchedules, setRecurringSchedules] = useState<RecurringMaintenance[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { addToast } = useToast();

  // Carregar dados
  useEffect(() => {
    const savedTasks = localStorage.getItem('araguaia_maintenance_tasks');
    const savedRecurring = localStorage.getItem('araguaia_maintenance_recurring');
    
    setTasks(savedTasks ? JSON.parse(savedTasks) : MOCK_MAINTENANCE);
    
    const initialRecurring: RecurringMaintenance[] = [
      {
        id: 'r1',
        target: 'Chiller Central',
        type: 'Climatização',
        frequency: 'MONTHLY',
        lastExecution: '2025-10-15',
        nextExecution: '2025-11-15',
        description: 'Limpeza de filtros e verificação de nível de gás',
        priority: 'Alta',
        active: true
      },
      {
        id: 'r2',
        target: 'Quartos 3º Piso',
        type: 'Mobiliário',
        frequency: 'QUARTERLY',
        lastExecution: '2025-08-20',
        nextExecution: '2025-11-20',
        description: 'Revisão geral de dobradiças e fechaduras',
        priority: 'Média',
        active: true
      }
    ];

    setRecurringSchedules(savedRecurring ? JSON.parse(savedRecurring) : initialRecurring);
  }, []);

  const saveTasks = (newTasks: MaintenanceTask[]) => {
    setTasks(newTasks);
    localStorage.setItem('araguaia_maintenance_tasks', JSON.stringify(newTasks));
  };

  const saveRecurring = (newRecurring: RecurringMaintenance[]) => {
    setRecurringSchedules(newRecurring);
    localStorage.setItem('araguaia_maintenance_recurring', JSON.stringify(newRecurring));
  };

  const updateTaskStatus = (taskId: string, newStatus: MaintenanceTask['status']) => {
    const updatedTasks = tasks.map(t => {
        if (t.id === taskId) {
            // Se estiver finalizando, registra no histórico do quarto
            if (newStatus === 'COMPLETED') {
                const now = new Date();
                const logEntry: RoomHistory = {
                    date: `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
                    action: `🛠️ MANUTENÇÃO CONCLUÍDA: ${t.type}\nDescrição: ${t.description}\nCusto Registrado: R$ ${t.cost.toFixed(2)}`,
                    user: user.name,
                    type: 'MAINTENANCE'
                };

                // Atualizar o histórico do quarto no localStorage
                const savedRooms = localStorage.getItem('araguaia_rooms_data');
                if (savedRooms) {
                    const rooms: Room[] = JSON.parse(savedRooms);
                    const updatedRooms = rooms.map(r => {
                        if (r.number === t.roomId) {
                            return {
                                ...r,
                                status: RoomStatus.DIRTY, // Após manutenção, precisa limpar
                                lastMaintenance: now.toLocaleDateString('pt-BR'),
                                history: [logEntry, ...(r.history || [])]
                            };
                        }
                        return r;
                    });
                    localStorage.setItem('araguaia_rooms_data', JSON.stringify(updatedRooms));
                }
            }
            return { ...t, status: newStatus };
        }
        return t;
    });
    saveTasks(updatedTasks);
    setSelectedTask(null);
    if (newStatus === 'COMPLETED') {
      addToast("OS Finalizada! Unidade liberada para limpeza e log registrado.", 'SUCCESS');
    } else {
      addToast("Status da Ordem de Serviço atualizado.", 'INFO');
    }
  };

  // Lógica de Geração Automática de Tarefas baseada em Cronogramas
  const syncSchedules = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const newTasks: MaintenanceTask[] = [];
      const updatedSchedules = recurringSchedules.map(schedule => {
        if (schedule.active && schedule.nextExecution <= todayStr) {
          // Gerar nova tarefa
          const newTask: MaintenanceTask = {
            id: Math.random().toString(36).substr(2, 9),
            roomId: schedule.target.includes('Quarto') ? schedule.target.match(/\d+/)?.[0] || 'Geral' : schedule.target,
            type: `PREVENTIVA: ${schedule.type}`,
            description: `Manutenção Recorrente Automática: ${schedule.description}`,
            priority: schedule.priority,
            cost: 0,
            date: new Date().toLocaleString('pt-BR'),
            responsible: 'Sistema Automação',
            status: 'PENDING'
          };
          newTasks.push(newTask);

          // Calcular próxima execução
          const nextDate = new Date(schedule.nextExecution);
          if (schedule.frequency === 'DAILY') nextDate.setDate(nextDate.getDate() + 1);
          if (schedule.frequency === 'WEEKLY') nextDate.setDate(nextDate.getDate() + 7);
          if (schedule.frequency === 'MONTHLY') nextDate.setMonth(nextDate.getMonth() + 1);
          if (schedule.frequency === 'QUARTERLY') nextDate.setMonth(nextDate.getMonth() + 3);
          if (schedule.frequency === 'YEARLY') nextDate.setFullYear(nextDate.getFullYear() + 1);

          return {
            ...schedule,
            lastExecution: schedule.nextExecution,
            nextExecution: nextDate.toISOString().split('T')[0]
          };
        }
        return schedule;
      });

      if (newTasks.length > 0) {
        saveTasks([...newTasks, ...tasks]);
        saveRecurring(updatedSchedules);
        addToast(`${newTasks.length} novas preventivas geradas e cronogramas atualizados.`, 'SUCCESS');
      } else {
        addToast("Sincronização concluída. Nenhum cronograma pendente.", 'INFO');
      }
      setIsSyncing(false);
    }, 1200);
  };

  const handleCreateRecurring = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSchedule: RecurringMaintenance = {
      id: Math.random().toString(36).substr(2, 9),
      target: formData.get('target') as string,
      type: formData.get('type') as string,
      frequency: formData.get('frequency') as MaintenanceFrequency,
      description: formData.get('description') as string,
      priority: formData.get('priority') as any,
      lastExecution: '-',
      nextExecution: formData.get('nextExecution') as string,
      active: true
    };
    saveRecurring([...recurringSchedules, newSchedule]);
    setShowRecurringModal(false);
    addToast("Novo cronograma de manutenção ativado com sucesso.", 'SUCCESS');
  };

  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const roomId = formData.get('room') as string;
    const type = formData.get('type') as string;
    
    const newTask: MaintenanceTask = {
      id: Math.random().toString(36).substr(2, 9),
      roomId,
      type,
      description: formData.get('description') as string,
      priority: formData.get('priority') as any,
      cost: isAdmin ? Number(formData.get('cost')) : 0,
      date: new Date().toLocaleString('pt-BR'),
      responsible: user.name,
      status: 'PENDING'
    };

    saveTasks([newTask, ...tasks]);
    setShowCreateModal(false);
    addToast("Nova Ordem de Serviço (OS) aberta com sucesso.", 'SUCCESS');
  };

  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const activeSchedulesCount = recurringSchedules.filter(s => s.active).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-1">Engenharia Clínica & Predial</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-2">
            <Activity size={14} className="text-orange-500" /> Gestão de Ativos e Manutenção Corretiva/Preventiva
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={syncSchedules}
            disabled={isSyncing}
            className="flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {isSyncing ? <RefreshCcw className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
            Sincronizar Cronogramas
          </button>
          <button 
            onClick={() => activeTab === 'TASKS' ? setShowCreateModal(true) : setShowRecurringModal(true)}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus size={18} /> {activeTab === 'TASKS' ? 'Nova Ordem' : 'Novo Cronograma'}
          </button>
        </div>
      </div>

      {/* KPI Row Estilizado */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard 
          label="Chamados Pendentes" 
          value={pendingCount.toString()} 
          icon={<Clock size={24} />} 
          color="bg-orange-500" 
          description="Aguardando atendimento"
        />
        <KPICard 
          label="Em Execução" 
          value={inProgressCount.toString()} 
          icon={<Zap size={24} />} 
          color="bg-blue-500" 
          description="Equipes em campo"
        />
        <KPICard 
          label="Ativos Monitorados" 
          value={activeSchedulesCount.toString()} 
          icon={<Settings size={24} />} 
          color="bg-purple-600" 
          description="Manutenção Preventiva"
        />
        <KPICard 
          label="Custo Operacional" 
          value={`R$ ${tasks.reduce((acc, t) => acc + (t.cost || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
          icon={<DollarSign size={24} />} 
          color="bg-emerald-600" 
          description="Investimento do mês"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Navigation Tabs (Estilo Google) */}
        <div className="flex border-b dark:border-slate-800 bg-slate-50/50 dark:bg-black/20 p-2 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('TASKS')}
            className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all relative ${
              activeTab === 'TASKS' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-blue-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <ListTodo size={14} /> Ordens de Serviço (Corretivas)
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('RECURRING')}
            className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all relative ${
              activeTab === 'RECURRING' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-blue-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <RotateCcw size={14} /> Cronogramas de Manutenção (Preventivas)
            </div>
            {recurringSchedules.some(s => s.active && s.nextExecution <= new Date().toISOString().split('T')[0]) && (
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('AMBIENTES')}
            className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all relative ${
              activeTab === 'AMBIENTES' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-blue-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin size={14} /> Diagnóstico por Ambiente
            </div>
            {ambientesAlertCount > 0 && (
              <span className="absolute top-3 right-3 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
            )}
          </button>
        </div>

        <div className="p-8 flex-1">
          {activeTab === 'TASKS' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Pesquisar ordens ou equipamentos..." 
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-black/40 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] border-b dark:border-slate-800">
                      <th className="px-10 py-6">Ativo / Local</th>
                      <th className="px-10 py-6">Prioridade</th>
                      <th className="px-10 py-6">Status</th>
                      <th className="px-10 py-6">Data Abertura</th>
                      <th className="px-10 py-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tasks.map(task => (
                      <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-black/20 transition-all group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center font-black shadow-inner">
                              {task.roomId.match(/\d+/) ? `#${task.roomId}` : <Wrench size={20} />}
                            </div>
                            <div>
                              <span className="text-sm font-black text-slate-900 dark:text-white block uppercase tracking-tight">{task.type}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1">{task.description}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                            task.priority === 'Urgente' ? 'bg-red-100 text-red-600' :
                            task.priority === 'Alta' ? 'bg-orange-100 text-orange-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              task.status === 'COMPLETED' ? 'bg-emerald-500' : 
                              task.status === 'IN_PROGRESS' ? 'bg-blue-500 animate-pulse' : 'bg-orange-500'
                            }`} />
                            <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                              {task.status === 'COMPLETED' ? 'Concluído' : task.status === 'IN_PROGRESS' ? 'Executando' : 'Aguardando'}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-tight">{task.date}</span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button onClick={() => setSelectedTask(task)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline px-4 py-2 bg-blue-50 dark:bg-blue-900/10 rounded-xl transition-all">Gerenciar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'RECURRING' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {recurringSchedules.map(schedule => (
                  <div key={schedule.id} className={`bg-white dark:bg-slate-950 p-8 rounded-[3rem] border-2 transition-all group relative overflow-hidden ${schedule.active ? 'border-slate-50 dark:border-slate-800 hover:shadow-2xl' : 'opacity-60 border-dashed border-slate-200 dark:border-slate-800'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-5">
                         <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center text-white shadow-xl ${schedule.active ? 'bg-purple-600' : 'bg-slate-400'}`}>
                            <RotateCcw size={28} />
                         </div>
                         <div>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">{schedule.target}</h4>
                            <div className="flex items-center gap-3">
                               <span className={`text-[9px] font-black px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-widest`}>{schedule.type}</span>
                               <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                                 <RefreshCcw size={10} /> {schedule.frequency}
                               </span>
                            </div>
                         </div>
                      </div>
                      <button 
                        onClick={() => saveRecurring(recurringSchedules.map(s => s.id === schedule.id ? {...s, active: !s.active} : s))}
                        className={`w-14 h-7 rounded-full relative transition-all ${schedule.active ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                      >
                         <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all ${schedule.active ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed mb-8 px-2">
                      {schedule.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-5 bg-slate-50 dark:bg-black/30 rounded-[1.5rem] border dark:border-slate-800">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Última Execução</p>
                          <p className="text-xs font-black text-slate-900 dark:text-white">{schedule.lastExecution === '-' ? 'Nenhuma' : schedule.lastExecution}</p>
                       </div>
                       <div className={`p-5 rounded-[1.5rem] border-2 ${
                         schedule.active && schedule.nextExecution <= new Date().toISOString().split('T')[0] 
                          ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20' 
                          : 'bg-slate-50 dark:bg-black/30 border-slate-100 dark:border-slate-800'
                       }`}>
                          <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${
                            schedule.active && schedule.nextExecution <= new Date().toISOString().split('T')[0] ? 'text-red-500' : 'text-slate-400'
                          }`}>Próxima Revisão</p>
                          <p className={`text-xs font-black ${
                             schedule.active && schedule.nextExecution <= new Date().toISOString().split('T')[0] ? 'text-red-600' : 'text-slate-900 dark:text-white'
                          }`}>{schedule.nextExecution}</p>
                       </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => setShowRecurringModal(true)}
                  className="bg-slate-50 dark:bg-black/20 p-8 rounded-[3.5rem] border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500/30 transition-all group"
                >
                   <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      <Plus size={32} />
                   </div>
                   <p className="text-xs font-black uppercase tracking-widest">Adicionar Novo Ciclo de Manutenção</p>
                </button>
              </div>

              <div className="bg-blue-600 p-10 rounded-[4rem] text-white flex items-center gap-10 shadow-2xl relative overflow-hidden">
                 <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
                    <ShieldCheck size={40} />
                 </div>
                 <div className="relative z-10">
                    <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 leading-none">Manutenção Preventiva Automática</h4>
                    <p className="text-sm font-bold text-blue-100 leading-relaxed uppercase tracking-widest">
                       O sistema verifica diariamente os prazos e gera ordens de serviço (OS) antecipadamente para evitar paradas críticas de equipamentos e interdição de quartos.
                    </p>
                 </div>
                 <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-[80px]" />
              </div>
            </div>
          )}

          {activeTab === 'AMBIENTES' && <AmbientesTab user={user} />}
        </div>
      </div>

      {/* Task Details / Management Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 rounded-[4rem] w-full max-w-xl overflow-hidden shadow-2xl border dark:border-slate-800">
              <div className="p-10 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-orange-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg">
                       <Wrench size={28} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">Gerenciar Ordem #{selectedTask.id}</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo Técnico</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTask(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400">
                   <X size={24} />
                 </button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-[2rem] border dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detalhamento da OS</p>
                    <div className="space-y-4">
                       <div className="flex justify-between">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Localização:</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase">Quarto {selectedTask.roomId}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo:</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{selectedTask.type}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Abertura:</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">{selectedTask.date}</span>
                       </div>
                       <div className="pt-4 border-t dark:border-slate-800">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Relato do Ocorrido:</span>
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">"{selectedTask.description}"</p>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedTask.status === 'PENDING' && (
                       <button 
                         onClick={() => updateTaskStatus(selectedTask.id, 'IN_PROGRESS')}
                         className="flex items-center justify-center gap-3 bg-blue-600 text-white py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
                       >
                         <Play size={18} /> Iniciar Atendimento
                       </button>
                    )}
                    {selectedTask.status === 'IN_PROGRESS' && (
                       <button 
                         onClick={() => updateTaskStatus(selectedTask.id, 'COMPLETED')}
                         className="flex items-center justify-center gap-3 bg-emerald-600 text-white py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 col-span-full"
                       >
                         <CheckCircle2 size={18} /> Finalizar Manutenção
                       </button>
                    )}
                    <button 
                      onClick={() => setSelectedTask(null)}
                      className={`flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${selectedTask.status === 'IN_PROGRESS' ? 'hidden' : 'flex'}`}
                    >
                      Voltar
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Modal Novo Cronograma */}
      {showRecurringModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[4rem] w-full max-w-2xl overflow-hidden shadow-2xl border dark:border-slate-800">
            <div className="p-12 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl">
                   <RotateCcw size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">Agendar Preventiva</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Planejamento de Ativos</p>
                </div>
              </div>
              <button onClick={() => setShowRecurringModal(false)} className="p-5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[1.5rem] transition-all text-slate-400">
                <X size={32} />
              </button>
            </div>
            <form onSubmit={handleCreateRecurring} className="p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Ativo / Equipamento</label>
                    <input name="target" required className="w-full px-6 py-5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: Elevador Bloco A" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Frequência</label>
                    <select name="frequency" className="w-full px-6 py-5 bg-slate-900 text-white border-2 border-slate-800 rounded-3xl text-sm font-black outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer">
                      <option value="DAILY">Diário</option>
                      <option value="WEEKLY">Semanal</option>
                      <option value="MONTHLY">Mensal</option>
                      <option value="QUARTERLY">Trimestral</option>
                      <option value="YEARLY">Anual</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Data Primeira Revisão</label>
                    <input name="nextExecution" type="date" required className="w-full px-6 py-5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Setor / Tipo</label>
                    <select name="type" className="w-full px-6 py-5 bg-slate-900 text-white border-2 border-slate-800 rounded-3xl text-sm font-black outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer">
                      <option value="Elétrica">Elétrica</option>
                      <option value="Hidráulica">Hidráulica</option>
                      <option value="Climatização">Climatização</option>
                      <option value="Civil">Civil / Pintura</option>
                      <option value="Mobiliário">Mobiliário</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Instruções Técnicas</label>
                <textarea name="description" rows={3} required className="w-full px-6 py-5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm resize-none" placeholder="O que deve ser revisado?" />
              </div>
              <div className="pt-8 flex gap-6">
                <button type="button" onClick={() => setShowRecurringModal(false)} className="flex-1 px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all">Sair</button>
                <button type="submit" className="flex-[2] px-10 py-5 bg-purple-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Ativar Cronograma</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova Manutenção Corretiva */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[4rem] w-full max-w-2xl overflow-hidden shadow-2xl border dark:border-slate-800">
            <div className="p-12 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-orange-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl">
                   <Wrench size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">Novo Chamado</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manutenção Corretiva</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[1.5rem] transition-all text-slate-400">
                <X size={32} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-12 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Unidade / Local</label>
                  <input name="room" required className="w-full px-6 py-4.5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: 301 ou Lobby" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tipo Serviço</label>
                  <input name="type" required className="w-full px-6 py-4.5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: Vazamento" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Prioridade</label>
                <select name="priority" className="w-full px-6 py-4.5 bg-slate-900 text-white border-2 border-slate-800 rounded-3xl text-sm font-black outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer">
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Custo Estimado (R$)</label>
                <input name="cost" type="number" step="0.01" defaultValue="0" className="w-full px-6 py-4.5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descrição do Defeito</label>
                <textarea name="description" rows={3} required className="w-full px-6 py-5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm resize-none" placeholder="Relate o ocorrido..." />
              </div>
              <div className="pt-6 flex gap-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-3xl text-[10px] font-black uppercase tracking-widest">Sair</button>
                <button type="submit" className="flex-[2] px-8 py-4 bg-blue-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Abrir OS</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const KPICard: React.FC<{ label: string; value: string; icon: React.ReactNode; color: string; description: string }> = ({ label, value, icon, color, description }) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border dark:border-slate-800 shadow-sm transition-all hover:shadow-2xl hover:scale-[1.02] group">
    <div className="flex items-center justify-between mb-8">
      <div className={`p-4 rounded-2xl ${color} text-white shadow-xl shadow-current/20`}>
        {icon}
      </div>
      <div className="text-right">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{value}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
      {description}
    </div>
  </div>
);

export default Maintenance;
