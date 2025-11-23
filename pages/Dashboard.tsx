
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

export const Dashboard: React.FC = () => {
  const { state, rates, globalCurrency, refreshRates, addTransaction, deleteTransaction } = useFinance();
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

  // Dummy Chart Data - In a real app, generate this from transaction history
  const chartData = useMemo(() => {
    return [
      { name: 'Mon', value: totalBalance * 0.92 },
      { name: 'Tue', value: totalBalance * 0.94 },
      { name: 'Wed', value: totalBalance * 0.91 },
      { name: 'Thu', value: totalBalance * 0.98 },
      { name: 'Fri', value: totalBalance * 1.02 },
      { name: 'Sat', value: totalBalance * 0.99 },
      { name: 'Sun', value: totalBalance },
    ];
  }, [totalBalance]);

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
      <div className="grid grid-cols-2 gap-0 border border-white/10 rounded-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setTxType('EXPENSE')}
          className={`p-3 font-mono text-sm transition-colors ${txType === 'EXPENSE' ? 'bg-neon-pink text-black font-bold' : 'bg-transparent text-gray-400 hover:text-white'}`}
        >
          EXPENSE
        </button>
        <button
          type="button"
          onClick={() => setTxType('INCOME')}
          className={`p-3 font-mono text-sm transition-colors ${txType === 'INCOME' ? 'bg-neon-green text-black font-bold' : 'bg-transparent text-gray-400 hover:text-white'}`}
        >
          INCOME
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1">
          <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Amount</label>
          <input 
            type="number"
            step="any"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-black border border-white/10 p-3 text-white font-mono focus:border-neon-green focus:outline-none transition-colors"
            placeholder="0.00"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Currency</label>
          <select 
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="w-full bg-black border border-white/10 p-3 text-white font-mono focus:border-neon-green focus:outline-none"
          >
            {SUPPORTED_CURRENCIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Wallet</label>
          <select 
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            className="w-full bg-black border border-white/10 p-3 text-white font-mono focus:border-neon-green focus:outline-none"
            required
          >
            <option value="" disabled>Select Wallet</option>
            {state.wallets.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.balance.toFixed(2)} {w.baseCurrency})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Category</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-black border border-white/10 p-3 text-white font-mono focus:border-neon-green focus:outline-none"
          >
            {state.categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Description</label>
        <input 
          type="text" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-black border border-white/10 p-3 text-white font-mono focus:border-neon-green focus:outline-none transition-colors"
          placeholder="What was this for?"
        />
      </div>

      <Button type="submit" variant="neon" className="w-full h-12">
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
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-sans font-light tracking-tighter text-white">
            OVER<span className="text-neon-green font-bold">VIEW</span>
          </h1>
          <p className="text-gray-400 mt-2 font-mono">Financial telemetry // {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
          <Button 
            variant="neon" 
            onClick={() => setIsAddingTx(true)} 
            icon={<Plus size={18} />}
            className="flex-1 md:flex-none shadow-lg shadow-neon-green/20"
          >
            Add Transaction
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleRefresh} 
            icon={<RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />}
            className="flex-1 md:flex-none text-gray-400 hover:text-white"
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
          className="col-span-1 md:col-span-2 relative overflow-hidden bg-surface border border-white/5 p-8 group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className="text-9xl font-bold font-mono text-neon-green">{globalCurrency}</div>
          </div>
          <div className="relative z-10">
            <h3 className="text-gray-400 font-mono text-sm uppercase tracking-widest mb-2">Net Worth</h3>
            <div className="text-5xl md:text-7xl font-sans font-bold text-white tracking-tight flex items-baseline gap-2">
              <span className="text-2xl text-neon-green">
                {globalCurrency === 'USD' ? '$' : globalCurrency === 'EUR' ? '€' : globalCurrency}
              </span>
              {totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className="mt-6 flex gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-sm border ${netWorthChange.value >= 0 ? 'text-neon-green bg-neon-green/10 border-neon-green/20' : 'text-neon-pink bg-neon-pink/10 border-neon-pink/20'}`}>
                {netWorthChange.value >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                <span className="font-mono text-sm">
                    {netWorthChange.value >= 0 ? '+' : ''}{netWorthChange.percent.toFixed(2)}% (24h)
                </span>
              </div>
            </div>
          </div>
          {/* Decorative Grid */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        </motion.div>

        {/* Quick Actions / Mini Stats */}
        <motion.div variants={itemVariants} className="grid grid-rows-2 gap-6">
           <div className="bg-surfaceHighlight border border-white/5 p-6 flex flex-col justify-between hover:border-neon-pink/50 transition-colors group">
              <div className="flex justify-between items-start">
                 <div className="p-2 bg-neon-pink/10 text-neon-pink rounded-sm">
                   <ArrowDownLeft size={20} />
                 </div>
                 <span className="font-mono text-xs text-gray-500 group-hover:text-neon-pink transition-colors">Expenses</span>
              </div>
              <div>
                <div className="text-2xl font-mono text-white">
                    {globalCurrency === 'USD' ? '$' : globalCurrency === 'EUR' ? '€' : ''}{monthlyStats.expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500 mt-1">This Month</div>
              </div>
           </div>
           
           <div className="bg-surfaceHighlight border border-white/5 p-6 flex flex-col justify-between hover:border-neon-cyan/50 transition-colors group">
              <div className="flex justify-between items-start">
                 <div className="p-2 bg-neon-cyan/10 text-neon-cyan rounded-sm">
                   <ArrowUpRight size={20} />
                 </div>
                 <span className="font-mono text-xs text-gray-500 group-hover:text-neon-cyan transition-colors">Income</span>
              </div>
              <div>
                <div className="text-2xl font-mono text-white">
                    {globalCurrency === 'USD' ? '$' : globalCurrency === 'EUR' ? '€' : ''}{monthlyStats.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500 mt-1">This Month</div>
              </div>
           </div>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div variants={itemVariants} className="h-80 w-full bg-surface border border-white/5 p-6 relative">
        <h3 className="font-mono text-sm text-gray-400 mb-6 uppercase tracking-widest">Asset Performance</h3>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#CCFF00" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
            <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" tickFormatter={(val) => `$${val}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#050508', borderColor: '#333', borderRadius: '0px' }}
              itemStyle={{ color: '#CCFF00', fontFamily: 'JetBrains Mono' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#CCFF00" 
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
            <h3 className="font-mono text-sm text-gray-400 uppercase tracking-widest">Recent Activity</h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/activity')}>View All</Button>
        </div>
        
        <div className="grid gap-2">
          {recentTransactions.map((tx, i) => (
            <motion.div 
              key={tx.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedTx(tx)}
              className="flex items-center justify-between p-4 bg-surface/50 border-b border-white/5 hover:bg-surfaceHighlight transition-colors cursor-pointer group"
            >
               <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${tx.type === 'INCOME' ? 'bg-neon-green' : 'bg-neon-pink'}`} />
                  <div>
                    <div className="text-white font-sans text-sm group-hover:text-neon-green transition-colors">{tx.description}</div>
                    <div className="text-gray-500 text-xs font-mono">{tx.date} • {tx.category}</div>
                  </div>
               </div>
               <div className="text-right">
                  <div className={`font-mono ${tx.type === 'INCOME' ? 'text-neon-green' : 'text-white'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{tx.amount} {tx.currency}
                  </div>
                  {tx.convertedAmount !== tx.amount && (
                     <div className="text-xs text-gray-600 font-mono">≈ {tx.convertedAmount.toFixed(2)} Base</div>
                  )}
               </div>
            </motion.div>
          ))}
          {recentTransactions.length === 0 && (
            <div className="p-8 text-center text-gray-500 font-mono text-sm border border-dashed border-gray-800">
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsAddingTx(false)}
            />
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-surface border border-white/10 p-8 w-full max-w-lg relative z-10 shadow-2xl shadow-neon-green/10"
            >
               <button onClick={() => setIsAddingTx(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                 <X size={24} />
               </button>
               <h2 className="text-2xl font-sans text-white mb-6">Log Transaction</h2>
               <AddTransactionForm />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Transaction Mobile Drawer */}
      <div className="md:hidden">
        <Drawer.Root open={isAddingTx} onOpenChange={setIsAddingTx}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
                <Drawer.Content className="bg-surface border-t border-white/10 flex flex-col rounded-t-[10px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-[101] outline-none">
                    <div className="p-4 bg-surface rounded-t-[10px] flex-1 overflow-y-auto">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/10 mb-8" />
                        <h2 className="text-xl font-sans text-white mb-6">Log Transaction</h2>
                        <AddTransactionForm />
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
      </div>
    </motion.div>
  );
};
