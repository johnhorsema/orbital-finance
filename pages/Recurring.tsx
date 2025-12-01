
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Repeat, CalendarClock, Power, Trash2, X, Wallet, Tag } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CurrencyCode, RecurrenceFrequency, SUPPORTED_CURRENCIES } from '../types';

export const Recurring: React.FC = () => {
  const { state, addRecurringTransaction, deleteRecurringTransaction, toggleRecurringTransaction } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  
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
    if (!amount || !walletId) return;

    addRecurringTransaction({
        amount: parseFloat(amount),
        currency,
        category,
        description,
        walletId,
        type,
        frequency,
        startDate,
        nextDueDate: startDate, // First run is start date
    });

    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
      setAmount('');
      setDescription('');
      setStartDate(new Date().toISOString().split('T')[0]);
  };

  const getDaysUntil = (dateStr: string) => {
      const target = new Date(dateStr);
      const now = new Date();
      now.setHours(0,0,0,0);
      target.setHours(0,0,0,0);
      const diffTime = target.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'Overdue';
      if (diffDays === 0) return 'Due Today';
      if (diffDays === 1) return 'Tomorrow';
      return `In ${diffDays} days`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-sans font-light text-content tracking-tighter">
            AUTO <span className="text-neon-cyan font-bold">PILOT</span>
          </h1>
          <p className="text-muted mt-2 font-mono">Manage automated subscriptions and income streams.</p>
        </div>
        <Button variant="neon" icon={<Plus size={18} />} onClick={() => setIsAdding(true)}>
          New Automation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.recurring.map((rule, idx) => {
              const wallet = state.wallets.find(w => w.id === rule.walletId);
              return (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`relative bg-surface border ${rule.active ? 'border-content/10 hover:border-neon-cyan/50' : 'border-red-900/20 opacity-60'} p-6 group transition-all`}
                  >
                      <div className="flex justify-between items-start mb-4">
                          <div className={`p-2 rounded-sm ${rule.type === 'INCOME' ? 'bg-neon-green/10 text-neon-green' : 'bg-neon-pink/10 text-neon-pink'}`}>
                              <Repeat size={20} />
                          </div>
                          <div className="flex gap-2">
                              <button 
                                onClick={() => toggleRecurringTransaction(rule.id)}
                                className={`p-2 rounded-full transition-colors ${rule.active ? 'text-neon-green hover:bg-neon-green/10' : 'text-muted hover:text-content'}`}
                                title={rule.active ? 'Disable' : 'Enable'}
                              >
                                  <Power size={18} />
                              </button>
                              <button 
                                onClick={() => deleteRecurringTransaction(rule.id)}
                                className="p-2 text-muted hover:text-red-500 transition-colors"
                              >
                                  <Trash2 size={18} />
                              </button>
                          </div>
                      </div>

                      <div className="mb-6">
                          <h3 className="text-xl font-sans text-content truncate">{rule.description}</h3>
                          <div className="font-mono text-2xl font-bold mt-1 text-content">
                              {rule.amount} <span className="text-sm text-muted">{rule.currency}</span>
                          </div>
                          <div className="text-xs font-mono text-muted mt-2 flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-content/5 rounded uppercase">{rule.frequency}</span>
                              <span>•</span>
                              <span>{wallet?.name}</span>
                          </div>
                      </div>

                      <div className="pt-4 border-t border-content/5 flex justify-between items-center">
                          <div className="flex items-center gap-2 text-muted">
                              <CalendarClock size={16} />
                              <span className="text-xs font-mono">Next: {rule.nextDueDate}</span>
                          </div>
                          <span className={`text-xs font-mono font-bold ${rule.active ? 'text-neon-cyan' : 'text-muted'}`}>
                              {rule.active ? getDaysUntil(rule.nextDueDate) : 'Paused'}
                          </span>
                      </div>
                  </motion.div>
              );
          })}
          
          {state.recurring.length === 0 && (
              <div className="col-span-full py-20 text-center border border-dashed border-content/10 rounded">
                  <Repeat className="mx-auto text-muted mb-4" size={48} />
                  <p className="text-muted font-mono">No active automations. Create one to track subscriptions.</p>
              </div>
          )}
      </div>

      {/* ADD RECURRING MODAL */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsAdding(false)}
            />
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-surface border border-content/10 p-8 w-full max-w-lg relative z-10 shadow-2xl shadow-neon-cyan/10"
            >
               <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-muted hover:text-content">
                 <X size={24} />
               </button>
               
               <h2 className="text-2xl font-sans text-content mb-6">Config Automation</h2>
               
               <form onSubmit={handleSubmit} className="space-y-6">
                 
                 <div className="grid grid-cols-2 gap-0 border border-content/10 rounded-sm overflow-hidden">
                    <button type="button" onClick={() => setType('EXPENSE')} className={`p-3 font-mono text-sm ${type === 'EXPENSE' ? 'bg-neon-pink text-black font-bold' : 'text-muted'}`}>EXPENSE</button>
                    <button type="button" onClick={() => setType('INCOME')} className={`p-3 font-mono text-sm ${type === 'INCOME' ? 'bg-neon-green text-black font-bold' : 'text-muted'}`}>INCOME</button>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono text-muted mb-2 uppercase">Frequency</label>
                        <select value={frequency} onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)} className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-cyan focus:outline-none">
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-muted mb-2 uppercase">Start Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-cyan focus:outline-none" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono text-muted mb-2 uppercase">Amount</label>
                        <input type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-cyan focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-muted mb-2 uppercase">Currency</label>
                        <select value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-cyan focus:outline-none">
                            {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-mono text-muted mb-2 uppercase">Description</label>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-cyan focus:outline-none" placeholder="e.g. Netflix Subscription" required />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-mono text-muted mb-2 uppercase">Wallet</label>
                        <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-cyan focus:outline-none">
                            {state.wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-mono text-muted mb-2 uppercase">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-cyan focus:outline-none">
                            {state.categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                 </div>

                 <Button type="submit" variant="neon" className="w-full h-12">Activate Rule</Button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
