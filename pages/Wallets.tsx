


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
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-sans font-light text-content tracking-tighter">
            DIGITAL <span className="text-neon-purple font-bold">VAULT</span>
          </h1>
        </div>
        <Button variant="neon" icon={<Plus size={18} />} onClick={() => setIsAdding(true)}>
          New Wallet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {state.wallets.map((wallet, idx) => (
          <motion.div
            key={wallet.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => navigate(`/wallet/${wallet.id}`)}
            className="group relative bg-surface border border-content/5 hover:border-content/20 transition-all duration-300 h-64 flex flex-col justify-between p-6 overflow-hidden cursor-pointer"
          >
            {/* Background Glow */}
            <div 
              className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-20"
              style={{ backgroundColor: wallet.color }} 
            />
            
            <div className="flex justify-between items-start z-10">
              <div className="p-3 bg-content/5 rounded-sm backdrop-blur-sm border border-content/5 text-content">
                <WalletIcon icon={wallet.icon} type={wallet.type} size={24} style={{ color: wallet.color }} />
              </div>
              <span className="font-mono text-xs text-muted border border-content/10 px-2 py-1 rounded-sm uppercase">
                {wallet.baseCurrency}
              </span>
            </div>

            <div className="z-10">
               <h3 className="text-muted font-sans text-sm mb-1">{wallet.name}</h3>
               <div className="text-3xl font-mono font-bold text-content tracking-tighter">
                  {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
               </div>
               
               {/* Approximate Global Value */}
               {wallet.baseCurrency !== globalCurrency && rates[wallet.baseCurrency.toLowerCase()] && (
                 <div className="text-xs text-muted font-mono mt-1">
                   ≈ {(wallet.balance / rates[wallet.baseCurrency.toLowerCase()]).toFixed(2)} {globalCurrency}
                 </div>
               )}
            </div>

            <div className="z-10 pt-4 border-t border-content/5 flex gap-2">
                <Button size="sm" variant="secondary" className="w-full">Open Vault</Button>
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsAdding(false)}
            />
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-surface border border-content/10 p-8 w-full max-w-md relative z-10 shadow-2xl shadow-neon-purple/10"
            >
               <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-muted hover:text-content">
                 <X size={24} />
               </button>
               
               <h2 className="text-2xl font-sans text-content mb-6">Initialize Wallet</h2>
               
               <form onSubmit={handleCreate} className="space-y-6">
                 <div>
                   <label className="block text-xs font-mono text-muted mb-2 uppercase">Wallet Name</label>
                   <input 
                      type="text" 
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-purple focus:outline-none transition-colors"
                      placeholder="e.g. Secret Swiss Bank"
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-mono text-muted mb-2 uppercase">Type</label>
                      <select 
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as any)}
                        className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-purple focus:outline-none"
                      >
                        <option value="FIAT">Fiat</option>
                        <option value="CRYPTO">Crypto</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-mono text-muted mb-2 uppercase">Currency</label>
                      <select 
                        value={newCurrency}
                        onChange={(e) => setNewCurrency(e.target.value as any)}
                        className="w-full bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-purple focus:outline-none"
                      >
                        {SUPPORTED_CURRENCIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                   </div>
                 </div>

                 <Button type="submit" variant="neon" className="w-full h-12">
                   Create Interface
                 </Button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};