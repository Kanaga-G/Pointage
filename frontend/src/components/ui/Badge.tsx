import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'md', children, ...props }, ref) => {
    const baseStyles = [
      'inline-flex items-center justify-center',
      'font-medium rounded-full',
      'transition-all duration-200'
    ];

    const variants = {
      success: [
        'bg-success-50 text-success-700 border border-success-200',
        'ring-1 ring-success-500/20'
      ],
      danger: [
        'bg-danger-50 text-danger-700 border border-danger-200',
        'ring-1 ring-danger-500/20'
      ],
      warning: [
        'bg-warning-50 text-warning-700 border border-warning-200',
        'ring-1 ring-warning-500/20'
      ],
      info: [
        'bg-info-50 text-info-700 border border-info-200',
        'ring-1 ring-info-500/20'
      ],
      neutral: [
        'bg-secondary-100 text-text-secondary border border-secondary-200',
        'ring-1 ring-secondary-500/20'
      ]
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm'
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
