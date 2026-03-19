import React, { ReactNode } from 'react';

interface CardProps {
  /**
   * Visual variant of the card
   * - 'default': Standard card with subtle background
   * - 'elevated': Card with shadow elevation
   * - 'bordered': Card with prominent border
   * - 'ghost': Minimal styling, transparent
   */
  variant?: 'default' | 'elevated' | 'bordered' | 'ghost';

  /**
   * Padding size
   * - 'none': No padding
   * - 'sm': Small padding (12px)
   * - 'md': Medium padding (20px) - default
   * - 'lg': Large padding (32px)
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * Card content
   */
  children: ReactNode;

  /**
   * Optional header title
   */
  title?: string;

  /**
   * Optional header actions (buttons, etc.)
   */
  headerActions?: ReactNode;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Click handler (makes card interactive)
   */
  onClick?: () => void;

  /**
   * Hover effect
   */
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  title,
  headerActions,
  className = '',
  onClick,
  hoverable = false
}) => {
  // Padding configurations
  const paddingConfig = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8'
  };

  // Variant styles
  const variantStyles = {
    default: `
      bg-slate-900/50 backdrop-blur-md
      border border-slate-800/60
      shadow-md
    `,
    elevated: `
      bg-slate-900/70 backdrop-blur-md
      border border-slate-800/60
      shadow-xl shadow-black/20
    `,
    bordered: `
      bg-slate-950/80 backdrop-blur-sm
      border-2 border-blue-600/30
      shadow-lg shadow-blue-900/10
    `,
    ghost: `
      bg-transparent
      border border-transparent
    `
  };

  // Hover effect
  const hoverStyles = (hoverable || onClick) ? `
    hover:shadow-xl hover:-translate-y-1
    hover:border-blue-600/50
    transition-all duration-300
    cursor-pointer
  ` : '';

  const styles = variantStyles[variant];
  const paddingClass = paddingConfig[padding];

  return (
    <div
      className={`
        ${styles}
        ${hoverStyles}
        rounded-xl
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Header */}
      {(title || headerActions) && (
        <div className={`flex items-center justify-between ${paddingClass} ${padding !== 'none' && children ? 'pb-0' : ''} border-b border-slate-800/60`}>
          {title && (
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          )}
          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={`${paddingClass} ${(title || headerActions) && padding !== 'none' ? 'pt-5' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
