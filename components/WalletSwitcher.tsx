


import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Layers } from 'lucide-react';
import { WalletIcon } from './WalletIcon';

export const WalletSwitcher: React.FC = () => {
  const { state } = useFinance();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

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

              {state.wallets.map(wallet => (
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
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};