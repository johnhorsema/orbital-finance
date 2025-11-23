
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, Calendar, Tag, CreditCard, Save, Edit2, ArrowLeft } from 'lucide-react';
import { Transaction, Wallet, SUPPORTED_CURRENCIES, CurrencyCode } from '../types';
import { Button } from './ui/Button';
import { Drawer } from 'vaul';
import { useFinance } from '../context/FinanceContext';

interface TransactionDetailsModalProps {
  transaction: Transaction;
  wallet?: Wallet;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ 
  transaction, 
  wallet,
  onClose, 
  onDelete 
}) => {
  const { updateTransaction, state } = useFinance();
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form State
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [currency, setCurrency] = useState<CurrencyCode>(transaction.currency);
  const [description, setDescription] = useState(transaction.description);
  const [category, setCategory] = useState(transaction.category);
  const [date, setDate] = useState(transaction.date);
  const [type, setType] = useState(transaction.type);

  const handleSave = async () => {
    await updateTransaction(transaction.id, {
        amount: parseFloat(amount),
        currency,
        description,
        category,
        date,
        type
    });
    setIsEditing(false);
  };

  const Content = () => (
    <div className="relative">
      {!isEditing ? (
          // VIEW MODE
          <>
            <div className="mb-6">
                <div className={`inline-block px-3 py-1 rounded-sm text-xs font-mono font-bold mb-4 ${transaction.type === 'INCOME' ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-pink/20 text-neon-pink'}`}>
                    {transaction.type}
                </div>
                <h2 className="text-2xl font-sans text-white leading-tight break-words">{transaction.description}</h2>
                <div className="text-3xl font-mono text-white mt-2">
                    {transaction.amount} <span className="text-lg text-gray-500">{transaction.currency}</span>
                </div>
                {transaction.convertedAmount !== transaction.amount && (
                    <div className="text-sm text-gray-500 font-mono mt-1">
                        ≈ {transaction.convertedAmount.toFixed(2)} {wallet?.baseCurrency || 'Base'}
                    </div>
                )}
            </div>

            <div className="space-y-4 border-t border-white/5 pt-6">
                <div className="flex items-center gap-3 text-gray-400">
                    <Calendar size={18} />
                    <span className="font-mono text-sm">{transaction.date}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                    <Tag size={18} />
                    <span className="font-mono text-sm">{transaction.category}</span>
                </div>
                {wallet && (
                    <div className="flex items-center gap-3 text-gray-400">
                        <CreditCard size={18} />
                        <span className="font-mono text-sm" style={{ color: wallet.color }}>{wallet.name}</span>
                    </div>
                )}
            </div>

            <div className="mt-8 flex gap-3">
                <Button 
                    variant="secondary" 
                    className="flex-1" 
                    icon={<Edit2 size={16} />}
                    onClick={() => setIsEditing(true)}
                >
                    Edit
                </Button>
                <Button 
                    variant="danger" 
                    className="flex-1" 
                    icon={<Trash2 size={16} />}
                    onClick={() => {
                        onDelete(transaction.id);
                        onClose();
                    }}
                >
                    Delete
                </Button>
            </div>
          </>
      ) : (
          // EDIT MODE
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-4">
                 <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-white/10 rounded text-gray-400">
                     <ArrowLeft size={18} />
                 </button>
                 <h3 className="text-lg font-sans text-white">Edit Transaction</h3>
             </div>

             <div className="grid grid-cols-2 gap-2">
                 <button
                   type="button"
                   onClick={() => setType('EXPENSE')}
                   className={`p-2 text-xs font-mono border ${type === 'EXPENSE' ? 'border-neon-pink text-neon-pink bg-neon-pink/10' : 'border-white/10 text-gray-500'}`}
                 >
                   EXPENSE
                 </button>
                 <button
                   type="button"
                   onClick={() => setType('INCOME')}
                   className={`p-2 text-xs font-mono border ${type === 'INCOME' ? 'border-neon-green text-neon-green bg-neon-green/10' : 'border-white/10 text-gray-500'}`}
                 >
                   INCOME
                 </button>
             </div>

             <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Amount</label>
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex-1 bg-black border border-white/10 p-2 text-white font-mono text-sm focus:border-neon-green focus:outline-none"
                    />
                    <select 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                        className="bg-black border border-white/10 p-2 text-white font-mono text-sm focus:border-neon-green focus:outline-none"
                    >
                        {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
             </div>

             <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Description</label>
                <input 
                    type="text" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-black border border-white/10 p-2 text-white font-mono text-sm focus:border-neon-green focus:outline-none"
                />
             </div>

             <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Category</label>
                <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black border border-white/10 p-2 text-white font-mono text-sm focus:border-neon-green focus:outline-none"
                >
                    {state.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>

             <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Date</label>
                <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-black border border-white/10 p-2 text-white font-mono text-sm focus:border-neon-green focus:outline-none"
                />
             </div>

             <Button onClick={handleSave} variant="neon" className="w-full mt-4" icon={<Save size={16} />}>
                 Save Changes
             </Button>
          </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Modal */}
      <div className="hidden md:flex fixed inset-0 z-[100] items-center justify-center p-4">
          <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={onClose}
          />
          <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-surface border border-white/10 p-8 w-full max-w-md relative z-10 shadow-2xl"
          >
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                  <X size={24} />
              </button>
              <Content />
          </motion.div>
      </div>

      {/* Mobile Drawer */}
      <div className="md:hidden">
        <Drawer.Root open={true} onOpenChange={(open) => !open && onClose()}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
            <Drawer.Content className="bg-surface border-t border-white/10 flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0 z-[101] outline-none max-h-[90vh]">
              <div className="p-4 bg-surface rounded-t-[10px] flex-1 overflow-y-auto">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/10 mb-8" />
                <Content />
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </>
  );
};
