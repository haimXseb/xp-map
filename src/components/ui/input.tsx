import React from 'react';

export function Input({
  value,
  onChange,
  placeholder,
  className = '',
  type = 'text',
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`px-4 py-2 rounded-2xl border border-white/25 bg-white/45 backdrop-blur-xl dark:bg-white/10 dark:border-white/10 ${className}`}
    />
  );
}

