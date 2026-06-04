// src/components/ui/Button.jsx
const variants = {
  primary: 'bg-copper-500 text-white shadow-sm shadow-copper-700/20 hover:bg-copper-600 focus:ring-copper-500/20',
  secondary: 'bg-surface-500 text-ink-950 border border-ink-200 hover:bg-surface-100 focus:ring-copper-500/20',
  accent: 'bg-sapphire-500 text-white shadow-sm shadow-sapphire-700/20 hover:bg-sapphire-600 focus:ring-sapphire-500/20',
  danger: 'bg-copper-700 text-white hover:bg-copper-800 focus:ring-copper-600',
  ghost: 'text-ink-950 hover:text-ink-950 hover:bg-surface-100 focus:ring-copper-500/20',
};

const sizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
  xl: 'px-7 py-3.5 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50';
  const classes = [
    baseStyles,
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
