
import React, { useState } from 'react';
import {
  Plus, Search, Filter, UserPlus, Power, Trash2, Edit3, X, Check,
  ShieldCheck, ShieldAlert, Shield, LayoutDashboard, Bed, CheckSquare,
  GlassWater, Wrench, Package, BookOpen, FileText, BarChart3, Users as UsersIcon,
  AlertCircle, Mail, Wind, Sparkles, KeyRound
} from 'lucide-react';
import { User, UserRole, PermissionModule } from '../types';
import { ALL_MODULES } from '../constants';
import { upsertUserProfile } from '../lib/authService';
import { useToast } from '../context/ToastContext';

const TeamManagement: React.FC<{
  user: User;
  allUsers: User[];
  onUsersChanged: () => void;
}> = ({ user: currentUser, allUsers, onUsersChanged }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: UserRole.HOUSEKEEPING,
    contact: '',
    photo: '',
    active: true,
    permissions: ['rooms', 'housekeeping', 'minibar', 'logbook']
  });

  const handleToggleActive = async (member: User) => {
    if (member.id === currentUser.id) {
      addToast("Ação Bloqueada: Você não pode desativar sua própria conta.", 'ERROR');
      return;
    }
    try {
      await upsertUserProfile({ ...member, active: !member.active });
      onUsersChanged();
      addToast("Status do colaborador atualizado.", 'SUCCESS');
    } catch {
      addToast("Não foi possível atualizar o status. Verifique sua permissão de admin.", 'ERROR');
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = (formData.email || '').trim().toLowerCase();
    if (!email) return;

    setIsSaving(true);
    try {
      const member: User = {
        id: email,
        name: formData.name || 'Novo Membro',
        email,
        role: formData.role as UserRole,
        contact: formData.contact || '',
        photo: formData.photo || `https://picsum.photos/seed/${encodeURIComponent(email)}/200`,
        active: formData.active !== false,
        permissions: formData.permissions || [],
      };
      await upsertUserProfile(member);
      onUsersChanged();
      setShowAddModal(false);
      setEditingMember(null);
      addToast(
        editingMember
          ? "Dados do colaborador atualizados com sucesso."
          : "Colaborador cadastrado! Ele(a) pode entrar com Google ou criar uma senha em \"Primeiro acesso\" na tela de login, usando este e-mail.",
        'SUCCESS'
      );
    } catch {
      addToast("Não foi possível salvar. Verifique sua permissão de admin.", 'ERROR');
    } finally {
      setIsSaving(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: UserRole.HOUSEKEEPING,
      contact: '',
      photo: '',
      active: true,
      permissions: ['rooms', 'housekeeping', 'minibar', 'logbook']
    });
  };

  const handleEditClick = (member: User) => {
    setEditingMember(member);
    setFormData(member);
  };

  const togglePermission = (module: PermissionModule) => {
    const current = formData.permissions || [];
    if (current.includes(module)) {
      if (formData.role === UserRole.ADMIN && (module === 'team' || module === 'dashboard')) return;
      setFormData({ ...formData, permissions: current.filter(p => p !== module) });
    } else {
      setFormData({ ...formData, permissions: [...current, module] });
    }
  };

  const filteredTeam = allUsers.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Added ai_insights to satisfy Record<PermissionModule, any>
  const moduleIcons: Record<PermissionModule, any> = {
    dashboard: LayoutDashboard,
    rooms: Bed,
    housekeeping: CheckSquare,
    minibar: GlassWater,
    maintenance: Wrench,
    inventory: Package,
    logbook: BookOpen,
    reports: FileText,
    performance: BarChart3,
    team: UsersIcon,
    ac_management: Wind,
    ai_insights: Sparkles
  };

  // Added ai_insights to satisfy Record<PermissionModule, string>
  const moduleLabels: Record<PermissionModule, string> = {
    dashboard: 'Dashboard',
    rooms: 'Quartos',
    housekeeping: 'Limpeza',
    minibar: 'Frigobar',
    maintenance: 'Manutenção',
    inventory: 'Estoque',
    logbook: 'Logbook',
    reports: 'Relatórios',
    performance: 'Desempenho',
    team: 'Equipe',
    ac_management: 'Ar Condicionado',
    ai_insights: 'Cérebro IA'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Equipe & Colaboradores</h1>
          <p className="text-slate-500 dark:text-slate-500 font-medium">Controle de acessos individuais e hierarquia operacional.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[1.5rem] text-sm font-black transition-all shadow-2xl shadow-blue-500/20 active:scale-95"
        >
          <UserPlus size={20} /> Novo Colaborador
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..." 
            className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-black border-none rounded-2xl text-sm dark:text-white outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500 transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-black/30 text-[11px] uppercase font-black text-slate-400 dark:text-slate-600 tracking-[0.2em] border-b dark:border-slate-800">
                <th className="px-10 py-8">Profissional</th>
                <th className="px-10 py-8">Acesso / Senha</th>
                <th className="px-10 py-8">Acesso a Módulos</th>
                <th className="px-10 py-8">Estado</th>
                <th className="px-10 py-8 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTeam.map(member => (
                <tr key={member.id} className={`group transition-all ${!member.active ? 'opacity-30 grayscale' : 'hover:bg-slate-50/50 dark:hover:bg-black/20'}`}>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <img 
                          src={member.photo} 
                          className="w-14 h-14 rounded-[1.25rem] border-2 border-white dark:border-slate-700 shadow-xl object-cover" 
                        />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-white dark:border-slate-900 ${member.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white leading-none mb-2">{member.name}</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          member.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                          member.role === UserRole.MAINTENANCE ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <Mail size={14} className="text-blue-500" />
                        <span className="text-xs font-bold">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 dark:text-slate-600">
                        <KeyRound size={14} />
                        <span className="text-xs font-bold tracking-widest uppercase">Acesso via Google ou senha própria</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex -space-x-2">
                      {member.permissions?.slice(0, 6).map((p, i) => {
                        const Icon = moduleIcons[p];
                        return (
                          <div key={i} className="w-10 h-10 bg-slate-100 dark:bg-black border-2 border-white dark:border-slate-900 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-600 shadow-sm" title={moduleLabels[p]}>
                             <Icon size={14} />
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${member.active ? 'text-emerald-600' : 'text-red-500'}`}>
                      {member.active ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={() => handleToggleActive(member)}
                        className={`p-3 rounded-2xl transition-all ${
                          member.active ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                        }`}
                      >
                        <Power size={22} />
                      </button>
                      <button 
                        onClick={() => handleEditClick(member)}
                        className="p-3 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all"
                      >
                        <Edit3 size={22} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Edição/Criação */}
      {(showAddModal || editingMember) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border dark:border-slate-800">
            <div className="p-10 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.75rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 transform -rotate-3">
                   <ShieldCheck size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{editingMember ? 'Configurar Colaborador' : 'Novo Colaborador'}</h2>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Defina o acesso e permissões</p>
                </div>
              </div>
              <button onClick={() => { setShowAddModal(false); setEditingMember(null); resetForm(); }} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 dark:text-slate-600">
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleSaveMember} className="p-10 space-y-10 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1">Nome Completo</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-6 py-4.5 bg-slate-50 dark:bg-black border-none rounded-2xl text-sm dark:text-white outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                        placeholder="Nome do funcionário"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1">E-mail Profissional</label>
                      <input
                        required
                        type="email"
                        disabled={!!editingMember}
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-6 py-4.5 bg-slate-50 dark:bg-black border-none rounded-2xl text-sm dark:text-white outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500 transition-all font-bold disabled:opacity-60"
                        placeholder="exemplo@palacioaraguaia.com"
                      />
                      {editingMember ? (
                        <p className="text-[10px] font-bold text-slate-400 mt-2 ml-1">O e-mail identifica o acesso e não pode ser alterado aqui.</p>
                      ) : (
                        <p className="text-[10px] font-bold text-slate-400 mt-2 ml-1">O colaborador usa este e-mail para entrar com Google ou criar uma senha própria em "Primeiro acesso".</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 ml-1">Cargo & Hierarquia</label>
                    <div className="grid grid-cols-1 gap-2.5">
                       {[UserRole.ADMIN, UserRole.MAINTENANCE, UserRole.HOUSEKEEPING, UserRole.RECEPTION, UserRole.GOVERNANCE].map(role => (
                         <button
                           key={role}
                           type="button"
                           onClick={() => {
                             const defaultPerms: PermissionModule[] = role === UserRole.ADMIN ? [...ALL_MODULES] : ['rooms', 'logbook'];
                             setFormData({...formData, role, permissions: defaultPerms});
                           }}
                           className={`flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black transition-all border uppercase tracking-[0.15em] ${
                             formData.role === role 
                             ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' 
                             : 'bg-white dark:bg-black border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-600 hover:border-blue-500'
                           }`}
                         >
                           {role}
                           {formData.role === role && <Check size={18} />}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                   <div className="bg-slate-50 dark:bg-black/30 p-8 rounded-[2.5rem] border dark:border-slate-800">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 text-center">Módulos do Sistema</label>
                    <div className="grid grid-cols-2 gap-3">
                      {ALL_MODULES.map(mod => {
                        const Icon = moduleIcons[mod];
                        const isActive = formData.permissions?.includes(mod);
                        return (
                          <button
                            key={mod}
                            type="button"
                            onClick={() => togglePermission(mod)}
                            className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                              isActive 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                              : 'bg-white dark:bg-black border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-600 hover:border-blue-500'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-900'}`}>
                              <Icon size={14} />
                            </div>
                            <span className="text-[10px] font-black tracking-tight uppercase truncate">{moduleLabels[mod]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/20 flex gap-5">
                    <AlertCircle className="text-blue-500 shrink-0 mt-1" size={24} />
                    <p className="text-[11px] font-bold text-blue-900 dark:text-blue-300 leading-relaxed">
                      Lembrete: O colaborador terá acesso imediato aos módulos selecionados. Utilize o cargo para definir permissões padrão rapidamente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-5">
                <button 
                  type="button" 
                  onClick={() => { setShowAddModal(false); setEditingMember(null); resetForm(); }}
                  className="flex-1 px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-3xl text-sm font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] px-10 py-5 bg-blue-600 text-white rounded-3xl text-sm font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-95 uppercase tracking-widest"
                >
                  {editingMember ? 'Salvar Configurações' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
