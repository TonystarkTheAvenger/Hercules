import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'brand' | 'purple' | 'cyan';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-black text-white border-white/20',
    success: 'bg-white text-white border-app-border',
    warning: 'bg-white text-white border-app-border',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    brand: 'bg-white text-white border-app-border',
    purple: 'bg-white text-white border-app-border',
    cyan: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-1.5 py-0.5 font-medium tracking-tight',
    md: 'text-xs px-2 py-0.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[4px] border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
