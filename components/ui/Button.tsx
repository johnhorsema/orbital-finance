
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
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
  
  const baseStyles = "inline-flex items-center justify-center font-sans tracking-wide transition-all duration-150 ease-out-expo border relative";
  
  const variants = {
    primary: "bg-accent text-bg-primary border-accent hover:bg-accent-hover active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
    secondary: "bg-transparent text-text-primary border-border hover:border-border-strong hover:bg-bg-surface-highlight active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
    danger: "bg-transparent text-negative border-negative hover:bg-negative/10 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-negative focus-visible:outline-offset-2",
    ghost: "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-surface active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base font-semibold"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};