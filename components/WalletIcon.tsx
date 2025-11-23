
import React from 'react';
import { 
  Wallet, CreditCard, Banknote, Landmark, PiggyBank, 
  Bitcoin, Coins, Gem, Rocket, Briefcase, Lock, Globe,
  Smartphone, Watch, Zap, Laptop, Car, Home, Shield, 
  ShoppingBag, Plane
} from 'lucide-react';

export const ICON_OPTIONS = [
  'Wallet', 'CreditCard', 'Banknote', 'Landmark', 'PiggyBank',
  'Bitcoin', 'Coins', 'Gem', 'Rocket', 'Briefcase', 'Lock', 'Globe',
  'Smartphone', 'Watch', 'Zap', 'Laptop', 'Car', 'Home', 'Shield',
  'ShoppingBag', 'Plane'
];

export const ICON_MAP: Record<string, React.ElementType> = {
  Wallet, CreditCard, Banknote, Landmark, PiggyBank,
  Bitcoin, Coins, Gem, Rocket, Briefcase, Lock, Globe,
  Smartphone, Watch, Zap, Laptop, Car, Home, Shield,
  ShoppingBag, Plane
};

interface WalletIconProps {
  icon?: string;
  type?: 'FIAT' | 'CRYPTO';
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const WalletIcon: React.FC<WalletIconProps> = ({ icon, type, size = 24, className, style }) => {
  const IconComponent = (icon && ICON_MAP[icon]) 
    ? ICON_MAP[icon] 
    : (type === 'CRYPTO' ? Bitcoin : CreditCard);

  return <IconComponent size={size} className={className} style={style} />;
};
