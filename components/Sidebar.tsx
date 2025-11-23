
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Radio, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { path: '/wallets', label: 'Wallets', icon: <Wallet size={20} /> },
  { path: '/exchange', label: 'Exchange Rates', icon: <Radio size={20} /> },
  { path: '/settings', label: 'Data & Settings', icon: <Settings size={20} /> },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useFinance();

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "circOut" }}
      className="hidden md:flex fixed left-0 top-0 h-full w-20 md:w-64 bg-surface border-r border-white/5 flex-col z-50"
    >
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-neon-green rounded-none transform rotate-3 flex items-center justify-center">
            <div className="w-4 h-4 bg-black" />
        </div>
        <span className="text-xl font-bold font-sans tracking-tighter text-white hidden md:block">
          ORBITAL
        </span>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link to={item.path} key={item.path}>
              <div className={`relative flex items-center gap-4 px-4 py-3 transition-colors group ${isActive ? 'text-neon-green' : 'text-gray-400 hover:text-white'}`}>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-neon-green shadow-[0_0_10px_#ccff00]"
                  />
                )}
                {/* Background hover effect */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm" />
                
                <span className="relative z-10">{item.icon}</span>
                <span className="relative z-10 font-mono text-sm hidden md:block">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 opacity-80">
                <div className="w-8 h-8 bg-neon-green text-black font-bold font-mono flex items-center justify-center rounded-sm">
                    {user?.username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                    <div className="text-xs text-gray-400">Logged in as</div>
                    <div className="text-sm font-mono text-white max-w-[100px] truncate">{user?.username}</div>
                </div>
            </div>
            <button 
                onClick={logout}
                className="text-gray-500 hover:text-red-500 transition-colors p-2"
                title="Logout"
            >
                <LogOut size={18} />
            </button>
        </div>
      </div>
    </motion.div>
  );
};
