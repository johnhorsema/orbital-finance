
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Radio, Settings, BarChart3, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { path: '/wallets', label: 'Wallets', icon: <Wallet size={20} /> },
  { path: '/analytics', label: 'Stats', icon: <BarChart3 size={20} /> },
  { path: '/recurring', label: 'Auto', icon: <Repeat size={20} /> },
  { path: '/settings', label: 'Config', icon: <Settings size={20} /> },
];

export const MobileNav: React.FC = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-surface/90 backdrop-blur-xl border-t border-white/10 z-[60] md:hidden px-6 pb-2">
      <div className="flex items-center justify-between h-full">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link to={item.path} key={item.path} className="flex flex-col items-center justify-center gap-1 w-full relative">
              {isActive && (
                <motion.div 
                  layoutId="mobileActiveTab"
                  className="absolute -top-[17px] w-12 h-1 bg-neon-green shadow-[0_0_10px_#ccff00]"
                />
              )}
              <div className={`transition-colors duration-200 ${isActive ? 'text-neon-green' : 'text-gray-500'}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-mono tracking-wide ${isActive ? 'text-white' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
