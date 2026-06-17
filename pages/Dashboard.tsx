


import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Plus, X, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SUPPORTED_CURRENCIES, CurrencyCode, Transaction } from '../types';
import { TransactionDetailsModal } from '../components/TransactionDetailsModal';
import { Drawer } from 'vaul';
import { useNavigate } from 'react-router-dom';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', 
  CAD: 'C$', HKD: 'HK$', SGD: 'S$', 
  KRW: '₩', THB: '฿', IDR: 'Rp',
  BTC: '₿', ETH: 'Ξ', SOL: '◎'
};

export const Dashboard: React.FC = () => {
  const { state, rates, globalCurrency, refreshRates, addTransaction, deleteTransaction, themeMode } = useFinance();
  const navigate = useNavigate();
  const [isAddingTx, setIsAddingTx] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Form State
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [category, setCategory] = useState('');
  const [walletId, setWalletId] = useState(state.wallets[0]?.id || '');
  const [description, setDescription] = useState('');

  // Set default category when loading if not set
  React.useEffect(() => {
    if (!category && state.categories.length > 0) {
      setCategory(state.categories[0]);
    }
  }, [state.categories, category]);

  // Helper to convert amounts to global currency
  const getGlobalValue = (val: number, curr: CurrencyCode) => {
    if (curr === globalCurrency) return val;
    const rate = rates[curr.toLowerCase()];
    // If rate is how many Quote per 1 Base (e.g. 1 USD = 0.9 EUR), 
    // and we want to convert EUR back to USD, we divide by rate.
    return rate ? val / rate : 0;
  };

  // Calculate Net Worth in Global Currency
  const totalBalance = useMemo(() => {
    let total = 0;
    state.wallets.forEach(wallet => {
      total += getGlobalValue(wallet.balance, wallet.baseCurrency);
    });
    return total;
  }, [state.wallets, rates, globalCurrency]);

  // Calculate Monthly Stats
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let income = 0;
    let expense = 0;

    state.transactions.forEach(tx => {
        const d = new Date(tx.date);
        // Basic check for current month (ignoring timezone edge cases for simplicity)
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            const val = getGlobalValue(tx.amount, tx.currency);
            if (tx.type === 'INCOME') income += val;
            else expense += val;
        }
    });
    return { income, expense };
  }, [state.transactions, rates, globalCurrency]);

  // Calculate "24h" Change (Today's Net Flow)
  const netWorthChange = useMemo(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      let change = 0;
      
      state.transactions.forEach(tx => {
          if (tx.date === todayStr) {
              const val = getGlobalValue(tx.amount, tx.currency);
              if (tx.type === 'INCOME') change += val;
              else change -= val;
          }
      });
      
      // Previous Balance (start of day) = Current Total - Change
      const previousBalance = totalBalance - change;
      const percent = previousBalance !== 0 ? (change / previousBalance) * 100 : 0;
      
      return { value: change, percent };
  }, [state.transactions, totalBalance, rates, globalCurrency]);

  // Generate Chart Data from Transaction History
  const chartData = useMemo(() => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    // Calculate cumulative balance for each day
    const dataPoints = last7Days.map(date => {
      let runningBalance = 0;
      state.transactions.forEach(tx => {
        if (tx.date <= date) {
          const val = getGlobalValue(tx.amount, tx.currency);
          if (tx.type === 'INCOME') runningBalance += val;
          else runningBalance -= val;
        }
      });
      return {
        name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        value: runningBalance
      };
    });

    return dataPoints;
  }, [state.transactions, rates, globalCurrency]);

  const recentTransactions = [...state.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshRates();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !walletId) return;

    await addTransaction({
      walletId,
      date: new Date().toISOString().split('T')[0],
      amount: parseFloat(amount),
      currency,
      type: txType,
      category,
      description: description || category
    });

    setIsAddingTx(false);
    setAmount('');
    setDescription('');
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "circOut" } }
  };

  const AddTransactionForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-0 border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setTxType('EXPENSE')}
          className={`p-3 font-mono text-sm transition-colors ${txType === 'EXPENSE' ? 'bg-negative text-text-primary font-semibold' : 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-surface-highlight'}`}
        >
          EXPENSE
        </button>
        <button
          type="button"
          onClick={() => setTxType('INCOME')}
          className={`p-3 font-mono text-sm transition-colors ${txType === 'INCOME' ? 'bg-positive text-text-primary font-semibold' : 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-surface-highlight'}`}
        >
          INCOME
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1">
          <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">Amount</label>
          <input 
            type="number"
            step="any"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-bg-primary border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
            placeholder="0.00"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">Currency</label>
          <select 
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="w-full bg-bg-primary border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
          >
            {SUPPORTED_CURRENCIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">Wallet</label>
          <select 
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            className="w-full bg-bg-primary border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
            required
          >
            <option value="" disabled>Select Wallet</option>
            {state.wallets.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.balance.toFixed(2)} {w.baseCurrency})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">Category</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-bg-primary border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
          >
            {state.categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">Description</label>
        <input 
          type="text" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-bg-primary border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
          placeholder="What was this for?"
        />
      </div>

      <Button type="submit" variant="primary" className="w-full h-12">
        Confirm Transaction
      </Button>
    </form>
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-8 pb-20 space-y-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-sans font-medium tracking-tight text-text-primary">
            Overview
          </h1>
          <p className="text-text-secondary mt-2 font-mono text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
          <Button 
            variant="primary" 
            onClick={() => setIsAddingTx(true)} 
            icon={<Plus size={16} />}
            className="flex-1 md:flex-none"
          >
            Add Transaction
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleRefresh} 
            icon={<RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />}
            className="flex-1 md:flex-none"
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <motion.div 
          variants={itemVariants} 
          className="col-span-1 md:col-span-2 relative overflow-hidden bg-bg-surface border border-border p-8"
        >
          <div className="relative z-10">
            <h3 className="text-text-secondary font-mono text-xs uppercase tracking-wider mb-3">Net Worth</h3>
            <div className="text-4xl md:text-6xl font-sans font-semibold text-text-primary tracking-tight flex items-baseline gap-2">
              <span className="text-2xl text-accent">
                {CURRENCY_SYMBOLS[globalCurrency] || globalCurrency}
              </span>
              {totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className={`flex items-center gap-2 px-2.5 py-1 text-sm font-mono ${netWorthChange.value >= 0 ? 'text-positive bg-positive/10' : 'text-negative bg-negative/10'}`}>
                {netWorthChange.value >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                <span>
                    {netWorthChange.value >= 0 ? '+' : ''}{netWorthChange.percent.toFixed(2)}% (24h)
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions / Mini Stats */}
        <motion.div variants={itemVariants} className="grid grid-rows-2 gap-6">
           <div className="bg-bg-surface border border-border p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                 <div className="p-2 bg-negative/10 text-negative">
                   <ArrowDownLeft size={18} />
                 </div>
                 <span className="font-mono text-xs text-text-secondary">Expenses</span>
              </div>
              <div>
                <div className="text-2xl font-mono text-text-primary">
                    {CURRENCY_SYMBOLS[globalCurrency] || ''}{monthlyStats.expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-text-secondary mt-1">This Month</div>
              </div>
           </div>
           
           <div className="bg-bg-surface border border-border p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                 <div className="p-2 bg-positive/10 text-positive">
                   <ArrowUpRight size={18} />
                 </div>
                 <span className="font-mono text-xs text-text-secondary">Income</span>
              </div>
              <div>
                <div className="text-2xl font-mono text-text-primary">
                    {CURRENCY_SYMBOLS[globalCurrency] || ''}{monthlyStats.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-text-secondary mt-1">This Month</div>
              </div>
           </div>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div variants={itemVariants} className="h-80 w-full bg-bg-surface border border-border p-6">
        <h3 className="font-mono text-xs text-text-secondary mb-6 uppercase tracking-wider">Asset Performance</h3>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
            <YAxis stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" tickFormatter={(val) => `${CURRENCY_SYMBOLS[globalCurrency] || ''}${val}`} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--color-bg-surface-highlight)', 
                borderColor: 'var(--color-border-strong)', 
                borderRadius: '0px',
                color: 'var(--color-text-primary)'
              }}
              itemStyle={{ color: 'var(--color-accent)', fontFamily: 'JetBrains Mono' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="var(--color-accent)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Transactions */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="font-mono text-xs text-text-secondary uppercase tracking-wider">Recent Activity</h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/activity')}>View All</Button>
        </div>
        
        <div className="bg-bg-surface border border-border divide-y divide-border">
          {recentTransactions.map((tx, i) => (
            <motion.div 
              key={tx.id}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedTx(tx)}
              className="flex items-center justify-between p-4 hover:bg-bg-surface-highlight transition-colors cursor-pointer"
            >
               <div className="flex items-center gap-4">
                  <div className={`w-1.5 h-1.5 ${tx.type === 'INCOME' ? 'bg-positive' : 'bg-negative'}`} />
                  <div>
                    <div className="text-text-primary font-sans text-sm">{tx.description}</div>
                    <div className="text-text-secondary text-xs font-mono">{tx.date} · {tx.category}</div>
                  </div>
               </div>
               <div className="text-right">
                  <div className={`font-mono ${tx.type === 'INCOME' ? 'text-positive' : 'text-text-primary'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{tx.amount} {tx.currency}
                  </div>
                  {tx.convertedAmount !== tx.amount && (
                     <div className="text-xs text-text-secondary font-mono">≈ {tx.convertedAmount.toFixed(2)} Base</div>
                  )}
               </div>
            </motion.div>
          ))}
          {recentTransactions.length === 0 && (
            <div className="p-8 text-center text-text-secondary font-mono text-sm">
              No transactions recorded in the system.
            </div>
          )}
        </div>
      </motion.div>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTx && (
            <TransactionDetailsModal 
                transaction={selectedTx} 
                wallet={state.wallets.find(w => w.id === selectedTx.walletId)}
                onClose={() => setSelectedTx(null)}
                onDelete={deleteTransaction}
            />
        )}
      </AnimatePresence>

      {/* Add Transaction Desktop Modal */}
      <AnimatePresence>
        {isAddingTx && (
          <div className="hidden md:flex fixed inset-0 z-[100] items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute inset-0 bg-bg-primary/90 backdrop-blur-md"
              onClick={() => setIsAddingTx(false)}
            />
            <motion.div 
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-bg-surface border border-border w-full max-w-lg relative z-[101]"
            >
               <div className="p-8">
                 <button onClick={() => setIsAddingTx(false)} className="absolute top-5 right-5 p-1.5 text-text-tertiary hover:text-text-primary hover:bg-bg-surface-highlight transition-colors" aria-label="Close modal">
                   <X size={20} />
                 </button>
                 <div className="mb-6">
                   <h2 className="text-2xl font-sans font-semibold text-text-primary">Log Transaction</h2>
                   <p className="text-text-secondary font-mono text-sm mt-1">Add a new income or expense entry</p>
                 </div>
                 <AddTransactionForm />
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </motion.div>
  );
};