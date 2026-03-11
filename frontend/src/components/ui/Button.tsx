import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    icon, 
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = [
      'inline-flex items-center justify-center',
      'font-medium transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'relative overflow-hidden'
    ];

    const variants = {
      primary: [
        'bg-primary text-white hover:bg-primary-dark',
        'focus-visible:ring-primary',
        'shadow-sm hover:shadow-md'
      ],
      secondary: [
        'bg-surface border border-border text-text-primary',
        'hover:bg-secondary-50 hover:border-secondary-300',
        'focus-visible:ring-secondary'
      ],
      danger: [
        'bg-danger text-white hover:bg-danger-dark',
        'focus-visible:ring-danger',
        'shadow-sm hover:shadow-md'
      ],
      ghost: [
        'text-text-secondary hover:text-text-primary hover:bg-secondary-50',
        'focus-visible:ring-secondary'
      ]
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-6 py-3 text-base rounded-lg'
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!loading && icon && (
          <span className="mr-2">{icon}</span>
        )}
        
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
