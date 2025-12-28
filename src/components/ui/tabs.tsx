import React from 'react';

export function Tabs({ children }: { children: React.ReactNode; value?: string; onValueChange?: (v: string) => void }) {
  return <div>{children}</div>;
}

export function TabsList({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex gap-2 rounded-2xl border border-white/20 bg-white/35 backdrop-blur-xl dark:bg-white/8 dark:border-white/10 p-1 ${className}`}>{children}</div>;
}

export function TabsTrigger({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  value?: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-2xl transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, activeValue, className = '' }: { children: React.ReactNode; value: string; activeValue: string; className?: string }) {
  if (value !== activeValue) return null;
  return <div className={className}>{children}</div>;
}

