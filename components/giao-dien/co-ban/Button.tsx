import React, { ReactNode } from 'react';

interface ButtonProps {
  /**
   * Visual variant of the button
   * - 'primary': Navy blue background (default)
   * - 'secondary': Gray background
   * - 'outline': Transparent with navy border
   * - 'ghost': Transparent with hover effect
   * - 'danger': Red background for destructive actions
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

  /**
   * Size of the button
   * - 'sm': Small (36px height)
   * - 'md': Medium (44px height) - default
   * - 'lg': Large (52px height)
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Button content
   */
  children: ReactNode;

  /**
   * Optional icon (FontAwesome class or React element)
   */
  icon?: ReactNode;

  /**
   * Position of the icon
   */
  iconPosition?: 'left' | 'right';

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Full width button
   */
  fullWidth?: boolean;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * Button type
   */
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button'
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'px-3 py-2',
      text: 'text-sm',
      height: 'h-9',
      iconSize: 'text-sm'
    },
    md: {
      padding: 'px-4 py-2.5',
      text: 'text-base',
      height: 'h-11',
      iconSize: 'text-base'
    },
    lg: {
      padding: 'px-6 py-3',
      text: 'text-lg',
      height: 'h-13',
      iconSize: 'text-lg'
    }
  };

  // Variant styles
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700
      hover:from-blue-500 hover:to-blue-600
      active:from-blue-700 active:to-blue-800
      text-white shadow-lg shadow-blue-900/20
      hover:shadow-blue-500/30 hover:scale-102
      disabled:from-gray-600 disabled:to-gray-700
      disabled:shadow-none disabled:cursor-not-allowed
      disabled:opacity-50
    `,
    secondary: `
      bg-gray-700 hover:bg-gray-600
      active:bg-gray-800
      text-white shadow-md
      hover:shadow-lg hover:scale-102
      disabled:bg-gray-800 disabled:cursor-not-allowed
      disabled:opacity-50
    `,
    outline: `
      bg-transparent border-2 border-blue-600
      hover:bg-blue-600/10 hover:border-blue-500
      active:bg-blue-600/20
      text-blue-600 hover:text-blue-500
      disabled:border-gray-600 disabled:text-gray-600
      disabled:cursor-not-allowed disabled:opacity-50
    `,
    ghost: `
      bg-transparent hover:bg-slate-800/50
      active:bg-slate-800
      text-slate-300 hover:text-white
      disabled:text-gray-600 disabled:cursor-not-allowed
      disabled:opacity-50
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700
      hover:from-red-500 hover:to-red-600
      active:from-red-700 active:to-red-800
      text-white shadow-lg shadow-red-900/20
      hover:shadow-red-500/30 hover:scale-102
      disabled:from-gray-600 disabled:to-gray-700
      disabled:shadow-none disabled:cursor-not-allowed
      disabled:opacity-50
    `
  };

  const config = sizeConfig[size];
  const styles = variantStyles[variant];

  // Loading spinner
  const LoadingSpinner = () => (
    <div className={`animate-spin rounded-full border-2 border-white/30 border-t-white ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />
  );

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={`
        ${config.padding}
        ${config.text}
        ${config.height}
        ${styles}
        ${fullWidth ? 'w-full' : ''}
        flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      aria-busy={loading}
      aria-disabled={disabled || loading}
    >
      {loading ? (
        <>
          <LoadingSpinner />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={config.iconSize}>{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === 'right' && (
            <span className={config.iconSize}>{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
