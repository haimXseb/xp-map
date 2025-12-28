// React not needed for separator

export function Separator({ className = '' }: { className?: string }) {
  return <hr className={`border-t border-white/20 ${className}`} />;
}

