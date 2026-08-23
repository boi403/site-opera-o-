
import React, { useState, useMemo } from 'react';
import { 
  Plus, DollarSign, TrendingDown, Package, Search, Filter, 
  Calendar, User as UserIcon, Bed, GlassWater, X, PieChart as PieIcon,
  TrendingUp, ArrowRight, Save, Tag
} from 'lucide-react';
import { User, MinibarTransaction, UserRole, MinibarItem } from '../types';
import { MOCK_MINIBAR, MOCK_MINIBAR_CATALOG, MOCK_ROOMS } from '../constants';

const Minibar: React.FC<{ user: User }> = ({ user }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  const [transactions, setTransactions] = useState<MinibarTransaction[]>(MOCK_MINIBAR);
  const [catalog, setCatalog] = useState<MinibarItem[]>(MOCK_MINIBAR_CATALOG);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'BEVERAGE' | 'SNACK' | 'ALCOHOL'>('ALL');
  const [reportCategoryFilter, setReportCategoryFilter] = useState<'ALL' | 'BEVERAGE' | 'SNACK' | 'ALCOHOL'>('ALL');
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showPopularityReport, setShowPopularityReport] = useState(false);

  // Consumption form state
  const [newConsumption, setNewConsumption] = useState({
    roomId: '',
    itemId: '',
    quantity: 1,
    status: 'CONSUMED' as 'CONSUMED' | 'LOSS'
  });

  // New item form state
  const [newItem, setNewItem] = useState({
    name: '',
    price: 0,
    category: 'BEVERAGE' as 'BEVERAGE' | 'SNACK' | 'ALCOHOL'
  });

  // Stats calculation
  const consumptionToday = useMemo(() => transactions
    .filter(t => t.status === 'CONSUMED' && t.date.includes('Hoje'))
    .reduce((acc, t) => acc + t.value, 0), [transactions]);
  
  const lossesMonth = useMemo(() => transactions
    .filter(t => t.status === 'LOSS')
    .reduce((acc, t) => acc + t.value, 0), [transactions]);

  // Popularity Calculation with Category Filtering
  const popularityReport = useMemo(() => {
    const counts: Record<string, { name: string, total: number, revenue: number, category: string }> = {};
    
    transactions.forEach(t => {
      if (t.status === 'CONSUMED') {
        const catalogItem = catalog.find(ci => ci.name === t.item);
        const itemCategory = catalogItem?.category || 'OTHER';

        // Filter by category if not 'ALL'
        if (reportCategoryFilter !== 'ALL' && itemCategory !== reportCategoryFilter) {
          return;
        }

        if (!counts[t.item]) {
          counts[t.item] = { name: t.item, total: 0, revenue: 0, category: itemCategory };
        }
        counts[t.item].total += t.quantity;
        counts[t.item].revenue += t.value;
      }
    });
    
    return Object.values(counts).sort((a, b) => b.total - a.total);
  }, [transactions, reportCategoryFilter, catalog]);

  const handleAddConsumption = (e: React.FormEvent) => {
    e.preventDefault();
    const item = catalog.find(i => i.id === newConsumption.itemId);
    if (!item || !newConsumption.roomId) return;

    const transaction: MinibarTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      roomId: newConsumption.roomId,
      item: item.name,
      quantity: newConsumption.quantity,
      value: item.price * newConsumption.quantity,
      registeredBy: user.name,
      date: `Hoje ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      status: newConsumption.status
    };

    setTransactions([transaction, ...transactions]);
    setShowConsumptionModal(false);
    setNewConsumption({ roomId: '', itemId: '', quantity: 1, status: 'CONSUMED' });
  };

  const handleAddItemToCatalog = (e: React.FormEvent) => {
    e.preventDefault();
    const item: MinibarItem = {
      id: `c${catalog.length + 1}`,
      ...newItem
    };
    setCatalog([...catalog, item]);
    setShowAddItemModal(false);
    setNewItem({ name: '', price: 0, category: 'BEVERAGE' });
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.roomId.includes(searchTerm) || t.item.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (categoryFilter === 'ALL') return matchesSearch;
      
      // Encontrar a categoria do item no catálogo para filtrar
      const catalogItem = catalog.find(ci => ci.name === t.item);
      const matchesCategory = catalogItem?.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchTerm, categoryFilter, catalog]);

  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case 'BEVERAGE': return 'Bebida';
      case 'SNACK': return 'Snack';
      case 'ALCOHOL': return 'Álcool';
      default: return cat;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'BEVERAGE': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'SNACK': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'ALCOHOL': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Gerenciamento de Frigobar</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Controle de consumo, reposição e catálogo de produtos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setShowPopularityReport(!showPopularityReport)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${
              showPopularityReport ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-900'
            }`}
          >
            <PieIcon size={18} /> {showPopularityReport ? 'Fechar Relatório' : 'Mais Vendidos'}
          </button>
          {isAdmin && (
            <button 
              onClick={() => setShowAddItemModal(true)}
              className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Package size={18} /> Catálogo
            </button>
          )}
          <button 
            onClick={() => setShowConsumptionModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} /> Lançar Consumo
          </button>
        </div>
      </div>

      {showPopularityReport && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-blue-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Relatório de Saída</h3>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Top Itens Consumidos</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-2">Filtrar Relatório:</span>
              <div className="flex bg-slate-100 dark:bg-black p-1 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800">
                {(['ALL', 'BEVERAGE', 'SNACK', 'ALCOHOL'] as const).map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setReportCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all uppercase tracking-tight ${
                      reportCategoryFilter === cat 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-blue-600'
                    }`}
                  >
                    {cat === 'ALL' ? 'Todos' : getCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularityReport.length > 0 ? popularityReport.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-5 p-5 bg-slate-50 dark:bg-black/20 rounded-[1.5rem] border dark:border-slate-800 transition-transform hover:scale-[1.02] group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-all group-hover:rotate-6 ${
                  idx === 0 ? 'bg-amber-100 text-amber-600 shadow-amber-200' : 'bg-blue-100 text-blue-600 shadow-blue-200'
                }`}>
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1 uppercase truncate">{item.name}</p>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getCategoryColor(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 dark:text-white">R$ {item.revenue.toFixed(2)}</p>
                  <p className="text-[10px] font-bold text-slate-400">{item.total} un.</p>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <PieIcon size={48} className="mx-auto text-slate-200 dark:text-slate-800 opacity-30" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhum dado de consumo para esta categoria</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Consumo Hoje" value={`R$ ${consumptionToday.toFixed(2)}`} color="text-green-600" icon={<DollarSign size={24} />} />
        <StatCard label="Perdas (Mês)" value={`R$ ${lossesMonth.toFixed(2)}`} color="text-red-600" icon={<TrendingDown size={24} />} />
        <StatCard label="Itens no Catálogo" value={catalog.length.toString()} color="text-slate-800 dark:text-white" icon={<Package size={24} />} />
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-6">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por quarto ou item..." 
            className="w-full pl-14 pr-6 py-4.5 bg-slate-50 dark:bg-black border-none rounded-2xl text-sm dark:text-white outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500 transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Filtrar Lista:</span>
          <div className="flex bg-slate-100 dark:bg-black p-1 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800">
            {(['ALL', 'BEVERAGE', 'SNACK', 'ALCOHOL'] as const).map((cat) => (
              <button 
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-tight ${
                  categoryFilter === cat 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-slate-500 hover:text-blue-500'
                }`}
              >
                {cat === 'ALL' ? 'Todos' : getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-black/30 text-[10px] uppercase font-black text-slate-400 dark:text-slate-600 tracking-[0.2em] border-b dark:border-slate-800">
                <th className="px-10 py-6">Quarto</th>
                <th className="px-10 py-6">Item / Categoria</th>
                <th className="px-10 py-6">Qtd</th>
                <th className="px-10 py-6">Valor Total</th>
                <th className="px-10 py-6">Registrado por</th>
                <th className="px-10 py-6">Data</th>
                <th className="px-10 py-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map(t => {
                const catalogItem = catalog.find(c => c.name === t.item);
                const cat = catalogItem?.category || 'OTHER';
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-black/20 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl flex items-center justify-center font-black">
                          {t.roomId}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="space-y-1">
                        <span className="text-sm font-black text-slate-900 dark:text-white block leading-none">{t.item}</span>
                        <span className={`inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getCategoryColor(cat)}`}>
                          {getCategoryLabel(cat)}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-sm font-bold text-slate-600 dark:text-slate-400">{t.quantity}</td>
                    <td className="px-10 py-6 text-sm font-black text-slate-900 dark:text-white">R$ {t.value.toFixed(2)}</td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                          <UserIcon size={12} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t.registeredBy}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                        <Calendar size={14} className="shrink-0" />
                        {t.date}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        t.status === 'CONSUMED' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {t.status === 'CONSUMED' ? 'Consumido' : 'Perda'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                      <Search size={40} className="opacity-20" />
                      <p className="text-xs font-black uppercase tracking-[0.2em]">Nenhum lançamento encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consumption Modal */}
      {showConsumptionModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border dark:border-slate-800">
            <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
                <GlassWater className="text-blue-600" /> Registrar Consumo
              </h2>
              <button onClick={() => setShowConsumptionModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddConsumption} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Quarto</label>
                  <select 
                    value={newConsumption.roomId}
                    onChange={(e) => setNewConsumption({...newConsumption, roomId: e.target.value})}
                    required
                    className="w-full px-5 py-3.5 bg-slate-900 text-white border-none rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase tracking-widest"
                  >
                    <option value="" className="bg-slate-900">Selecione...</option>
                    {MOCK_ROOMS.map(r => <option key={r.number} value={r.number} className="bg-slate-900">Quarto {r.number}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Produto</label>
                  <select 
                    value={newConsumption.itemId}
                    onChange={(e) => setNewConsumption({...newConsumption, itemId: e.target.value})}
                    required
                    className="w-full px-5 py-3.5 bg-slate-900 text-white border-none rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase tracking-widest"
                  >
                    <option value="" className="bg-slate-900">Selecione...</option>
                    {catalog.map(i => (
                      <option key={i.id} value={i.id} className="bg-slate-900">
                        {i.name} - R$ {i.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Quantidade</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newConsumption.quantity}
                    onChange={(e) => setNewConsumption({...newConsumption, quantity: Number(e.target.value)})}
                    required
                    className="w-full px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white outline-none focus:border-blue-500 transition-all font-black shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Natureza</label>
                  <select 
                    value={newConsumption.status}
                    onChange={(e) => setNewConsumption({...newConsumption, status: e.target.value as any})}
                    className="w-full px-5 py-3.5 bg-slate-900 text-white border-none rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase tracking-widest"
                  >
                    <option value="CONSUMED" className="bg-slate-900">Consumido</option>
                    <option value="LOSS" className="bg-slate-900">Perda / Desperdício</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowConsumptionModal(false)} className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="flex-[2] px-6 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Confirmar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl border dark:border-slate-800">
            <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
                <Package className="text-blue-600" /> Novo Item Catálogo
              </h2>
              <button onClick={() => setShowAddItemModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddItemToCatalog} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Nome do Produto</label>
                <input 
                  type="text" 
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  required
                  placeholder="Ex: Energético Red Bull"
                  className="w-full px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white outline-none focus:border-blue-500 transition-all font-black shadow-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Preço (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                    required
                    className="w-full px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white outline-none focus:border-blue-500 transition-all font-black shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Categoria</label>
                  <select 
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value as any})}
                    className="w-full px-5 py-3.5 bg-slate-900 text-white border-none rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase tracking-widest"
                  >
                    <option value="BEVERAGE" className="bg-slate-900">Bebida</option>
                    <option value="SNACK" className="bg-slate-900">Snack / Petisco</option>
                    <option value="ALCOHOL" className="bg-slate-900">Alcoólico</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowAddItemModal(false)} className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="flex-[2] px-6 py-4 bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Salvar no Catálogo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-xl transition-all group">
    <div>
      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
        <div className="group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  </div>
);

export default Minibar;
