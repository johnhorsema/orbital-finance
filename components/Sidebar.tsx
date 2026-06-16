
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Radio, Settings, LogOut, BarChart3, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { path: '/wallets', label: 'Wallets', icon: <Wallet size={20} /> },
  { path: '/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  { path: '/recurring', label: 'Recurring', icon: <Repeat size={20} /> },
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
      className="hidden md:flex fixed left-0 top-0 h-full w-20 md:w-64 bg-bg-surface border-r border-border flex-col z-50"
    >
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-accent transform rotate-3 flex items-center justify-center">
            <div className="w-4 h-4 bg-bg-primary" />
        </div>
        <span className="text-xl font-semibold font-sans tracking-tight text-text-primary hidden md:block">
          ORBITAL
        </span>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link to={item.path} key={item.path}>
              <div className={`relative flex items-center gap-4 px-4 py-3 transition-colors group ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-highlight'}`}>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent"
                  />
                )}
                
                <span className="relative z-10">{item.icon}</span>
                <span className="relative z-10 font-mono text-sm hidden md:block">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent text-bg-primary font-semibold font-mono flex items-center justify-center">
                    {user?.username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                    <div className="text-xs text-text-secondary">Logged in as</div>
                    <div className="text-sm font-mono text-text-primary max-w-[100px] truncate">{user?.username}</div>
                </div>
            </div>
            <button 
                onClick={logout}
                className="text-text-secondary hover:text-negative transition-colors p-2"
                title="Logout"
            >
                <LogOut size={18} />
            </button>
        </div>
      </div>
    </motion.div>
  );
};
