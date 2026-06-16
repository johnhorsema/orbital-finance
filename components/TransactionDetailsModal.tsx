


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Calendar, Tag, CreditCard, Save, Edit2, ArrowLeft, Check } from 'lucide-react';
import { Transaction, Wallet, SUPPORTED_CURRENCIES, CurrencyCode } from '../types';
import { Button } from './ui/Button';
import { Drawer } from 'vaul';
import { useFinance } from '../context/FinanceContext';

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value, valueColor }) => (
  <div className="flex items-center gap-3">
    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-bg-surface-highlight">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-0.5">{label}</div>
      <div 
        className="text-sm font-mono text-text-primary truncate"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </div>
    </div>
  </div>
);

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Initialize drawer as open when component mounts
  useEffect(() => {
    setIsDrawerOpen(true);
  }, []);
  
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
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div
            key="view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Type Badge + Amount Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider ${
                  transaction.type === 'INCOME' 
                    ? 'bg-positive/10 text-positive border border-positive/20' 
                    : 'bg-negative/10 text-negative border border-negative/20'
                }`}>
                  <span className={`w-1.5 h-1.5 ${
                    transaction.type === 'INCOME' ? 'bg-positive' : 'bg-negative'
                  }`} />
                  {transaction.type}
                </span>
              </div>
              
              <h2 className="text-xl font-sans text-text-primary leading-snug mb-3 break-words">
                {transaction.description}
              </h2>
              
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-bold text-text-primary tracking-tight">
                  {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-lg font-mono text-text-tertiary">{transaction.currency}</span>
              </div>
              
              {transaction.convertedAmount !== transaction.amount && (
                <div className="text-sm text-text-tertiary font-mono mt-1.5 flex items-center gap-1.5">
                  <span className="text-text-secondary">≈</span>
                  {transaction.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-text-secondary">{wallet?.baseCurrency || 'Base'}</span>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="border-t border-border pt-6 space-y-5">
              <DetailRow icon={<Calendar size={16} />} label="Date" value={transaction.date} />
              <DetailRow icon={<Tag size={16} />} label="Category" value={transaction.category} />
              {wallet && (
                <DetailRow 
                  icon={<CreditCard size={16} />} 
                  label="Wallet" 
                  value={wallet.name}
                  valueColor={wallet.color}
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1" 
                icon={<Edit2 size={14} />}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
              <Button 
                variant="danger" 
                className="flex-1" 
                icon={<Trash2 size={14} />}
                onClick={() => {
                  onDelete(transaction.id);
                  onClose();
                }}
              >
                Delete
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-5"
          >
             {/* Edit Header */}
             <div className="flex items-center gap-3 mb-6">
                 <button 
                   onClick={() => setIsEditing(false)} 
                   className="p-2 hover:bg-bg-surface-highlight transition-colors text-text-secondary hover:text-text-primary"
                   aria-label="Back to view mode"
                 >
                     <ArrowLeft size={18} />
                 </button>
                 <h3 className="text-base font-sans font-semibold text-text-primary">Edit Transaction</h3>
             </div>

             {/* Type Toggle */}
             <div className="grid grid-cols-2 gap-2">
                 <button
                   type="button"
                   onClick={() => setType('EXPENSE')}
                   className={`py-2.5 text-xs font-mono font-bold uppercase tracking-wider border transition-all duration-150 ${
                     type === 'EXPENSE' 
                       ? 'border-negative text-negative bg-negative/10' 
                       : 'border-border text-text-tertiary hover:border-border-strong'
                   }`}
                 >
                   Expense
                 </button>
                 <button
                   type="button"
                   onClick={() => setType('INCOME')}
                   className={`py-2.5 text-xs font-mono font-bold uppercase tracking-wider border transition-all duration-150 ${
                     type === 'INCOME' 
                       ? 'border-positive text-positive bg-positive/10' 
                       : 'border-border text-text-tertiary hover:border-border-strong'
                   }`}
                 >
                   Income
                 </button>
             </div>

             {/* Amount + Currency */}
             <div>
                <label className="block text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">Amount</label>
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex-1 bg-bg-surface border border-border px-3 py-2.5 text-text-primary font-mono text-sm focus:border-accent focus:outline-none transition-colors"
                        step="0.01"
                    />
                    <select 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                        className="bg-bg-surface border border-border px-3 py-2.5 text-text-primary font-mono text-sm focus:border-accent focus:outline-none transition-colors cursor-pointer"
                    >
                        {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
             </div>

             {/* Description */}
             <div>
                <label className="block text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">Description</label>
                <input 
                    type="text" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-bg-surface border border-border px-3 py-2.5 text-text-primary font-mono text-sm focus:border-accent focus:outline-none transition-colors"
                    placeholder="Transaction description"
                />
             </div>

             {/* Category */}
             <div>
                <label className="block text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">Category</label>
                <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-bg-surface border border-border px-3 py-2.5 text-text-primary font-mono text-sm focus:border-accent focus:outline-none transition-colors cursor-pointer"
                >
                    {state.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>

             {/* Date */}
             <div>
                <label className="block text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">Date</label>
                <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-bg-surface border border-border px-3 py-2.5 text-text-primary font-mono text-sm focus:border-accent focus:outline-none transition-colors"
                />
             </div>

             {/* Save Button */}
             <Button 
               onClick={handleSave} 
               variant="primary" 
               className="w-full mt-6" 
               icon={<Check size={14} />}
             >
                 Save Changes
             </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Desktop Modal */}
      <div className="hidden md:flex fixed inset-0 z-[200] items-center justify-center p-4">
          <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute inset-0 bg-bg-primary/90 backdrop-blur-md"
              onClick={onClose}
          />
          <motion.div 
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-bg-surface border border-border w-full max-w-md relative z-[201]"
          >
              <div className="p-8">
                <button 
                  onClick={onClose} 
                  className="absolute top-5 right-5 p-1.5 text-text-tertiary hover:text-text-primary hover:bg-bg-surface-highlight transition-colors"
                  aria-label="Close modal"
                >
                    <X size={20} />
                </button>
                <Content />
              </div>
          </motion.div>
      </div>

      {/* Mobile Drawer */}
      <div className="md:hidden">
        <Drawer.Root open={isDrawerOpen} onOpenChange={(open) => {
          if (!open) {
            setIsDrawerOpen(false);
            onClose();
          }
        }}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-bg-primary/90 backdrop-blur-md z-[150]" />
            <Drawer.Content className="bg-bg-surface border-t border-border flex flex-col fixed bottom-0 left-0 right-0 z-[151] outline-none max-h-[85vh]">
              <div className="p-6 pb-8 flex-1 overflow-y-auto">
                <div className="mx-auto w-10 h-1 flex-shrink-0 bg-bg-surface-highlight mb-8" />
                <Drawer.Title className="sr-only">Transaction Details</Drawer.Title>
                <Content />
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </>
  );
};