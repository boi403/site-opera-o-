
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, Search, Plus, Filter, AlertTriangle, ArrowDown, ArrowUp, 
  ShoppingCart, Send, History, ChevronRight, FileText, Edit3, Trash2, X, 
  Phone, Mail, User as UserIcon, Calendar, CheckCircle, Clock, Info, Check,
  MessageCircle, ExternalLink, TrendingUp, Download, Share2, Printer, DollarSign,
  Copy, CheckCircle2, AlertCircle, ShieldAlert, CalendarDays, ClipboardList,
  ChevronLeft, MoreVertical
} from 'lucide-react';
import { User, StockItem } from '../types';
import { MOCK_STOCK } from '../constants';
import { subscribeInventory, saveStockItem, deleteStockItem, seedInventoryIfEmpty } from '../lib/firestoreData';
import { useToast } from '../context/ToastContext';

interface AlertRecipient {
  id: string;
  name: string;
  contact: string;
  type: 'WHATSAPP' | 'EMAIL';
  active: boolean;
}

type ReportPeriod = 'IMMEDIATE' | 'WEEKLY' | 'MONTHLY';

const Inventory: React.FC<{ user: User }> = ({ user }) => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [activeTab, setActiveTab] = useState<'STOCK' | 'SHOPPING_LIST' | 'SETTINGS'>('STOCK');
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('IMMEDIATE');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    seedInventoryIfEmpty(MOCK_STOCK).catch(() => {});
    const unsubscribe = subscribeInventory(setItems);
    return unsubscribe;
  }, []);

  const [recipients, setRecipients] = useState<AlertRecipient[]>(() => {
    const saved = localStorage.getItem('araguaia_inventory_recipients');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Gerência Operacional', contact: '5562999991111', type: 'WHATSAPP', active: true },
      { id: '2', name: 'Departamento de Compras', contact: 'compras@palacioaraguaia.com', type: 'EMAIL', active: true }
    ];
  });

  const saveRecipients = (newRecipients: AlertRecipient[]) => {
    setRecipients(newRecipients);
    localStorage.setItem('araguaia_inventory_recipients', JSON.stringify(newRecipients));
  };

  // Cálculo de projeção de necessidade inspirado em uma agenda de compras
  const itemsInReport = useMemo(() => {
    return items.filter(item => {
      // Imediato: Itens abaixo do mínimo
      if (reportPeriod === 'IMMEDIATE') return item.quantity <= item.minQuantity;
      // Semanal: Abaixo do mínimo + 30% (Risco de falta na semana)
      if (reportPeriod === 'WEEKLY') return item.quantity <= item.minQuantity * 1.3;
      // Mensal: Abaixo do mínimo + 70% (Projeção para o mês)
      return item.quantity <= item.minQuantity * 1.7;
    }).map(item => {
      const riskLevel = item.quantity <= item.minQuantity ? 'CRITICAL' : 
                        item.quantity <= item.minQuantity * 1.3 ? 'WARNING' : 'PLANNING';
      
      let multiplier = 2.5;
      if (reportPeriod === 'WEEKLY') multiplier = 4.0;
      if (reportPeriod === 'MONTHLY') multiplier = 6.0;
      
      const suggestedQty = Math.ceil((item.minQuantity * multiplier) - item.quantity);
      const finalSuggestion = Math.max(suggestedQty, item.minQuantity);
      
      return {
        ...item,
        riskLevel,
        suggestedOrder: finalSuggestion,
        estimatedCost: finalSuggestion * (item.unitPrice || 0)
      };
    }).sort((a, b) => {
      const riskOrder = { CRITICAL: 0, WARNING: 1, PLANNING: 2 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    });
  }, [items, reportPeriod]);

  const totalEstimatedCost = useMemo(() => {
    return itemsInReport.reduce((acc, item) => acc + item.estimatedCost, 0);
  }, [itemsInReport]);

  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData: StockItem = {
      id: editingItem?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      category: formData.get('category') as any,
      quantity: Number(formData.get('quantity')),
      minQuantity: Number(formData.get('minQuantity')),
      unitPrice: Number(formData.get('unitPrice')),
      unit: formData.get('unit') as string,
      location: formData.get('location') as string,
      photo: (formData.get('photo') as string) || `https://picsum.photos/seed/${formData.get('name')}/200`,
    };
    await saveStockItem(itemData);
    setShowItemModal(false);
    setEditingItem(null);
    addToast(editingItem ? "Item atualizado com sucesso." : "Novo item cadastrado no inventário.", 'SUCCESS');
  };

  const generateReportMessage = (isWhatsApp = true) => {
    const date = new Date().toLocaleDateString('pt-BR');
    const b = isWhatsApp ? '*' : '';
    const periodLabel = reportPeriod === 'IMMEDIATE' ? 'URGENTE: FALTA EM ESTOQUE' : 
                       reportPeriod === 'WEEKLY' ? 'PEDIDO SEMANAL (PROJEÇÃO)' : 'PLANEJAMENTO MENSAL';
    
    let message = `${b}📋 AGENDA DE SUPRIMENTOS - PALÁCIO ARAGUAIA${b}\n`;
    message += `📅 Emissão: ${date}\n`;
    message += `📊 Tipo: ${periodLabel}\n`;
    message += `--------------------------------\n\n`;
    
    if (itemsInReport.length === 0) {
      message += "✅ Estoque em conformidade operacional.";
    } else {
      itemsInReport.forEach(item => {
        const riskEmoji = item.riskLevel === 'CRITICAL' ? '🔴' : item.riskLevel === 'WARNING' ? '🟡' : '🔵';
        message += `${riskEmoji} ${b}${item.name}${b}\n`;
        message += `   • Estoque: ${item.quantity} ${item.unit} (Mín: ${item.minQuantity})\n`;
        message += `   • Reposição: ${b}+${item.suggestedOrder} ${item.unit}${b}\n`;
        message += `   • Valor Est.: R$ ${item.estimatedCost.toFixed(2)}\n\n`;
      });
      message += `--------------------------------\n`;
      message += `${b}TOTAL ESTIMADO: R$ ${totalEstimatedCost.toFixed(2)}${b}\n`;
      message += `Solicitante: ${user.name}`;
    }
    
    return message;
  };

  const handleCopy = () => {
    const message = generateReportMessage(false);
    navigator.clipboard.writeText(message);
    setCopySuccess(true);
    addToast("Relatório copiado para a área de transferência.", 'SUCCESS');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSendReport = (type: 'WHATSAPP' | 'EMAIL') => {
    const activeRecipients = recipients.filter(r => r.active && r.type === type);
    if (activeRecipients.length === 0) {
      addToast(`Cadastre um destinatário de ${type} nas configurações para enviar.`, 'WARNING');
      return;
    }

    setIsSending(true);
    const message = generateReportMessage(type === 'WHATSAPP');
    
    setTimeout(() => {
      activeRecipients.forEach(r => {
        if (type === 'WHATSAPP') {
          const cleanPhone = r.contact.replace(/\D/g, '');
          window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
        } else {
          const subject = `Relatório de Compras - ${reportPeriod} - ${new Date().toLocaleDateString()}`;
          window.location.href = `mailto:${r.contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        }
      });
      setIsSending(false);
      addToast(`Relatório enviado para ${activeRecipients.length} destinatários.`, 'SUCCESS');
    }, 600);
  };

  const handleAddRecipient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRecipient: AlertRecipient = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      contact: (formData.get('contact') as string).trim(),
      type: formData.get('type') as 'WHATSAPP' | 'EMAIL',
      active: true
    };
    saveRecipients([...recipients, newRecipient]);
    setShowRecipientModal(false);
    addToast("Novo canal de notificação cadastrado.", 'SUCCESS');
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header Estilizado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none mb-1">Insumos & Inventário</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" /> Inteligência de Suprimentos
          </p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setShowItemModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[1.5rem] text-sm font-black transition-all shadow-xl active:scale-95 flex items-center gap-3 uppercase tracking-widest"
        >
          <Plus size={20} /> Cadastrar Produto
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[750px] print:border-none print:shadow-none">
        
        {/* Modern Tabs Style (Google Agenda Inspired) */}
        <div className="flex border-b dark:border-slate-800 bg-slate-50/50 dark:bg-black/20 p-2 print:hidden overflow-x-auto scrollbar-hide">
          {(['STOCK', 'SHOPPING_LIST', 'SETTINGS'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all relative whitespace-nowrap ${
                activeTab === tab ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-blue-500'
              }`}
            >
              <div className="flex items-center gap-2">
                {tab === 'STOCK' && <Package size={14} />}
                {tab === 'SHOPPING_LIST' && <CalendarDays size={14} />}
                {tab === 'SETTINGS' && <UserIcon size={14} />}
                {tab === 'STOCK' ? 'Painel de Itens' : tab === 'SHOPPING_LIST' ? 'Agenda de Reposição' : 'Canais de Notificação'}
              </div>
              {tab === 'SHOPPING_LIST' && items.some(i => i.quantity <= i.minQuantity) && (
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </button>
          ))}
        </div>

        <div className="p-8 flex-1">
          {activeTab === 'STOCK' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar estoque..." 
                    className="w-full pl-14 pr-6 py-4.5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
                <div className="flex gap-4">
                   <div className="px-6 py-3.5 bg-slate-100 dark:bg-black rounded-2xl border dark:border-slate-800">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total SKUs</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{items.length}</p>
                   </div>
                   <div className="px-6 py-3.5 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                      <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1">Críticos</p>
                      <p className="text-sm font-black text-red-600">{items.filter(i => i.quantity <= i.minQuantity).length}</p>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map(item => {
                  const isLow = item.quantity <= item.minQuantity;
                  return (
                    <div key={item.id} className={`bg-white dark:bg-slate-950 border-2 rounded-[2.5rem] overflow-hidden group transition-all relative ${isLow ? 'border-red-500/20' : 'border-slate-100 dark:border-slate-800'}`}>
                      <div className="h-44 relative overflow-hidden">
                        <img src={item.photo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        {isLow && (
                          <div className="absolute top-4 right-4 bg-red-600 text-white p-3 rounded-2xl shadow-xl animate-bounce">
                            <ShieldAlert size={18} />
                          </div>
                        )}
                        <div className="absolute bottom-4 left-5">
                          <h4 className="font-black text-white text-base leading-tight uppercase tracking-tight mb-1 line-clamp-1">{item.name}</h4>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.location}</span>
                        </div>
                      </div>
                      <div className="p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`p-4 rounded-2xl border-2 transition-colors ${isLow ? 'bg-red-50/50 border-red-100 dark:bg-red-900/5' : 'bg-slate-50 dark:bg-black/30 border-slate-100 dark:border-slate-800'}`}>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo</p>
                            <p className={`text-lg font-black ${isLow ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                              {item.quantity} <span className="text-[9px] text-slate-400 uppercase">{item.unit}</span>
                            </p>
                          </div>
                          <div className="p-4 bg-slate-50 dark:bg-black/30 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">P. Unit.</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white">
                              R$ {item.unitPrice?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => { setEditingItem(item); setShowItemModal(true); }} className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all">Editar</button>
                           <button onClick={() => { if(confirm('Remover item?')) { deleteStockItem(item.id); addToast("Item removido com sucesso.", "INFO"); } }} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-red-100"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ... (Rest of the component remains largely the same, just rendering logic) */}
          {activeTab === 'SHOPPING_LIST' && (
            <div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-500">
              {/* ... (Shopping List content is mostly presentation) */}
              <div className="bg-slate-900 dark:bg-black rounded-[4rem] p-12 text-white relative overflow-hidden shadow-2xl border border-white/5 print:hidden">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                  <div className="space-y-6 flex-1">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-xl">
                          <ShoppingCart size={28} />
                        </div>
                        <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">Agenda de Reposição</h3>
                     </div>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Estimado</p>
                          <p className="text-3xl font-black text-emerald-400">R$ {totalEstimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Necessidades</p>
                          <p className="text-3xl font-black">{itemsInReport.length} SKUs</p>
                        </div>
                        <div className="p-6 bg-blue-500/10 rounded-[2rem] border border-blue-500/20 hidden sm:block">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Visualização</p>
                          <p className="text-3xl font-black uppercase text-blue-400">{reportPeriod === 'IMMEDIATE' ? 'Faltas' : reportPeriod === 'WEEKLY' ? 'Semana' : 'Mês'}</p>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex flex-col gap-6 min-w-[320px]">
                    <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 self-center lg:self-end">
                      {(['IMMEDIATE', 'WEEKLY', 'MONTHLY'] as const).map(p => (
                        <button 
                          key={p}
                          onClick={() => setReportPeriod(p)}
                          className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            reportPeriod === p ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          {p === 'IMMEDIATE' ? 'Imediato' : p === 'WEEKLY' ? 'Semanal' : 'Mensal'}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap justify-center lg:justify-end gap-3">
                      <button 
                        onClick={() => handleSendReport('WHATSAPP')}
                        disabled={isSending || itemsInReport.length === 0}
                        className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
                      >
                        <MessageCircle size={20} /> WhatsApp
                      </button>
                      <button 
                        onClick={() => handleSendReport('EMAIL')}
                        disabled={isSending || itemsInReport.length === 0}
                        className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Mail size={20} /> E-mail
                      </button>
                    </div>
                    <div className="flex justify-center lg:justify-end gap-3">
                      <button onClick={handleCopy} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                        {copySuccess ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />} 
                        {copySuccess ? 'Copiado' : 'Copiar Texto'}
                      </button>
                      <button onClick={() => window.print()} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                        <Printer size={16} /> Imprimir
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
                <div className="absolute -left-20 -top-20 w-80 h-80 bg-emerald-600/5 rounded-full blur-[120px]" />
              </div>

              {/* Items List - Table Mode */}
              <div className="bg-white dark:bg-slate-950 rounded-[4rem] border dark:border-slate-800 shadow-sm overflow-hidden print:shadow-none print:border-none">
                 <div className="p-10 border-b dark:border-slate-800 flex items-center justify-between">
                    <div>
                       <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Detalhamento por Item</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baseado no Saldo e Consumo Médio Estimado</p>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 print:hidden">
                       <Clock size={16} className="text-blue-500" /> Atualizado em: {new Date().toLocaleTimeString()}
                    </div>
                 </div>

                 {itemsInReport.length > 0 ? (
                   <div className="overflow-x-auto">
                     <table className="w-full text-left">
                       <thead>
                         <tr className="bg-slate-50/50 dark:bg-black/40 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b dark:border-slate-800">
                           <th className="px-12 py-8">Produto / Local</th>
                           <th className="px-12 py-8">Status</th>
                           <th className="px-12 py-8 text-center">Reposição Sugerida</th>
                           <th className="px-12 py-8 text-right">Subtotal (Est.)</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                         {itemsInReport.map(item => (
                           <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-black/10 transition-all">
                             <td className="px-12 py-8">
                               <div className="flex items-center gap-6">
                                 <img src={item.photo} className="w-14 h-14 rounded-2xl object-cover shadow-md print:hidden" />
                                 <div>
                                   <span className="text-base font-black text-slate-900 dark:text-white block uppercase tracking-tight">{item.name}</span>
                                   <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{item.location} • {item.category}</span>
                                 </div>
                               </div>
                             </td>
                             <td className="px-12 py-8">
                               <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${
                                    item.riskLevel === 'CRITICAL' ? 'bg-red-500 animate-pulse' : 
                                    item.riskLevel === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                                  }`} />
                                  <span className={`text-[11px] font-black uppercase ${
                                    item.riskLevel === 'CRITICAL' ? 'text-red-500' : 
                                    item.riskLevel === 'WARNING' ? 'text-amber-500' : 'text-blue-500'
                                  }`}>
                                    {item.quantity} {item.unit} / {item.minQuantity} Mín
                                  </span>
                               </div>
                             </td>
                             <td className="px-12 py-8 text-center">
                               <span className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-lg">
                                 + {item.suggestedOrder} {item.unit}
                               </span>
                             </td>
                             <td className="px-12 py-8 text-right">
                               <span className="text-base font-black text-slate-900 dark:text-white">R$ {item.estimatedCost.toFixed(2)}</span>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">P. Unit: R$ {item.unitPrice.toFixed(2)}</p>
                             </td>
                           </tr>
                         ))}
                         <tr className="bg-slate-50/50 dark:bg-black/60">
                            <td colSpan={3} className="px-12 py-12 text-right">
                               <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Geral de Investimento:</span>
                            </td>
                            <td className="px-12 py-12 text-right">
                               <div className="inline-flex flex-col items-end">
                                 <span className="text-3xl font-black text-emerald-600">R$ {totalEstimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Aprovação Necessária</span>
                               </div>
                            </td>
                         </tr>
                       </tbody>
                     </table>
                   </div>
                 ) : (
                   <div className="py-40 text-center space-y-6">
                      <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl transform rotate-6">
                         <CheckCircle size={48} strokeWidth={3} />
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Insumos em conformidade para o período selecionado</p>
                   </div>
                 )}
              </div>
            </div>
          )}

          {activeTab === 'SETTINGS' && (
            <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none mb-2">Canais de Notificação</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Configure os gestores que aprovam as compras.</p>
                </div>
                <button 
                  onClick={() => setShowRecipientModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-3"
                >
                  <Plus size={20} /> Vincular Canal
                </button>
              </div>

              <div className="grid gap-6">
                {recipients.map(r => (
                  <div key={r.id} className={`bg-white dark:bg-slate-950 p-8 rounded-[3rem] border-2 flex items-center justify-between hover:shadow-xl transition-all group ${r.active ? 'border-slate-50 dark:border-slate-800' : 'border-dashed border-slate-200 dark:border-slate-900 opacity-60'}`}>
                    <div className="flex items-center gap-8">
                       <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center shadow-lg transform transition-transform group-hover:-rotate-6 ${
                         r.type === 'WHATSAPP' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                       }`}>
                          {r.type === 'WHATSAPP' ? <MessageCircle size={32} /> : <Mail size={32} />}
                       </div>
                       <div>
                          <p className="text-xl font-black text-slate-900 dark:text-white leading-none mb-3 uppercase tracking-tight">{r.name}</p>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{r.contact}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-8">
                       <button 
                        onClick={() => saveRecipients(recipients.map(item => item.id === r.id ? {...item, active: !item.active} : item))}
                        className={`w-16 h-8 rounded-full relative transition-all shadow-inner ${r.active ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                       >
                         <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${r.active ? 'right-1' : 'left-1'}`} />
                       </button>
                       <button onClick={() => saveRecipients(recipients.filter(item => item.id !== r.id))} className="text-red-400 hover:text-red-600 p-4 transition-all opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950 rounded-[1.5rem]">
                         <Trash2 size={24} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-slate-50 dark:bg-black/30 p-10 rounded-[3.5rem] border-2 border-dashed dark:border-slate-800 flex items-center gap-10">
                 <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center text-blue-600">
                   <Info size={32} />
                 </div>
                 <div className="flex-1">
                   <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Segurança de Notificação</p>
                   <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-widest">
                     Os canais ativos serão acionados em lote durante o envio do relatório de reposição. Certifique-se de que os números possuem DDI e DDD (ex: 5562).
                   </p>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Modal and Recipient Modal (Same as before but with form actions managed by addToast logic if needed) */}
      {/* ... (Previous modal code structure remains, alert logic is replaced in handlers) ... */}
      
      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[4rem] w-full max-w-3xl overflow-hidden shadow-2xl border dark:border-slate-800">
            <div className="p-12 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {editingItem ? 'Configurar SKU' : 'Novo Produto em Estoque'}
              </h2>
              <button onClick={() => setShowItemModal(false)} className="p-5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[1.5rem] transition-all text-slate-400">
                <X size={32} />
              </button>
            </div>
            <form onSubmit={handleSaveItem} className="p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Descrição</label>
                    <input name="name" defaultValue={editingItem?.name} required className="w-full px-6 py-5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: Detergente Clorado 5L" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Custo de Aquisição (Un.)</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">R$</div>
                      <input name="unitPrice" type="number" step="0.01" defaultValue={editingItem?.unitPrice} required className="w-full px-6 py-5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm pl-14" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Centro de Custo</label>
                    <select name="category" defaultValue={editingItem?.category} className="w-full px-6 py-5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm appearance-none">
                      <option value="AMENITIES">Amenities / Enxoval</option>
                      <option value="CLEANING">Limpeza / Higienização</option>
                      <option value="MAINTENANCE">Manutenção Técnica</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Qtd Atual</label>
                      <input name="quantity" type="number" defaultValue={editingItem?.quantity} required className="w-full px-6 py-5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Qtd Mínima</label>
                      <input name="minQuantity" type="number" defaultValue={editingItem?.minQuantity} required className="w-full px-6 py-5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Unidade</label>
                    <input name="unit" defaultValue={editingItem?.unit} placeholder="Ex: CX, PAR, UN" required className="w-full px-6 py-5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Alocação (Endereço)</label>
                    <input name="location" defaultValue={editingItem?.location} placeholder="Ex: Prateleira B4 - Setor A" required className="w-full px-6 py-5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                </div>
              </div>
              <div className="pt-8 flex gap-6">
                <button type="button" onClick={() => setShowItemModal(false)} className="flex-1 px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all">Descartar</button>
                <button type="submit" className="flex-[2] px-10 py-5 bg-blue-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-500/40 active:scale-95 transition-all">Salvar no Inventário</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recipient Modal */}
      {showRecipientModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[4rem] w-full max-w-md overflow-hidden shadow-2xl border dark:border-slate-800">
            <div className="p-10 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-black/20 text-center">
              <div className="mx-auto">
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">Configurar Alerta</h2>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Responsável pela Aprovação</p>
              </div>
            </div>
            <form onSubmit={handleAddRecipient} className="p-10 space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Nome do Gestor</label>
                <input name="name" required className="w-full px-6 py-5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: Gerente Geral" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Tipo de Canal</label>
                <select name="type" className="w-full px-6 py-5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm appearance-none">
                  <option value="WHATSAPP">WhatsApp Business</option>
                  <option value="EMAIL">E-mail Corporativo</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Contato (Tel ou Email)</label>
                <input name="contact" required className="w-full px-6 py-5 bg-slate-50 dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: 5562998887766" />
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setShowRecipientModal(false)} className="flex-1 px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-3xl text-[10px] font-black uppercase tracking-widest">Sair</button>
                <button type="submit" className="flex-[2] px-8 py-5 bg-emerald-500 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all">Ativar Notificação</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
