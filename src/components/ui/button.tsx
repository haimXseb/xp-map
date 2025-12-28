import React from 'react';

export function Button({
  children,
  onClick,
  variant = 'default',
  className = '',
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
  type?: 'button' | 'submit';
}) {
  const baseClasses = 'px-4 py-2 rounded-2xl font-medium transition-colors cursor-pointer';
  const variants = {
    default: 'bg-foreground text-background hover:bg-foreground/90',
    secondary: 'border border-white/25 bg-white/45 backdrop-blur-xl hover:bg-white/55 dark:bg-white/10 dark:border-white/10',
    outline: 'border border-white/25 bg-transparent hover:bg-white/10',
  };

  return (
    <button type={type} onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

