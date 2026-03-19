import React from 'react';
import { useDeviceDetection } from './useDeviceDetection';

interface ResponsiveButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
}

const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  fullWidth = false,
  icon,
  loading = false
}) => {
  const device = useDeviceDetection();
  
  // Base button classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl',
    secondary: 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600',
    outline: 'border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white',
    ghost: 'text-slate-300 hover:text-white hover:bg-slate-700'
  };
  
  // Size classes - responsive
  const sizeClasses = {
    sm: device.isMobile ? 'px-4 py-3 text-sm min-h-[48px]' : 'px-3 py-2 text-sm',
    md: device.isMobile ? 'px-6 py-4 text-base min-h-[52px]' : 'px-4 py-2 text-base',
    lg: device.isMobile ? 'px-8 py-5 text-lg min-h-[56px]' : 'px-6 py-3 text-lg'
  };
  
  // Mobile-specific enhancements  
  const mobileClasses = device.isMobile ? 'active:scale-95 touch-manipulation' : 'hover:scale-105';
  
  // Full width handling
  const widthClass = fullWidth ? 'w-full' : '';
  
  const buttonClass = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${mobileClasses}
    ${widthClass}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClass}
    >
      {loading && (
        <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {!loading && icon && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
    </button>
  );
};

export default ResponsiveButton;