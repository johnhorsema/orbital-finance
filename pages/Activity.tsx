


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
        className="mb-8 pl-0"
        icon={<ArrowLeft size={16} />}
      >
        Back to Overview
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-sans font-medium tracking-tight text-text-primary">
            Activity
          </h1>
          <p className="text-text-secondary mt-2 font-mono text-sm">Complete transaction ledger</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
            <input 
               type="text" 
               placeholder="Search transactions..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-bg-surface border border-border pl-10 pr-4 py-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
            />
         </div>
         <div className="flex gap-2">
            {['ALL', 'INCOME', 'EXPENSE'].map((type) => (
               <button
                 key={type}
                 onClick={() => setFilterType(type as any)}
                 className={`px-4 py-2 text-xs font-mono border transition-colors ${filterType === type ? 'bg-bg-surface-highlight text-text-primary border-border-strong' : 'bg-bg-primary text-text-secondary border-border hover:border-border-strong'}`}
               >
                 {type}
               </button>
            ))}
         </div>
      </div>

      {/* List */}
      <div className="bg-bg-surface border border-border divide-y divide-border">
         {filteredTransactions.map((tx, i) => {
            const wallet = state.wallets.find(w => w.id === tx.walletId);
            return (
                <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedTx(tx)}
                    className="flex items-center justify-between p-4 hover:bg-bg-surface-highlight transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-1.5 h-12 ${tx.type === 'INCOME' ? 'bg-positive' : 'bg-negative'}`} />
                        <div>
                            <div className="text-text-primary font-sans text-sm">{tx.description}</div>
                            <div className="text-text-secondary text-xs font-mono flex gap-2 items-center mt-1">
                                <span>{tx.date}</span>
                                <span className="w-1 h-1 bg-text-tertiary" />
                                <span>{wallet?.name || 'Unknown Wallet'}</span>
                                <span className="w-1 h-1 bg-text-tertiary" />
                                <span className="px-1.5 py-0.5 bg-bg-surface-highlight border border-border text-[10px]">{tx.category}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`font-mono ${tx.type === 'INCOME' ? 'text-positive' : 'text-text-primary'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{tx.amount} {tx.currency}
                    </div>
                </motion.div>
            );
         })}
         {filteredTransactions.length === 0 && (
             <div className="py-20 text-center">
                 <p className="text-text-secondary font-mono text-sm">No records match your search.</p>
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