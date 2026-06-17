
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, BarChart3, Settings, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/wallets', label: 'Wallets', icon: Wallet },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/recurring', label: 'Recurring', icon: Repeat },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const MobileNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-surface/95 backdrop-blur-xl border-t border-border z-[60] md:hidden safe-area-pb">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              to={item.path}
              key={item.path}
              className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] relative transition-colors duration-150"
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent"
                />
              )}
              <div
                className={`flex items-center justify-center w-11 h-11 rounded transition-colors duration-150 ${
                  isActive ? 'text-accent' : 'text-text-secondary'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span
                className={`text-[10px] font-mono tracking-wide leading-none ${
                  isActive ? 'text-text-primary' : 'text-text-tertiary'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
