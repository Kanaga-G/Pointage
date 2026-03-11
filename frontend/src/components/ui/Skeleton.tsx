import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'text', 
    width, 
    height, 
    animation = 'pulse',
    ...props 
  }, ref) => {
    const baseStyles = [
      'bg-secondary-200',
      animation === 'pulse' && 'animate-pulse',
      animation === 'wave' && 'animate-shimmer'
    ];

    const variants = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
      rounded: 'rounded-md'
    };

    const style: React.CSSProperties = {
      width: width || '100%',
      height: height || (variant === 'text' ? '1rem' : '40px'),
      ...props.style
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          className
        )}
        style={style}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Skeleton variants for common use cases
export const CardSkeleton = () => (
  <div className="bg-surface rounded-lg shadow-card border border-border p-6">
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="40%" height={20} />
          <Skeleton width="60%" height={16} />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton height={16} />
        <Skeleton height={16} />
        <Skeleton width="80%" height={16} />
      </div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="bg-surface rounded-lg shadow-card border border-border overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-secondary-50 border-b border-border">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3 text-left">
                <Skeleton height={16} width="60%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border last:border-b-0">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <Skeleton height={16} width={colIndex === 0 ? '40%' : '60%'} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const StatsCardSkeleton = () => (
  <div className="bg-surface rounded-lg shadow-card border border-border p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton width={40} height={40} variant="rounded" />
        <Skeleton width="60%" height={20} />
        <Skeleton width="40%" height={16} />
      </div>
      <Skeleton width={80} height={32} variant="rounded" />
    </div>
  </div>
);

export default Skeleton;
