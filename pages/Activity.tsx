


import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TransactionDetailsModal } from '../components/TransactionDetailsModal';
import { Transaction } from '../types';
import { useNavigate } from 'react-router-dom';

export const Activity: React.FC = () => {
  const { state, deleteTransaction } = useFinance();
  const navigate = useNavigate();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const filteredTransactions = useMemo(() => {
    return state.transactions
      .filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              t.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || t.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.transactions, searchTerm, filterType]);

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
       <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate('/')} 
        className="mb-8 pl-0 hover:bg-transparent hover:text-neon-green"
        icon={<ArrowLeft size={16} />}
      >
        Back to Overview
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-sans font-light text-content tracking-tighter">
            GLOBAL <span className="text-neon-pink font-bold">ACTIVITY</span>
          </h1>
          <p className="text-muted mt-2 font-mono">Complete transaction ledger.</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
               type="text" 
               placeholder="Search ledger..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-surface border border-content/10 pl-10 pr-4 py-3 text-content font-mono focus:border-neon-pink focus:outline-none"
            />
         </div>
         <div className="flex gap-2">
            {['ALL', 'INCOME', 'EXPENSE'].map((type) => (
               <button
                 key={type}
                 onClick={() => setFilterType(type as any)}
                 className={`px-4 py-2 text-xs font-mono border transition-colors ${filterType === type ? 'bg-content/10 text-content border-content' : 'bg-field text-muted border-content/10 hover:border-content/30'}`}
               >
                 {type}
               </button>
            ))}
         </div>
      </div>

      {/* List */}
      <div className="space-y-2">
         {filteredTransactions.map((tx, i) => {
            const wallet = state.wallets.find(w => w.id === tx.walletId);
            return (
                <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedTx(tx)}
                    className="flex items-center justify-between p-4 bg-surface border border-content/5 hover:border-neon-pink/30 hover:bg-surfaceHighlight transition-all cursor-pointer group"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-1 h-12 ${tx.type === 'INCOME' ? 'bg-neon-green' : 'bg-neon-pink'}`} />
                        <div>
                            <div className="text-content font-sans text-sm">{tx.description}</div>
                            <div className="text-muted text-xs font-mono flex gap-2 items-center mt-1">
                                <span>{tx.date}</span>
                                <span className="w-1 h-1 bg-muted rounded-full" />
                                <span className="text-muted">{wallet?.name || 'Unknown Wallet'}</span>
                                <span className="w-1 h-1 bg-muted rounded-full" />
                                <span className="px-1.5 py-0.5 bg-content/5 rounded text-[10px]">{tx.category}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`font-mono ${tx.type === 'INCOME' ? 'text-neon-green' : 'text-content'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{tx.amount} {tx.currency}
                    </div>
                </motion.div>
            );
         })}
         {filteredTransactions.length === 0 && (
             <div className="py-20 text-center border border-dashed border-content/10 bg-surface/30">
                 <p className="text-muted font-mono">No records match query parameters.</p>
             </div>
         )}
      </div>

      {/* Detail Modal */}
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
    </div>
  );
};