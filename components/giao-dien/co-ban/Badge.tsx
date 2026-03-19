import React from 'react';

interface BadgeProps {
  /**
   * Visual variant based on semantic meaning
   * - 'success': Green - for completed, approved states
   * - 'warning': Amber - for pending, cautionary states
   * - 'error': Red - for failed, error states
   * - 'info': Blue - for informational states
   * - 'neutral': Gray - for default states
   */
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';

  /**
   * Size of the badge
   * - 'sm': Small (text-xs, py-0.5 px-2)
   * - 'md': Medium (text-sm, py-1 px-2.5) - default
   */
  size?: 'sm' | 'md';

  /**
   * Badge text content
   */
  children: React.ReactNode;

  /**
   * Optional icon (FontAwesome class or React element)
   */
  icon?: React.ReactNode;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Dot indicator instead of text
   */
  dot?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  icon,
  className = '',
  dot = false
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      text: 'text-xs',
      padding: 'py-0.5 px-2',
      dotSize: 'w-1.5 h-1.5',
      gap: 'gap-1'
    },
    md: {
      text: 'text-sm',
      padding: 'py-1 px-2.5',
      dotSize: 'w-2 h-2',
      gap: 'gap-1.5'
    }
  };

  // Variant styles
  const variantStyles = {
    success: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-500'
    },
    warning: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500'
    },
    error: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/30',
      dot: 'bg-red-500'
    },
    info: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      dot: 'bg-blue-500'
    },
    neutral: {
      bg: 'bg-slate-700/50',
      text: 'text-slate-300',
      border: 'border-slate-600/30',
      dot: 'bg-slate-400'
    }
  };

  const config = sizeConfig[size];
  const styles = variantStyles[variant];

  // Dot-only badge
  if (dot) {
    return (
      <span
        className={`
          ${config.dotSize}
          ${styles.dot}
          rounded-full
          inline-block
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        role="status"
        aria-label={typeof children === 'string' ? children : variant}
      />
    );
  }

  // Regular badge with text
  return (
    <span
      className={`
        ${config.text}
        ${config.padding}
        ${styles.bg}
        ${styles.text}
        ${styles.border}
        inline-flex items-center
        ${config.gap}
        font-medium
        rounded-full
        border
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      role="status"
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
