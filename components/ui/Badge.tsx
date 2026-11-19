import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'info' | 'layer';
  layerColor?: string;
}

export function Badge({
  className,
  variant = 'default',
  layerColor,
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide';

  const variants = {
    default: 'bg-surface-hover text-muted border border-border',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    info: 'bg-orange-500/10 text-[#ea580c] dark:text-[#ff7c28] border border-orange-500/20',
    layer: 'text-white font-semibold',
  };

  return (
    <span
      className={twMerge(
        clsx(baseStyles, variants[variant], className)
      )}
      style={variant === 'layer' && layerColor ? { backgroundColor: layerColor } : undefined}
      {...props}
    >
      {children}
    </span>
  );
}
