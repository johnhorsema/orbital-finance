
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRightLeft, TrendingUp, X, Trash2, Edit, Save, PieChart as PieChartIcon, Plus, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TransactionDetailsModal } from '../components/TransactionDetailsModal';
import { Transaction, CurrencyCode, SUPPORTED_CURRENCIES } from '../types';
import { Drawer } from 'vaul';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { WalletIcon, ICON_OPTIONS } from '../components/WalletIcon';

// Restrained data visualization colors - muted, purposeful
const CHART_COLORS = [
  'oklch(0.65 0.18 250)',  // Electric Blue (accent)
  'oklch(0.72 0.16 145)',  // Muted Green (positive)
  'oklch(0.62 0.18 25)',   // Muted Red (negative)
  'oklch(0.75 0.15 85)',   // Amber (warning)
  'oklch(0.65 0.12 320)',  // Muted Purple
  'oklch(0.70 0.14 160)',  // Teal
  'oklch(0.68 0.16 45)',   // Warm Orange
  'oklch(0.60 0.14 280)',  // Soft Violet
];

export const WalletDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, deleteTransaction, transferFunds, updateWallet, deleteWallet, addTransaction, themeMode } = useFinance();
  const wallet = state.wallets.find(w => w.id === id);

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isAddingTx, setIsAddingTx] = useState(false);
  const [isEditingWallet, setIsEditingWallet] = useState(false);
  const [chartTab, setChartTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  // Wallet Edit State
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  // Transfer State
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTargetId, setTransferTargetId] = useState('');

  // Add Transaction State
  const [addAmount, setAddAmount] = useState('');
  const [addCurrency, setAddCurrency] = useState<CurrencyCode>('USD');
  const [addCategory, setAddCategory] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addType, setAddType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

  useEffect(() => {
    if (wallet) {
        setAddCurrency(wallet.baseCurrency);
    }
    if (state.categories.length > 0) {
        setAddCategory(state.categories[0]);
    }
  }, [wallet, state.categories]);

  const transactions = useMemo(() => {
    return state.transactions
      .filter(t => t.walletId === id)
      .filter(t => {
          const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                t.category.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesType = filterType === 'ALL' || t.type === filterType;
          return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.transactions, id, searchTerm, filterType]);

  const categoryStats = useMemo(() => {
    // Note: Stats should probably reflect All transactions, not just filtered ones, 
    // unless we want charts to update with filter. Let's make charts static for the wallet, 
    // and only filter the list. Or updating charts is cool too. Let's update charts based on filtered data.
    const income: Record<string, number> = {};
    const expense: Record<string, number> = {};

    transactions.forEach(tx => {
      // We use convertedAmount to show the value relative to the wallet's base currency
      const val = tx.convertedAmount;
      if (tx.type === 'INCOME') {
        income[tx.category] = (income[tx.category] || 0) + val;
      } else {
        expense[tx.category] = (expense[tx.category] || 0) + val;
      }
    });

    const formatData = (data: Record<string, number>) => 
      Object.entries(data)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    return {
      income: formatData(income),
      expense: formatData(expense)
    };
  }, [transactions]);

  if (!wallet) {
    return (
        <div className="p-8 text-content flex flex-col items-center justify-center min-h-[50vh]">
            <h2 className="text-2xl font-sans mb-4">Wallet Disconnected</h2>
            <Button onClick={() => navigate('/wallets')} variant="primary">Return to Vault</Button>
        </div>
    );
  }

  const handleOpenEdit = () => {
      setEditName(wallet.name);
      setEditColor(wallet.color);
      setEditIcon(wallet.icon || '');
      setIsEditingWallet(true);
  };

  const handleSaveWallet = () => {
      updateWallet(wallet.id, { name: editName, color: editColor, icon: editIcon });
      setIsEditingWallet(false);
  };

  const handleDeleteWallet = () => {
      if (window.confirm("Are you sure? This will delete the wallet and ALL associated transactions permanently.")) {
          deleteWallet(wallet.id);
          navigate('/wallets');
      }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || !transferTargetId) return;
    
    await transferFunds(wallet.id, transferTargetId, parseFloat(transferAmount));
    setIsTransferring(false);
    setTransferAmount('');
    setTransferTargetId('');
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAmount) return;

    await addTransaction({
        walletId: wallet.id,
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(addAmount),
        currency: addCurrency,
        type: addType,
        category: addCategory,
        description: addDescription || addCategory
    });

    setIsAddingTx(false);
    setAddAmount('');
    setAddDescription('');
  };

  const AddTransactionForm = () => (
      <form onSubmit={handleAddTransaction} className="space-y-4">
        <div className="grid grid-cols-2 border border-border">
            <button
            type="button"
            onClick={() => setAddType('EXPENSE')}
            className={`p-3 font-mono text-sm transition-colors duration-150 ${addType === 'EXPENSE' ? 'bg-negative text-white font-semibold' : 'bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-elevated'}`}
            >
            EXPENSE
            </button>
            <button
            type="button"
            onClick={() => setAddType('INCOME')}
            className={`p-3 font-mono text-sm transition-colors duration-150 ${addType === 'INCOME' ? 'bg-positive text-white font-semibold' : 'bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-elevated'}`}
            >
            INCOME
            </button>
        </div>
  
        <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-xs font-mono text-text-tertiary mb-2 uppercase tracking-wide">Amount</label>
            <input
                type="number"
                step="any"
                required
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="w-full bg-bg-surface border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors duration-150 placeholder:text-text-tertiary"
                placeholder="0.00"
            />
            </div>
            <div>
            <label className="block text-xs font-mono text-text-tertiary mb-2 uppercase tracking-wide">Currency</label>
            <select
                value={addCurrency}
                onChange={(e) => setAddCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-bg-surface border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors duration-150"
            >
                {SUPPORTED_CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
                ))}
            </select>
            </div>
        </div>
  
        <div>
            <label className="block text-xs font-mono text-text-tertiary mb-2 uppercase tracking-wide">Category</label>
            <select
            value={addCategory}
            onChange={(e) => setAddCategory(e.target.value)}
            className="w-full bg-bg-surface border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors duration-150"
            >
            {state.categories.map(c => (
                <option key={c} value={c}>{c}</option>
            ))}
            </select>
        </div>
  
        <div>
            <label className="block text-xs font-mono text-text-tertiary mb-2 uppercase tracking-wide">Description</label>
            <input
            type="text"
            value={addDescription}
            onChange={(e) => setAddDescription(e.target.value)}
            className="w-full bg-bg-surface border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors duration-150 placeholder:text-text-tertiary"
            placeholder="What was this for?"
            />
        </div>
  
        <Button type="submit" variant="primary" className="w-full">
            Confirm Transaction
        </Button>
    </form>
  );

  const currentChartData = categoryStats[chartTab.toLowerCase() as 'income' | 'expense'];
  const totalChartValue = currentChartData.reduce((acc, curr) => acc + curr.value, 0);

  // Inlined form logic to avoid remounting
  const renderEditForm = () => (
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <div>
           <label className="block text-xs font-mono text-text-tertiary mb-2 uppercase tracking-wide">Wallet Name</label>
           <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-bg-surface border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors duration-150"
           />
        </div>
        <div>
           <label className="block text-xs font-mono text-text-tertiary mb-2 uppercase tracking-wide">Theme Color</label>
           <div className="flex flex-wrap gap-2 items-center">
              {['oklch(0.65 0.18 250)', 'oklch(0.72 0.16 145)', 'oklch(0.62 0.18 25)', 'oklch(0.75 0.15 85)', 'oklch(0.65 0.12 320)', 'oklch(0.95 0.005 260)'].map(c => (
                  <button
                      key={c}
                      onClick={() => setEditColor(c)}
                      className={`h-8 w-8 border-2 transition-all duration-150 ${editColor === c ? 'border-text-primary scale-110' : 'border-transparent hover:border-border'}`}
                      style={{ backgroundColor: c }}
                  />
              ))}
              {/* Custom Color Input */}
              <div
                onClick={() => colorInputRef.current?.click()}
                className="relative h-8 w-8 border-2 border-border hover:border-text-primary transition-all duration-150 cursor-pointer flex items-center justify-center overflow-hidden"
              >
                <div className="w-full h-full bg-[conic-gradient(from_0deg,red,orange,yellow,green,blue,indigo,violet,red)]" />
                <Plus size={14} className="absolute text-white drop-shadow-md z-10" />
                <input
                  ref={colorInputRef}
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full p-0 border-0 cursor-pointer"
                />
              </div>
           </div>
        </div>
  
        {/* Icon Picker */}
        <div>
           <label className="block text-xs font-mono text-text-tertiary mb-2 uppercase tracking-wide">Icon</label>
           <div className="grid grid-cols-6 gap-2 bg-bg-elevated p-3 border border-border max-h-48 overflow-y-auto">
              {ICON_OPTIONS.map(iconName => (
                  <button
                      key={iconName}
                      onClick={() => setEditIcon(iconName)}
                      className={`p-2 flex items-center justify-center transition-colors duration-150 aspect-square ${editIcon === iconName ? 'bg-accent/20 text-accent border border-accent/50' : 'bg-bg-surface text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent'}`}
                  >
                      <WalletIcon icon={iconName} size={20} />
                  </button>
              ))}
           </div>
        </div>
  
        <div className="pt-4 border-t border-border flex gap-3">
            <Button onClick={handleSaveWallet} variant="primary" className="flex-1" icon={<Save size={16} />}>
                Save Changes
            </Button>
            <Button onClick={handleDeleteWallet} variant="danger" className="flex-1" icon={<Trash2 size={16} />}>
                Delete Wallet
            </Button>
        </div>
    </div>
  );

  return (
    <div className="px-8 py-6 pb-20 max-w-6xl mx-auto">
      {/* Header Navigation */}
      <button
        onClick={() => navigate('/wallets')}
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors duration-150 mb-8 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-150" />
        <span className="text-sm font-medium">Back to Vault</span>
      </button>

      {/* Wallet Header Section */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <WalletIcon icon={wallet.icon} type={wallet.type} size={24} className="text-text-secondary" />
              <h1 className="text-3xl font-semibold text-text-primary tracking-tight truncate">
                {wallet.name}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-bg-elevated border border-border text-xs text-text-secondary font-mono">
                {wallet.type}
              </span>
              <span className="px-2 py-0.5 bg-bg-elevated border border-border text-xs font-mono" style={{ color: wallet.color }}>
                {wallet.baseCurrency}
              </span>
            </div>
          </div>
          <button
            onClick={handleOpenEdit}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150 shrink-0"
            aria-label="Edit wallet"
          >
            <Edit size={18} />
          </button>
        </div>
      </div>

      {/* Balance Card + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 bg-bg-surface border border-border p-6">
          <div className="text-sm text-text-secondary mb-1 font-mono uppercase tracking-wide">Available Balance</div>
          <div className="text-4xl font-mono font-semibold text-text-primary tracking-tight mb-6">
            {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            <span className="text-lg text-text-secondary ml-2">{wallet.baseCurrency}</span>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1"
              icon={<Plus size={16} />}
              onClick={() => setIsAddingTx(true)}
            >
              Add Transaction
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              icon={<ArrowRightLeft size={16} />}
              onClick={() => setIsTransferring(true)}
            >
              Transfer
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-bg-surface border border-border p-6">
          <div className="text-sm text-text-secondary mb-4 font-mono uppercase tracking-wide">Overview</div>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-text-tertiary mb-1 font-mono uppercase">Income</div>
              <div className="text-xl font-mono font-semibold text-positive">
                {categoryStats.income.reduce((acc, curr) => acc + curr.value, 0).toFixed(2)}
                <span className="text-sm text-text-secondary ml-1">{wallet.baseCurrency}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-text-tertiary mb-1 font-mono uppercase">Expenses</div>
              <div className="text-xl font-mono font-semibold text-negative">
                {categoryStats.expense.reduce((acc, curr) => acc + curr.value, 0).toFixed(2)}
                <span className="text-sm text-text-secondary ml-1">{wallet.baseCurrency}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-text-tertiary mb-1 font-mono uppercase">Transactions</div>
              <div className="text-xl font-mono font-semibold text-text-primary">
                {transactions.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <PieChartIcon size={18} className="text-text-secondary" />
                  Category Distribution
              </h2>
              <div className="flex bg-bg-elevated border border-border">
                  <button
                      onClick={() => setChartTab('EXPENSE')}
                      className={`text-xs font-mono uppercase px-4 py-2 transition-colors duration-150 ${chartTab === 'EXPENSE' ? 'bg-negative text-white font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                      Expense
                  </button>
                  <button
                      onClick={() => setChartTab('INCOME')}
                      className={`text-xs font-mono uppercase px-4 py-2 transition-colors duration-150 ${chartTab === 'INCOME' ? 'bg-positive text-white font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                      Income
                  </button>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Chart */}
               <div className="lg:col-span-1 bg-bg-surface border border-border p-6">
                   {currentChartData.length > 0 ? (
                       <div className="relative w-full h-64">
                           <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                   <Pie
                                       data={currentChartData}
                                       cx="50%"
                                       cy="50%"
                                       innerRadius={60}
                                       outerRadius={80}
                                       paddingAngle={2}
                                       dataKey="value"
                                       stroke="none"
                                   >
                                       {currentChartData.map((entry, index) => (
                                           <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                       ))}
                                   </Pie>
                                   <Tooltip
                                       contentStyle={{
                                          backgroundColor: 'var(--color-bg-elevated)',
                                          borderColor: 'var(--color-border)',
                                          borderRadius: '0',
                                          color: 'var(--color-text-primary)',
                                          fontFamily: 'JetBrains Mono, monospace',
                                          fontSize: '12px'
                                       }}
                                       formatter={(value: number) => {
                                           const percent = totalChartValue > 0 ? (value / totalChartValue * 100).toFixed(1) : '0.0';
                                           return [`${value.toFixed(2)} ${wallet.baseCurrency} (${percent}%)`, 'Amount'];
                                       }}
                                   />
                               </PieChart>
                           </ResponsiveContainer>
                           {/* Center Text */}
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                               <div className={`text-xs font-mono font-semibold ${chartTab === 'INCOME' ? 'text-positive' : 'text-negative'}`}>
                                   {chartTab}
                               </div>
                           </div>
                       </div>
                   ) : (
                       <div className="h-64 flex flex-col items-center justify-center text-text-tertiary font-mono text-xs text-center">
                           No data to display
                       </div>
                   )}
               </div>

               {/* Breakdown List */}
               <div className="lg:col-span-2 bg-bg-surface border border-border">
                   <div className="px-6 py-3 border-b border-border flex justify-between text-xs font-mono text-text-tertiary uppercase tracking-wide">
                       <span>Category</span>
                       <span>Amount</span>
                   </div>
                   <div className="divide-y divide-border max-h-64 overflow-y-auto">
                       {currentChartData.map((entry, index) => {
                           const percent = totalChartValue > 0 ? ((entry.value / totalChartValue) * 100).toFixed(1) : '0.0';
                           return (
                            <div key={entry.name} className="px-6 py-3 flex items-center justify-between hover:bg-bg-elevated transition-colors duration-150">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                    <span className="text-text-primary text-sm">{entry.name}</span>
                                </div>
                                <div className="font-mono text-sm text-text-secondary text-right">
                                    <div>{entry.value.toFixed(2)} <span className="text-xs text-text-tertiary">{wallet.baseCurrency}</span></div>
                                    <div className="text-[10px] text-text-tertiary">{percent}%</div>
                                </div>
                            </div>
                           );
                       })}
                       {currentChartData.length === 0 && (
                           <div className="px-6 py-12 text-center text-text-tertiary font-mono text-sm">No transactions recorded</div>
                       )}
                   </div>
               </div>
          </div>
      </div>

      {/* Transaction History */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4 mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Transaction Ledger</h2>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                 {/* Search Input */}
                 <div className="relative flex-1 sm:w-64">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={14} />
                     <input
                         type="text"
                         placeholder="Search transactions..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="w-full bg-bg-surface border border-border pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none transition-colors duration-150"
                     />
                 </div>
                 
                 {/* Type Filter */}
                 <div className="flex border border-border">
                     {(['ALL', 'INCOME', 'EXPENSE'] as const).map(type => (
                         <button
                             key={type}
                             onClick={() => setFilterType(type)}
                             className={`px-3 py-2 text-xs font-mono font-semibold transition-colors duration-150 ${filterType === type ? 'bg-text-primary bg-opacity-90 text-bg-primary' : 'bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-elevated'}`}
                         >
                             {type}
                         </button>
                     ))}
                 </div>
            </div>
        </div>
        
        <div className="bg-bg-surface border border-border divide-y divide-border">
            {transactions.map((tx) => (
                <button
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-bg-elevated transition-colors duration-150 text-left"
                >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`p-2 shrink-0 ${tx.type === 'INCOME' ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>
                            <TrendingUp size={16} className={tx.type === 'EXPENSE' ? 'rotate-180' : ''} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-text-primary text-sm truncate">{tx.description}</div>
                            <div className="text-text-tertiary text-xs font-mono mt-0.5 flex items-center gap-2">
                                <span>{tx.date}</span>
                                <span className="text-border">·</span>
                                <span>{tx.category}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`font-mono text-sm shrink-0 ml-4 ${tx.type === 'INCOME' ? 'text-positive' : 'text-text-primary'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{tx.amount} {tx.currency}
                    </div>
                </button>
            ))}
            {transactions.length === 0 && (
                <div className="py-16 text-center text-text-tertiary font-mono text-sm">No transactions found</div>
            )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedTx && (
            <TransactionDetailsModal 
                transaction={selectedTx} 
                wallet={wallet}
                onClose={() => setSelectedTx(null)}
                onDelete={deleteTransaction}
            />
        )}
      </AnimatePresence>

      {/* Add Transaction Modal (Desktop) */}
      <AnimatePresence>
        {isAddingTx && (
          <div className="hidden md:flex fixed inset-0 z-[100] items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsAddingTx(false)}
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-bg-surface border border-border p-6 w-full max-w-lg relative z-10"
            >
               <button onClick={() => setIsAddingTx(false)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors duration-150">
                 <X size={20} />
               </button>
               <h2 className="text-xl font-semibold text-text-primary mb-6">Log Transaction</h2>
               <AddTransactionForm />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Add Transaction Drawer (Mobile) */}
      <div className="md:hidden">
        <Drawer.Root open={isAddingTx} onOpenChange={setIsAddingTx}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
                <Drawer.Content className="bg-bg-surface border-t border-border flex flex-col h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-[101] outline-none">
                    <div className="p-4 bg-bg-surface flex-1 overflow-y-auto">
                        <div className="mx-auto w-12 h-1 flex-shrink-0 bg-bg-elevated mb-6" />
                        <Drawer.Title className="text-xl font-semibold text-text-primary mb-6">Log Transaction</Drawer.Title>
                        <AddTransactionForm />
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
      </div>

      {/* Transfer Modal */}
      <AnimatePresence>
        {isTransferring && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={() => setIsTransferring(false)}
                />
                <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.98, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-bg-surface border border-border p-6 w-full max-w-md relative z-10"
                >
                    <button onClick={() => setIsTransferring(false)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors duration-150">
                        <X size={20} />
                    </button>
      
                    <h2 className="text-xl font-semibold text-text-primary mb-6">Transfer Funds</h2>
      
                    <form onSubmit={handleTransfer} className="space-y-4">
                        <div className="bg-bg-elevated p-4 border border-border">
                            <label className="block text-xs font-mono text-text-tertiary mb-1 uppercase tracking-wide">From</label>
                            <div className="text-text-primary font-semibold">{wallet.name}</div>
                            <div className="text-xs text-text-tertiary font-mono">Balance: {wallet.balance.toFixed(2)} {wallet.baseCurrency}</div>
                        </div>
      
                        <div className="flex justify-center -my-2 relative z-10">
                            <div className="bg-bg-elevated border border-border p-2 text-positive">
                                <ArrowRightLeft size={16} />
                            </div>
                        </div>
      
                        <div>
                             <label className="block text-xs font-mono text-text-tertiary mb-2 uppercase tracking-wide">To Wallet</label>
                             <select
                                value={transferTargetId}
                                onChange={(e) => setTransferTargetId(e.target.value)}
                                className="w-full bg-bg-surface border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors duration-150"
                                required
                             >
                                <option value="" disabled>Select Destination</option>
                                {state.wallets.filter(w => w.id !== wallet.id).map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.balance.toFixed(2)} {w.baseCurrency})</option>
                                ))}
                             </select>
                        </div>
      
                        <div>
                            <label className="block text-xs font-mono text-text-tertiary mb-2 uppercase tracking-wide">Amount ({wallet.baseCurrency})</label>
                            <input
                                type="number"
                                step="any"
                                required
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                className="w-full bg-bg-surface border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors duration-150 placeholder:text-text-tertiary"
                                placeholder="0.00"
                            />
                        </div>
      
                        <Button type="submit" variant="primary" className="w-full">
                            Execute Transfer
                        </Button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Edit Wallet Modal (Desktop) */}
      <AnimatePresence>
        {isEditingWallet && (
          <div className="hidden md:flex fixed inset-0 z-[100] items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsEditingWallet(false)}
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-bg-surface border border-border p-6 w-full max-w-md relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
               <button onClick={() => setIsEditingWallet(false)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors duration-150">
                 <X size={20} />
               </button>
               <h2 className="text-xl font-semibold text-text-primary mb-6">Edit Wallet</h2>
               {renderEditForm()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Edit Wallet Drawer (Mobile) */}
      <div className="md:hidden">
        <Drawer.Root open={isEditingWallet} onOpenChange={setIsEditingWallet}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
                <Drawer.Content className="bg-bg-surface border-t border-border flex flex-col fixed bottom-0 left-0 right-0 z-[101] outline-none">
                    <div className="p-4 bg-bg-surface">
                        <div className="mx-auto w-12 h-1 flex-shrink-0 bg-bg-elevated mb-6" />
                        <Drawer.Title className="text-xl font-semibold text-text-primary mb-6">Edit Wallet</Drawer.Title>
                        {renderEditForm()}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
      </div>
    </div>
  );
};
