


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
        className="flex items-center gap-3 bg-surfaceHighlight border border-content/10 px-4 py-2 rounded-full hover:border-neon-green/50 transition-colors shadow-lg shadow-black/20"
      >
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentWallet?.color || 'rgb(var(--color-content))' }} />
        <span className="font-sans text-sm font-bold text-content tracking-wide">
          {currentWallet ? currentWallet.name : 'All Wallets'}
        </span>
        <ChevronDown size={14} className={`text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-surface border border-content/10 rounded-xl overflow-hidden shadow-2xl shadow-black/30"
          >
            <div className="p-2 space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
              <button
                onClick={() => handleSelect('all')}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left ${currentWalletId === 'all' ? 'bg-content/10 text-content' : 'text-muted hover:bg-content/5 hover:text-content'}`}
              >
                <div className="p-2 bg-field rounded-md border border-content/5">
                   <Layers size={16} className="text-content" />
                </div>
                <span className="font-mono text-xs">All Wallets</span>
              </button>

              <div className="h-px bg-content/5 my-1" />

              {state.wallets.map(wallet => (
                <button
                  key={wallet.id}
                  onClick={() => handleSelect(wallet.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left ${currentWalletId === wallet.id ? 'bg-content/10 text-content' : 'text-muted hover:bg-content/5 hover:text-content'}`}
                >
                  <div className="p-2 rounded-md bg-content/5 text-content">
                    <WalletIcon icon={wallet.icon} type={wallet.type} size={16} style={{ color: wallet.color }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-bold">{wallet.name}</span>
                    <span className="text-[10px] text-muted">{wallet.balance.toFixed(2)} {wallet.baseCurrency}</span>
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