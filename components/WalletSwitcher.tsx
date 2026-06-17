


import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Layers, Plus, Wallet, X } from 'lucide-react';
import { WalletIcon } from './WalletIcon';

export const WalletSwitcher: React.FC = () => {
  const { state, addWallet, primaryColor } = useFinance();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Create Wallet Form State
  const [newName, setNewName] = useState('');
  const [newCurrency, setNewCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'BTC' | 'ETH' | 'SOL'>('USD');
  const [newType, setNewType] = useState<'FIAT' | 'CRYPTO'>('FIAT');

  // Determine current wallet based on URL
  const currentWalletId = location.pathname.startsWith('/wallet/') 
    ? location.pathname.split('/')[2] 
    : 'all';

  const currentWallet = state.wallets.find(w => w.id === currentWalletId);

  const handleSelect = (id: string) => {
    setIsOpen(false);
    if (id === 'all') {
      navigate('/');
    } else {
      navigate(`/wallet/${id}`);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addWallet({
      name: newName,
      baseCurrency: newCurrency,
      type: newType,
      color: primaryColor,
      icon: '' 
    });
    setIsCreating(false);
    setNewName('');
    setIsOpen(false);
  };

  return (
    <div className="relative z-50">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 bg-bg-surface-highlight border border-border px-4 py-2 hover:border-accent/50 transition-colors"
      >
        <div className="w-2 h-2" style={{ backgroundColor: currentWallet?.color || 'var(--color-text-primary)' }} />
        <span className="font-sans text-sm font-semibold text-text-primary tracking-wide">
          {currentWallet ? currentWallet.name : 'All Wallets'}
        </span>
        <ChevronDown size={14} className={`text-text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-bg-surface border border-border overflow-hidden"
          >
            <div className="p-2 space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
              <button
                onClick={() => handleSelect('all')}
                className={`w-full flex items-center gap-3 px-3 py-3 transition-colors text-left ${currentWalletId === 'all' ? 'bg-accent-subtle text-accent' : 'text-text-secondary hover:bg-bg-surface-highlight hover:text-text-primary'}`}
              >
                <div className="p-2 bg-bg-surface-highlight">
                   <Layers size={16} className="text-text-primary" />
                </div>
                <span className="font-mono text-xs">All Wallets</span>
              </button>

              <div className="h-px bg-border my-1" />

              {state.wallets.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                  className="px-3 py-6 text-center"
                >
                  <div className="p-3 bg-bg-surface-highlight border border-border inline-block mb-3">
                    <Wallet size={20} className="text-text-tertiary" />
                  </div>
                  <p className="font-sans text-xs text-text-secondary mb-1">
                    No wallets yet
                  </p>
                  <p className="font-sans text-[10px] text-text-tertiary mb-3">
                    Create your first wallet to get started
                  </p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsCreating(true);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-accent text-bg-primary font-sans text-xs font-medium hover:bg-accent-hover transition-colors"
                  >
                    <Plus size={12} />
                    Create Wallet
                  </button>
                </motion.div>
              ) : (
                state.wallets.map(wallet => (
                  <button
                    key={wallet.id}
                    onClick={() => handleSelect(wallet.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 transition-colors text-left ${currentWalletId === wallet.id ? 'bg-accent-subtle text-accent' : 'text-text-secondary hover:bg-bg-surface-highlight hover:text-text-primary'}`}
                  >
                    <div className="p-2 bg-bg-surface-highlight">
                      <WalletIcon icon={wallet.icon} type={wallet.type} size={16} style={{ color: wallet.color }} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold">{wallet.name}</span>
                      <span className="text-[10px] text-text-tertiary">{wallet.balance.toFixed(2)} {wallet.baseCurrency}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Wallet Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsCreating(false)}
            />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-bg-surface border border-border p-6 w-full max-w-md relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
               <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors">
                 <X size={20} />
               </button>
               
               <h2 className="text-xl font-sans font-semibold text-text-primary mb-6">Create Wallet</h2>
               
               <form onSubmit={handleCreate} className="space-y-4">
                 <div>
                   <label className="block text-xs font-mono text-text-tertiary mb-2 uppercase tracking-wide">Wallet Name</label>
                   <input 
                      type="text" 
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-bg-surface border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors placeholder:text-text-tertiary"
                      placeholder="e.g. Travel Fund"
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-mono text-text-tertiary mb-2 uppercase tracking-wide">Type</label>
                      <select 
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as 'FIAT' | 'CRYPTO')}
                        className="w-full bg-bg-surface border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
                      >
                        <option value="FIAT">Fiat</option>
                        <option value="CRYPTO">Crypto</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-mono text-text-tertiary mb-2 uppercase tracking-wide">Currency</label>
                      <select 
                        value={newCurrency}
                        onChange={(e) => setNewCurrency(e.target.value as 'USD' | 'EUR' | 'GBP' | 'BTC' | 'ETH' | 'SOL')}
                        className="w-full bg-bg-surface border border-border p-3 text-text-primary font-mono focus:border-accent focus:outline-none transition-colors"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="BTC">BTC</option>
                        <option value="ETH">ETH</option>
                        <option value="SOL">SOL</option>
                      </select>
                   </div>
                 </div>

                 <button type="submit" className="w-full h-12 bg-accent text-bg-primary font-sans text-sm font-medium hover:bg-accent-hover transition-colors">
                   Create Wallet
                 </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};