import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[28px] border border-white/25 bg-white/35 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] dark:bg-white/8 dark:border-white/10 ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`pb-2 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-lg font-semibold ${className}`}>{children}</div>;
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`${className}`}>{children}</div>;
}

