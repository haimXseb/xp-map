import React from 'react';

export function Badge({
  children,
  variant = 'secondary',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'secondary' | 'outline';
  className?: string;
}) {
  const baseClasses = 'px-2 py-1 rounded-2xl text-xs font-medium';
  const variants = {
    secondary: 'border border-white/25 bg-white/40 text-foreground dark:bg-white/10 dark:border-white/10',
    outline: 'border border-white/25 bg-transparent',
  };

  return <span className={`${baseClasses} ${variants[variant]} ${className}`}>{children}</span>;
}

