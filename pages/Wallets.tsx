


import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet as WalletIconDefault, X, CreditCard, Bitcoin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CurrencyCode, SUPPORTED_CURRENCIES, Wallet } from '../types';
import { useNavigate } from 'react-router-dom';
import { WalletIcon } from '../components/WalletIcon';

export const Wallets: React.FC = () => {
  const { state, addWallet, rates, globalCurrency } = useFinance();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  
  // New Wallet Form State
  const [newName, setNewName] = useState('');
  const [newCurrency, setNewCurrency] = useState<CurrencyCode>('USD');
  const [newType, setNewType] = useState<'FIAT' | 'CRYPTO'>('FIAT');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addWallet({
      name: newName,
      baseCurrency: newCurrency,
      type: newType,
      color: newType === 'CRYPTO' ? '#FF0099' : '#00F0FF',
      // Default icon based on type for simplicity in quick create, can be edited later
      icon: '' 
    });
    setIsAdding(false);
    setNewName('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-sans font-medium tracking-tight text-text-primary">
            Wallets
          </h1>
          <p className="text-text-secondary mt-2 font-mono text-sm">Manage your vaults and currencies</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsAdding(true)}>
          New Wallet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.wallets.map((wallet, idx) => (
          <motion.div
            key={wallet.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => navigate(`/wallet/${wallet.id}`)}
            className="group relative bg-bg-surface border border-border hover:border-border-strong transition-all duration-200 h-56 flex flex-col justify-between p-6 cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-bg-surface-highlight border border-border">
                <WalletIcon icon={wallet.icon} type={wallet.type} size={24} style={{ color: 'var(--color-accent)' }} />
              </div>
              <span className="font-mono text-xs text-text-secondary border border-border px-2 py-1 uppercase">
                {wallet.baseCurrency}
              </span>
            </div>

            <div>
               <h3 className="text-text-secondary font-sans text-sm mb-1">{wallet.name}</h3>
               <div className="text-2xl font-mono font-semibold text-text-primary tracking-tight">
                  {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
               </div>
               
               {/* Approximate Global Value */}
               {wallet.baseCurrency !== globalCurrency && rates[wallet.baseCurrency.toLowerCase()] && (
                 <div className="text-xs text-text-secondary font-mono mt-1">
                   ≈ {(wallet.balance / rates[wallet.baseCurrency.toLowerCase()]).toFixed(2)} {globalCurrency}
                 </div>
               )}
            </div>

            <div className="pt-4 border-t border-border">
                <Button size="sm" variant="secondary" className="w-full">Open</Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Wallet Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-bg-primary/90 backdrop-blur-sm"
              onClick={() => setIsAdding(false)}
            />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-bg-surface border border-border p-8 w-full max-w-md relative z-10"
            >
               <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
                 <X size={20} />
               </button>
               
               <h2 className="text-2xl font-sans font-semibold text-text-primary mb-6">Create Wallet</h2>
               
               <form onSubmit={handleCreate} className="space-y-6">
                 <div>
                   <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">Wallet Name</label>
                   <input 
                      type="text" 
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-bg-primary border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
                      placeholder="e.g. Travel Fund"
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">Type</label>
                      <select 
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as any)}
                        className="w-full bg-bg-primary border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
                      >
                        <option value="FIAT">Fiat</option>
                        <option value="CRYPTO">Crypto</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-mono text-text-secondary mb-2 uppercase">Currency</label>
                      <select 
                        value={newCurrency}
                        onChange={(e) => setNewCurrency(e.target.value as any)}
                        className="w-full bg-bg-primary border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
                      >
                        {SUPPORTED_CURRENCIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                   </div>
                 </div>

                 <Button type="submit" variant="primary" className="w-full h-12">
                   Create Wallet
                 </Button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};