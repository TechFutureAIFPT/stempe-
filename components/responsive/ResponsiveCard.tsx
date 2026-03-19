import React from 'react';
import { useDeviceDetection } from './useDeviceDetection';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  onClick?: () => void;
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  actions,
  elevation = 'md',
  padding = 'md',
  clickable = false,
  onClick
}) => {
  const device = useDeviceDetection();
  
  // Base card classes
  const baseClasses = 'bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm transition-all duration-200';
  
  // Elevation classes
  const elevationClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-lg shadow-slate-900/20',
    lg: 'shadow-xl shadow-slate-900/30'
  };
  
  // Padding classes - responsive  
  const paddingClasses = {
    sm: device.isMobile ? 'p-3' : 'p-2',
    md: device.isMobile ? 'p-4' : 'p-4',
    lg: device.isMobile ? 'p-6' : 'p-6'
  };
  
  // Responsive border radius
  const borderRadius = device.isMobile ? 'rounded-xl' : 'rounded-lg';
  
  // Clickable enhancements
  const clickableClasses = clickable 
    ? device.isMobile 
      ? 'cursor-pointer active:scale-98 active:bg-slate-700/50'
      : 'cursor-pointer hover:scale-102 hover:bg-slate-700/50 hover:border-slate-600/50'
    : '';
  
  const cardClass = `
    ${baseClasses}
    ${elevationClasses[elevation]}
    ${paddingClasses[padding]}
    ${borderRadius}
    ${clickableClasses}
    ${className}
  `.trim();

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={cardClass}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (clickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Card Header */}
      {(title || subtitle || actions) && (
        <div className={`flex items-start justify-between ${children ? 'mb-4' : ''}`}>
          <div className="flex-1">
            {title && (
              <h3 className={`font-semibold text-white ${
                device.isMobile ? 'text-lg' : 'text-xl'
              }`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`text-slate-400 ${
                device.isMobile ? 'text-sm mt-1' : 'text-base mt-2'
              }`}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex-shrink-0 ml-4">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Card Content */}
      {children && (
        <div className="text-slate-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default ResponsiveCard;