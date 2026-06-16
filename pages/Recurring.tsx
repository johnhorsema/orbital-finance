
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Repeat, 
  CalendarClock, 
  Power, 
  Trash2, 
  X, 
  Wallet, 
  Tag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CurrencyCode, RecurrenceFrequency, SUPPORTED_CURRENCIES } from '../types';

const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly'
};

const FREQUENCY_ICONS: Record<RecurrenceFrequency, React.ReactNode> = {
  DAILY: <Clock size={14} />,
  WEEKLY: <CalendarClock size={14} />,
  MONTHLY: <CalendarClock size={14} />,
  YEARLY: <CalendarClock size={14} />
};

export const Recurring: React.FC = () => {
  const { state, addRecurringTransaction, deleteRecurringTransaction, toggleRecurringTransaction } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [category, setCategory] = useState(state.categories[0] || 'Subscription');
  const [description, setDescription] = useState('');
  const [walletId, setWalletId] = useState(state.wallets[0]?.id || '');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('MONTHLY');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !walletId || !description) return;

    addRecurringTransaction({
        amount: parseFloat(amount),
        currency,
        category,
        description,
        walletId,
        type,
        frequency,
        startDate,
        nextDueDate: startDate,
    });

    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
      setAmount('');
      setDescription('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setFrequency('MONTHLY');
      setType('EXPENSE');
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      deleteRecurringTransaction(id);
      setDeletingId(null);
    }, 300);
  };

  const getDaysUntil = (dateStr: string) => {
      const target = new Date(dateStr);
      const now = new Date();
      now.setHours(0,0,0,0);
      target.setHours(0,0,0,0);
      const diffTime = target.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { text: 'Overdue', status: 'danger' as const };
      if (diffDays === 0) return { text: 'Due Today', status: 'warning' as const };
      if (diffDays === 1) return { text: 'Tomorrow', status: 'info' as const };
      if (diffDays <= 7) return { text: `In ${diffDays} days`, status: 'info' as const };
      return { text: `In ${diffDays} days`, status: 'default' as const };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const activeCount = state.recurring.filter(r => r.active).length;
  const totalMonthly = state.recurring
    .filter(r => r.active)
    .reduce((sum, r) => {
      const multiplier = r.frequency === 'DAILY' ? 30 : r.frequency === 'WEEKLY' ? 4 : r.frequency === 'MONTHLY' ? 1 : 1/12;
      return sum + (r.amount * multiplier);
    }, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-sans font-medium tracking-tight text-text-primary">
            Recurring
          </h1>
          <p className="text-text-secondary mt-2 font-mono text-sm">Manage automated subscriptions and income streams</p>
        </div>
        
        {/* Stats Cards */}
        {state.recurring.length > 0 && (
          <div className="flex gap-4">
            <div className="bg-bg-surface border border-border px-6 py-4">
              <div className="text-xs font-mono text-text-secondary uppercase mb-1">Active</div>
              <div className="text-2xl font-mono font-semibold text-text-primary">{activeCount}</div>
            </div>
            <div className="bg-bg-surface border border-border px-6 py-4">
              <div className="text-xs font-mono text-text-secondary uppercase mb-1">Monthly</div>
              <div className="text-2xl font-mono font-semibold text-text-primary">
                {totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        )}
        
        <Button 
          variant="primary" 
          icon={<Plus size={16} />} 
          onClick={() => setIsAdding(true)}
          className="lg:self-start"
        >
          New Automation
        </Button>
      </div>

      {/* Recurring Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {state.recurring.map((rule, idx) => {
                const wallet = state.wallets.find(w => w.id === rule.walletId);
                const daysInfo = getDaysUntil(rule.nextDueDate);
                
                return (
                    <motion.div
                      key={rule.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -20 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className={`
                        relative bg-bg-surface border transition-all duration-200 group
                        ${rule.active 
                          ? 'border-border hover:border-border-strong hover:shadow-sm' 
                          : 'border-border opacity-60'
                        }
                        ${deletingId === rule.id ? 'scale-95 opacity-0' : ''}
                      `}
                    >
                        {/* Card Header */}
                        <div className="p-6 pb-4">
                          <div className="flex justify-between items-start mb-4">
                            <div className={`
                              p-3 border
                              ${rule.type === 'INCOME' 
                                ? 'bg-positive/10 border-positive/20 text-positive' 
                                : 'bg-negative/10 border-negative/20 text-negative'
                              }
                            `}>
                                <Repeat size={20} />
                            </div>
                            
                            <div className="flex gap-1">
                                <button 
                                  onClick={() => toggleRecurringTransaction(rule.id)}
                                  className={`
                                    p-2 transition-colors
                                    ${rule.active 
                                      ? 'text-positive hover:bg-positive/10' 
                                      : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-surface-highlight'
                                    }
                                  `}
                                  title={rule.active ? 'Disable' : 'Enable'}
                                >
                                    <Power size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(rule.id)}
                                  className="p-2 text-text-tertiary hover:text-negative hover:bg-negative/10 transition-colors"
                                  title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                          </div>

                          {/* Rule Details */}
                          <div className="mb-4">
                              <h3 className="text-lg font-sans font-medium text-text-primary truncate mb-1">
                                {rule.description || 'Untitled Rule'}
                              </h3>
                              <div className="font-mono text-2xl font-semibold text-text-primary tracking-tight">
                                  {rule.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  <span className="text-sm text-text-secondary ml-1">{rule.currency}</span>
                              </div>
                          </div>

                          {/* Meta Info */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-bg-surface-highlight border border-border text-xs font-mono text-text-secondary">
                              {FREQUENCY_ICONS[rule.frequency]}
                              {FREQUENCY_LABELS[rule.frequency]}
                            </span>
                            {wallet && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-bg-surface-highlight border border-border text-xs font-mono text-text-secondary">
                                <Wallet size={12} />
                                {wallet.name}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-bg-surface-highlight border border-border text-xs font-mono text-text-secondary">
                              <Tag size={12} />
                              {rule.category}
                            </span>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-bg-subtle">
                            <div className="flex items-center gap-2 text-text-secondary">
                                <CalendarClock size={14} />
                                <span className="text-xs font-mono">{formatDate(rule.nextDueDate)}</span>
                            </div>
                            <span className={`
                              inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1
                              ${daysInfo.status === 'danger' ? 'text-negative bg-negative/10' : ''}
                              ${daysInfo.status === 'warning' ? 'text-warning bg-warning/10' : ''}
                              ${daysInfo.status === 'info' ? 'text-text-primary bg-bg-surface-highlight' : ''}
                              ${daysInfo.status === 'default' ? 'text-text-secondary' : ''}
                              ${!rule.active ? 'text-text-tertiary' : ''}
                            `}>
                              {!rule.active ? (
                                <>
                                  <AlertCircle size={12} />
                                  Paused
                                </>
                              ) : (
                                <>
                                  {daysInfo.status === 'danger' && <AlertCircle size={12} />}
                                  {daysInfo.status === 'warning' && <Clock size={12} />}
                                  {daysInfo.text}
                                </>
                              )}
                            </span>
                        </div>
                    </motion.div>
                );
            })}
          </AnimatePresence>
          
          {/* Empty State */}
          {state.recurring.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full"
              >
                <div className="border-2 border-dashed border-border bg-bg-surface/50 p-16 flex flex-col items-center">
                    <div className="p-4 bg-bg-surface-highlight border border-border mb-4">
                      <Repeat className="text-text-tertiary" size={32} />
                    </div>
                    <div className="text-center max-w-md">
                      <h3 className="text-xl font-sans font-medium text-text-primary mb-2">No automations yet</h3>
                      <p className="text-text-secondary font-mono text-sm mb-6 mx-center">
                        Create your first recurring rule to track subscriptions, automate income, or manage regular payments.
                      </p>
                    </div>
                    <Button 
                      variant="primary" 
                      icon={<Plus size={16} />} 
                      onClick={() => setIsAdding(true)}
                    >
                      New Automation
                    </Button>
                </div>
              </motion.div>
          )}
      </div>

      {/* ADD RECURRING MODAL */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
              onClick={() => setIsAdding(false)}
            />
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="bg-bg-surface border border-border w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto"
            >
               {/* Modal Header */}
               <div className="sticky top-0 bg-bg-surface border-b border-border p-6 flex justify-between items-center z-10">
                 <div>
                   <h2 className="text-2xl font-sans font-medium text-text-primary">New Automation</h2>
                   <p className="text-text-secondary font-mono text-sm mt-1">Configure recurring transaction rule</p>
                 </div>
                 <button 
                   onClick={() => setIsAdding(false)} 
                   className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-surface-highlight transition-colors"
                 >
                   <X size={20} />
                 </button>
               </div>
               
               {/* Modal Body */}
               <form onSubmit={handleSubmit} className="p-6 space-y-6">
                 
                 {/* Type Toggle */}
                 <div>
                   <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">Transaction Type</label>
                   <div className="grid grid-cols-2 gap-0 border border-border">
                      <button 
                        type="button" 
                        onClick={() => setType('EXPENSE')} 
                        className={`
                          p-3 font-mono text-sm transition-colors border-r border-border
                          ${type === 'EXPENSE' 
                            ? 'bg-negative text-bg-primary font-semibold' 
                            : 'text-text-secondary hover:bg-bg-surface-highlight'
                          }
                        `}
                      >
                        Expense
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setType('INCOME')} 
                        className={`
                          p-3 font-mono text-sm transition-colors
                          ${type === 'INCOME' 
                            ? 'bg-positive text-bg-primary font-semibold' 
                            : 'text-text-secondary hover:bg-bg-surface-highlight'
                          }
                        `}
                      >
                        Income
                      </button>
                   </div>
                 </div>

                 {/* Amount & Currency */}
                 <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">Amount</label>
                        <input 
                          type="number" 
                          step="any" 
                          value={amount} 
                          onChange={(e) => setAmount(e.target.value)} 
                          className="w-full bg-bg-surface-highlight border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors" 
                          placeholder="0.00"
                          required 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">Currency</label>
                        <select 
                          value={currency} 
                          onChange={(e) => setCurrency(e.target.value as CurrencyCode)} 
                          className="w-full bg-bg-surface-highlight border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
                        >
                            {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                 </div>

                 {/* Description */}
                 <div>
                    <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">Description</label>
                    <input 
                      type="text" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      className="w-full bg-bg-surface-highlight border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors" 
                      placeholder="e.g. Netflix Subscription"
                      required 
                    />
                 </div>

                 {/* Frequency & Start Date */}
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">Frequency</label>
                        <select 
                          value={frequency} 
                          onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)} 
                          className="w-full bg-bg-surface-highlight border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
                        >
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">Start Date</label>
                        <input 
                          type="date" 
                          value={startDate} 
                          onChange={(e) => setStartDate(e.target.value)} 
                          className="w-full bg-bg-surface-highlight border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors" 
                        />
                    </div>
                 </div>

                 {/* Wallet & Category */}
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">Wallet</label>
                        <select 
                          value={walletId} 
                          onChange={(e) => setWalletId(e.target.value)} 
                          className="w-full bg-bg-surface-highlight border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
                        >
                            {state.wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">Category</label>
                        <select 
                          value={category} 
                          onChange={(e) => setCategory(e.target.value)} 
                          className="w-full bg-bg-surface-highlight border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
                        >
                            {state.categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                 </div>

                 {/* Submit Button */}
                 <div className="pt-4 border-t border-border">
                   <Button 
                     type="submit" 
                     variant="primary" 
                     className="w-full h-12"
                     icon={<CheckCircle2 size={18} />}
                   >
                     Activate Rule
                   </Button>
                 </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
