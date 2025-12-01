


import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRightLeft, TrendingUp, X, Filter, MoreVertical, Trash2, Edit, Save, PieChart as PieChartIcon, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TransactionDetailsModal } from '../components/TransactionDetailsModal';
import { Transaction, CurrencyCode, SUPPORTED_CURRENCIES } from '../types';
import { Drawer } from 'vaul';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { WalletIcon, ICON_OPTIONS } from '../components/WalletIcon';

const COLORS = ['#CCFF00', '#00F0FF', '#FF0099', '#7000FF', '#FFFFFF', '#52525b', '#fbbf24', '#34d399'];

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
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.transactions, id]);

  const categoryStats = useMemo(() => {
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
      <form onSubmit={handleAddTransaction} className="space-y-6">
        <div className="grid grid-cols-2 gap-0 border border-content/10 rounded-sm overflow-hidden">
            <button
            type="button"
            onClick={() => setAddType('EXPENSE')}
            className={`p-3 font-mono text-sm transition-colors ${addType === 'EXPENSE' ? 'bg-neon-pink text-black font-bold' : 'bg-transparent text-muted hover:text-content'}`}
            >
            EXPENSE
            </button>
            <button
            type="button"
            onClick={() => setAddType('INCOME')}
            className={`p-3 font-mono text-sm transition-colors ${addType === 'INCOME' ? 'bg-neon-green text-black font-bold' : 'bg-transparent text-muted hover:text-content'}`}
            >
            INCOME
            </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
            <label className="block text-xs font-mono text-muted mb-2 uppercase">Amount</label>
            <input 
                type="number"
                step="any"
                required
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-green focus:outline-none transition-colors"
                placeholder="0.00"
            />
            </div>
            <div className="col-span-1">
            <label className="block text-xs font-mono text-muted mb-2 uppercase">Currency</label>
            <select 
                value={addCurrency}
                onChange={(e) => setAddCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-green focus:outline-none"
            >
                {SUPPORTED_CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
                ))}
            </select>
            </div>
        </div>

        <div>
            <label className="block text-xs font-mono text-muted mb-2 uppercase">Category</label>
            <select 
            value={addCategory}
            onChange={(e) => setAddCategory(e.target.value)}
            className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-green focus:outline-none"
            >
            {state.categories.map(c => (
                <option key={c} value={c}>{c}</option>
            ))}
            </select>
        </div>

        <div>
            <label className="block text-xs font-mono text-muted mb-2 uppercase">Description</label>
            <input 
            type="text" 
            value={addDescription}
            onChange={(e) => setAddDescription(e.target.value)}
            className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-green focus:outline-none transition-colors"
            placeholder="What was this for?"
            />
        </div>

        <Button type="submit" variant="neon" className="w-full h-12">
            Confirm Transaction
        </Button>
    </form>
  );

  const currentChartData = categoryStats[chartTab.toLowerCase() as 'income' | 'expense'];
  const totalChartValue = currentChartData.reduce((acc, curr) => acc + curr.value, 0);

  // Inlined form logic to avoid remounting
  const renderEditForm = () => (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
        <div>
           <label className="block text-xs font-mono text-muted mb-2 uppercase">Wallet Name</label>
           <input 
              type="text" 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-green focus:outline-none"
           />
        </div>
        <div>
           <label className="block text-xs font-mono text-muted mb-2 uppercase">Theme Color</label>
           <div className="flex flex-wrap gap-3 items-center">
              {['#CCFF00', '#00F0FF', '#FF0099', '#7000FF', '#FFFFFF', '#ef4444', '#f97316', '#eab308', '#22c55e'].map(c => (
                  <button 
                      key={c}
                      onClick={() => setEditColor(c)}
                      className={`h-8 w-8 rounded-full border transition-transform hover:scale-110 ${editColor === c ? 'border-content ring-2 ring-content/20 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                  />
              ))}
              {/* Custom Color Input */}
              <div 
                onClick={() => colorInputRef.current?.click()}
                className="relative h-8 w-8 rounded-full overflow-hidden border border-content/20 hover:border-content transition-all cursor-pointer group flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-[conic-gradient(from_90deg,#fff,#000)] opacity-50 pointer-events-none" />
                <div className="w-full h-full bg-[conic-gradient(from_0deg,red,orange,yellow,green,blue,indigo,violet,red)] pointer-events-none" />
                <Plus size={14} className="absolute text-content pointer-events-none mix-blend-difference z-10" />
                <input 
                  ref={colorInputRef}
                  type="color" 
                  value={editColor} 
                  onChange={(e) => setEditColor(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full p-0 border-0 pointer-events-none" 
                />
              </div>
           </div>
        </div>
        
        {/* Icon Picker */}
        <div>
           <label className="block text-xs font-mono text-muted mb-2 uppercase">Icon</label>
           <div className="grid grid-cols-6 gap-2 bg-field/50 p-4 border border-content/5 rounded-lg max-h-48 overflow-y-auto custom-scrollbar">
              {ICON_OPTIONS.map(iconName => (
                  <button
                      key={iconName}
                      onClick={() => setEditIcon(iconName)}
                      className={`p-2 rounded flex items-center justify-center transition-colors aspect-square ${editIcon === iconName ? 'bg-neon-green/20 text-neon-green border border-neon-green/50' : 'bg-content/5 text-muted hover:bg-content/10 hover:text-content border border-transparent'}`}
                  >
                      <WalletIcon icon={iconName} size={20} />
                  </button>
              ))}
           </div>
        </div>
        
        <div className="pt-4 border-t border-content/5 flex gap-3">
            <Button onClick={handleSaveWallet} variant="neon" className="flex-1" icon={<Save size={16} />}>
                Save
            </Button>
            <Button onClick={handleDeleteWallet} variant="danger" className="flex-1" icon={<Trash2 size={16} />}>
                Delete
            </Button>
        </div>
    </div>
  );

  return (
    <div className="p-8 pb-20 max-w-5xl mx-auto">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate('/wallets')} 
        className="mb-8 pl-0 hover:bg-transparent hover:text-neon-green"
        icon={<ArrowLeft size={16} />}
      >
        Back to Vault
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between md:justify-start md:gap-4">
                <h1 className="text-4xl md:text-5xl font-sans font-bold text-content tracking-tighter uppercase truncate">
                    {wallet.name}
                </h1>
                <button 
                    onClick={handleOpenEdit}
                    className="p-2 hover:bg-content/10 rounded-full text-muted hover:text-content transition-colors"
                >
                    <Edit size={20} />
                </button>
            </div>
            <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 border border-content/20 rounded text-xs text-muted font-mono">
                    {wallet.type}
                </span>
                <span className="px-2 py-0.5 border border-content/20 rounded text-xs text-muted font-mono" style={{ color: wallet.color }}>
                    {wallet.baseCurrency}
                </span>
            </div>
        </div>

        <div className="bg-surface border border-content/10 p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-content/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10 pointer-events-none" style={{ background: wallet.color, opacity: 0.1 }} />
            
            <div className="absolute top-4 right-4 text-content/10">
                <WalletIcon icon={wallet.icon} type={wallet.type} size={48} />
            </div>

            <div className="text-sm font-mono text-muted uppercase">Available Balance</div>
            <div className="text-4xl font-mono font-bold text-content mt-2">
                {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} <span className="text-lg text-muted">{wallet.baseCurrency}</span>
            </div>
            <div className="mt-6 flex flex-col gap-3">
                <Button 
                    variant="neon" 
                    className="w-full" 
                    icon={<Plus size={16} />}
                    onClick={() => setIsAddingTx(true)}
                >
                    Add Transaction
                </Button>
                <Button 
                    variant="secondary" 
                    className="w-full" 
                    icon={<ArrowRightLeft size={16} />}
                    onClick={() => setIsTransferring(true)}
                >
                    Transfer
                </Button>
            </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-sans text-content flex items-center gap-2">
                  <PieChartIcon size={18} className="text-muted" />
                  Distribution
              </h3>
              <div className="flex bg-field border border-content/10 rounded-sm p-1">
                  <button 
                      onClick={() => setChartTab('EXPENSE')}
                      className={`text-xs font-mono uppercase px-3 py-1.5 rounded-sm transition-all ${chartTab === 'EXPENSE' ? 'bg-neon-pink text-black font-bold' : 'text-muted hover:text-content'}`}
                  >
                      Expense
                  </button>
                  <button 
                      onClick={() => setChartTab('INCOME')}
                      className={`text-xs font-mono uppercase px-3 py-1.5 rounded-sm transition-all ${chartTab === 'INCOME' ? 'bg-neon-green text-black font-bold' : 'text-muted hover:text-content'}`}
                  >
                      Income
                  </button>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-64">
               <div className="md:col-span-1 bg-surface border border-content/5 p-6 relative flex flex-col justify-center">
                   {currentChartData.length > 0 ? (
                       <div className="relative w-full h-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                   <Pie
                                       data={currentChartData}
                                       cx="50%"
                                       cy="50%"
                                       innerRadius={50}
                                       outerRadius={70}
                                       paddingAngle={5}
                                       dataKey="value"
                                       stroke="none"
                                   >
                                       {currentChartData.map((entry, index) => (
                                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                       ))}
                                   </Pie>
                                   <Tooltip 
                                       contentStyle={{ 
                                          backgroundColor: 'rgb(var(--color-surface))', 
                                          borderColor: 'rgb(var(--color-content) / 0.1)', 
                                          borderRadius: '0px',
                                          color: 'rgb(var(--color-content))'
                                       }}
                                       itemStyle={{ fontFamily: 'JetBrains Mono' }}
                                       formatter={(value: number) => {
                                           const percent = totalChartValue > 0 ? (value / totalChartValue * 100).toFixed(2) : '0.00';
                                           return [`${value.toFixed(2)} ${wallet.baseCurrency} (${percent}%)`, 'Amount'];
                                       }}
                                   />
                               </PieChart>
                           </ResponsiveContainer>
                           {/* Center Text */}
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                               <div className={`text-xs font-mono font-bold ${chartTab === 'INCOME' ? 'text-neon-green' : 'text-neon-pink'}`}>
                                   {chartTab}
                               </div>
                           </div>
                       </div>
                   ) : (
                       <div className="h-full flex flex-col items-center justify-center text-muted font-mono text-xs text-center">
                           No data to display for {chartTab.toLowerCase()}
                       </div>
                   )}
               </div>

               {/* Legend / Breakdown List */}
               <div className="md:col-span-2 bg-surface border border-content/5 p-6 overflow-y-auto custom-scrollbar">
                   <div className="flex justify-between text-xs font-mono text-muted uppercase mb-4 pb-2 border-b border-content/5">
                       <span>Category</span>
                       <span>Amount & %</span>
                   </div>
                   <div className="space-y-3">
                       {currentChartData.map((entry, index) => {
                           const percent = totalChartValue > 0 ? ((entry.value / totalChartValue) * 100).toFixed(2) : '0.00';
                           return (
                            <div key={entry.name} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-content font-sans text-sm group-hover:text-neon-cyan transition-colors">{entry.name}</span>
                                </div>
                                <div className="font-mono text-sm text-muted text-right">
                                    <div>{entry.value.toFixed(2)} <span className="text-xs text-muted">{wallet.baseCurrency}</span></div>
                                    <div className="text-[10px] text-neon-green opacity-60 group-hover:opacity-100">{percent}%</div>
                                </div>
                            </div>
                           );
                       })}
                       {currentChartData.length === 0 && (
                           <div className="text-muted font-mono text-sm italic">No transactions recorded yet.</div>
                       )}
                   </div>
               </div>
          </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-content/5 pb-4">
            <h3 className="text-lg font-sans text-content">Ledger</h3>
            <div className="flex gap-2">
                {/* Future filter implementation */}
            </div>
        </div>
        
        <div className="space-y-2">
            {transactions.map((tx, i) => (
                <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedTx(tx)}
                    className="flex items-center justify-between p-4 bg-surface/50 border border-transparent hover:border-content/10 hover:bg-surfaceHighlight transition-all cursor-pointer group rounded-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${tx.type === 'INCOME' ? 'bg-neon-green/10 text-neon-green' : 'bg-neon-pink/10 text-neon-pink'}`}>
                            <TrendingUp size={16} className={tx.type === 'EXPENSE' ? 'rotate-180' : ''} />
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-content font-sans text-sm truncate max-w-[200px] md:max-w-md">{tx.description}</div>
                            <div className="text-muted text-xs font-mono flex gap-2">
                                <span>{tx.date}</span>
                                <span className="text-content/20">|</span>
                                <span>{tx.category}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`font-mono ${tx.type === 'INCOME' ? 'text-neon-green' : 'text-content'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{tx.amount} {tx.currency}
                    </div>
                </motion.div>
            ))}
            {transactions.length === 0 && (
                <div className="py-12 text-center text-muted font-mono">No transactions found.</div>
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsAddingTx(false)}
            />
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-surface border border-content/10 p-8 w-full max-w-lg relative z-10 shadow-2xl shadow-neon-green/10"
            >
               <button onClick={() => setIsAddingTx(false)} className="absolute top-4 right-4 text-muted hover:text-content">
                 <X size={24} />
               </button>
               <h2 className="text-2xl font-sans text-content mb-6">Log Transaction</h2>
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
                <Drawer.Content className="bg-surface border-t border-content/10 flex flex-col rounded-t-[10px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-[101] outline-none">
                    <div className="p-4 bg-surface rounded-t-[10px] flex-1 overflow-y-auto">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-content/10 mb-8" />
                        <Drawer.Title className="text-xl font-sans text-content mb-6">Log Transaction</Drawer.Title>
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
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={() => setIsTransferring(false)}
                />
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-surface border border-content/10 p-8 w-full max-w-md relative z-10 shadow-2xl"
                >
                    <button onClick={() => setIsTransferring(false)} className="absolute top-4 right-4 text-muted hover:text-content">
                        <X size={24} />
                    </button>
                    
                    <h2 className="text-2xl font-sans text-content mb-6">Transfer Funds</h2>
                    
                    <form onSubmit={handleTransfer} className="space-y-6">
                        <div className="bg-content/5 p-4 rounded border border-content/5">
                            <label className="block text-xs font-mono text-muted mb-1 uppercase">From</label>
                            <div className="text-content font-bold">{wallet.name}</div>
                            <div className="text-xs text-muted">Balance: {wallet.balance.toFixed(2)} {wallet.baseCurrency}</div>
                        </div>

                        <div className="flex justify-center -my-3 relative z-10">
                            <div className="bg-field border border-content/10 p-2 rounded-full text-neon-green">
                                <ArrowRightLeft size={16} className="rotate-90" />
                            </div>
                        </div>

                        <div>
                             <label className="block text-xs font-mono text-muted mb-2 uppercase">To Wallet</label>
                             <select 
                                value={transferTargetId}
                                onChange={(e) => setTransferTargetId(e.target.value)}
                                className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-green focus:outline-none"
                                required
                             >
                                <option value="" disabled>Select Destination</option>
                                {state.wallets.filter(w => w.id !== wallet.id).map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.balance.toFixed(2)} {w.baseCurrency})</option>
                                ))}
                             </select>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-muted mb-2 uppercase">Amount ({wallet.baseCurrency})</label>
                            <input 
                                type="number"
                                step="any"
                                required
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-green focus:outline-none"
                                placeholder="0.00"
                            />
                        </div>

                        <Button type="submit" variant="neon" className="w-full h-12">
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsEditingWallet(false)}
            />
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-surface border border-content/10 p-8 w-full max-w-md relative z-10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
               <button onClick={() => setIsEditingWallet(false)} className="absolute top-4 right-4 text-muted hover:text-content">
                 <X size={24} />
               </button>
               <h2 className="text-2xl font-sans text-content mb-6">Edit Wallet</h2>
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
                <Drawer.Content className="bg-surface border-t border-content/10 flex flex-col rounded-t-[10px] fixed bottom-0 left-0 right-0 z-[101] outline-none">
                    <div className="p-4 bg-surface rounded-t-[10px]">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-content/10 mb-8" />
                        <Drawer.Title className="text-xl font-sans text-content mb-6">Edit Wallet</Drawer.Title>
                        {renderEditForm()}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
      </div>
    </div>
  );
};