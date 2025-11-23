import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  ...props 
}) => {
  
  const baseStyles = "inline-flex items-center justify-center font-sans tracking-wide transition-all duration-200 border relative overflow-hidden group";
  
  const variants = {
    primary: "bg-white text-black border-white hover:bg-gray-200",
    secondary: "bg-surfaceHighlight text-white border-white/10 hover:border-white/30 hover:bg-surfaceHighlight/80",
    danger: "bg-red-900/20 text-red-500 border-red-500/50 hover:bg-red-900/40",
    ghost: "bg-transparent text-gray-400 hover:text-white border-transparent",
    neon: "bg-neon-green/10 text-neon-green border-neon-green/50 hover:bg-neon-green hover:text-black hover:border-neon-green shadow-[0_0_15px_rgba(204,255,0,0.1)] hover:shadow-[0_0_20px_rgba(204,255,0,0.5)]"
  };

  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-5 py-2 text-sm",
    lg: "px-8 py-3 text-base font-bold"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {/* Abstract decorative line for neon variant */}
      {variant === 'neon' && (
        <span className="absolute top-0 left-0 w-1 h-full bg-neon-green opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
      
      {icon && <span className="mr-2">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};