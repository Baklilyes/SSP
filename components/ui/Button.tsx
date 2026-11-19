import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:pointer-events-none rounded-md';

    const variants = {
      primary: 'bg-[#ff7c28] hover:bg-[#ea580c] text-white shadow-md shadow-orange-500/25 font-semibold rounded-xl',
      secondary:
        'bg-surface hover:bg-surface-hover border border-border text-foreground shadow-sm rounded-xl',
      ghost: 'hover:bg-surface-hover text-foreground rounded-xl',
      icon: 'p-1.5 hover:bg-surface-hover text-muted hover:text-foreground rounded-lg',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1 gap-1.5',
      md: 'text-sm px-3.5 py-1.5 gap-2',
      lg: 'text-base px-4 py-2 gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={twMerge(
          clsx(
            baseStyles,
            variants[variant],
            variant !== 'icon' && sizes[size],
            className
          )
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
