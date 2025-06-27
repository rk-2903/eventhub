import React from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500',
    secondary: 'bg-sky-500 text-white hover:bg-sky-600 focus-visible:ring-sky-500',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 focus-visible:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-500',
    ghost: 'bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500',
  };
  
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 h-8',
    md: 'text-sm px-4 py-2 h-10',
    lg: 'text-base px-5 py-2.5 h-12',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthClass} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
};

export default Button;