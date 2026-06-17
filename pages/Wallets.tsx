


import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet as WalletIconDefault, X, CreditCard, Bitcoin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CurrencyCode, SUPPORTED_CURRENCIES, Wallet } from '../types';
import { useNavigate } from 'react-router-dom';
import { WalletIcon } from '../components/WalletIcon';

export const Wallets: React.FC = () => {
  const { state, addWallet, rates, globalCurrency, primaryColor } = useFinance();
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
      color: primaryColor,
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

      {state.wallets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-full"
        >
          <div className="border border-border bg-bg-surface p-16 flex flex-col items-center justify-center min-h-[60vh]">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="p-6 bg-bg-surface-highlight border border-border mb-8"
            >
              <WalletIconDefault className="text-text-tertiary" size={48} />
            </motion.div>
            
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="text-center max-w-md"
            >
              <h3 className="text-2xl font-sans font-medium text-text-primary mb-3">
                No wallets yet
              </h3>
              <p className="text-text-secondary font-sans text-base leading-relaxed mb-8">
                Create your first wallet to start tracking balances across multiple currencies and assets. Add fiat accounts, crypto holdings, or custom currencies.
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <Button 
                variant="primary" 
                icon={<Plus size={16} />} 
                onClick={() => setIsAdding(true)}
                className="h-12 px-8"
              >
                Create Your First Wallet
              </Button>
            </motion.div>

            {/* Quick Tips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="mt-12 pt-8 border-t border-border w-full max-w-lg"
            >
              <p className="text-xs font-mono text-text-tertiary uppercase tracking-wide mb-4 text-center">
                Quick Start Guide
              </p>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-text-secondary font-mono text-xs mb-1">1. Create</div>
                  <div className="text-text-tertiary font-sans text-xs">Add a wallet</div>
                </div>
                <div>
                  <div className="text-text-secondary font-mono text-xs mb-1">2. Track</div>
                  <div className="text-text-tertiary font-sans text-xs">Monitor balances</div>
                </div>
                <div>
                  <div className="text-text-secondary font-mono text-xs mb-1">3. Analyze</div>
                  <div className="text-text-tertiary font-sans text-xs">View analytics</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.wallets.map((wallet, idx) => (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/wallet/${wallet.id}`)}
              className="group relative bg-bg-surface border border-border transition-all duration-200 h-56 flex flex-col justify-between p-6 cursor-pointer hover:brightness-105"
              style={{ borderColor: `${wallet.color}20` }}
            >
              <div className="flex justify-between items-start">
                <div className="p-3 bg-bg-surface-highlight border border-border" style={{ borderColor: `${wallet.color}30` }}>
                  <WalletIcon icon={wallet.icon} type={wallet.type} size={24} style={{ color: wallet.color }} />
                </div>
                <span className="font-mono text-xs text-text-secondary border border-border px-2 py-1 uppercase">
                  {wallet.baseCurrency}
                </span>
              </div>

              <div>
                 <h3 className="text-text-secondary font-sans text-sm mb-1">{wallet.name}</h3>
                 <div className="text-2xl font-mono font-semibold tracking-tight" style={{ color: wallet.color }}>
                    {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                 </div>
                 
                 {/* Approximate Global Value */}
                 {wallet.baseCurrency !== globalCurrency && rates[wallet.baseCurrency.toLowerCase()] && (
                   <div className="text-xs text-text-secondary font-mono mt-1">
                     ≈ {(wallet.balance / rates[wallet.baseCurrency.toLowerCase()]).toFixed(2)} {globalCurrency}
                   </div>
                 )}
              </div>

              <div className="pt-4 border-t border-border" style={{ borderColor: `${wallet.color}20` }}>
                  <Button size="sm" variant="secondary" className="w-full">Open</Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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