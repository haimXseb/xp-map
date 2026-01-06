import { cn } from './utils';

// Typography Scale
export const typography = {
  h1: "text-3xl font-bold tracking-tight",
  h2: "text-2xl font-semibold tracking-tight",
  h3: "text-xl font-semibold",
  h4: "text-lg font-medium",
  body: "text-base",
  bodySmall: "text-sm",
  caption: "text-xs text-muted-foreground",
  label: "text-sm font-medium",
};

// Spacing Scale (consistent 4px base)
export const spacing = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

// Card Variants
export function PremiumCard({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "subtle";
}) {
  const variants = {
    default: "border border-white/25 bg-white/35 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
    elevated: "border border-white/30 bg-white/40 backdrop-blur-xl shadow-[0_12px_48px_rgba(0,0,0,0.16)]",
    subtle: "border border-white/15 bg-white/20 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
  };

  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-200",
        variants[variant],
        "dark:bg-white/8 dark:border-white/10",
        className
      )}
    >
      {children}
    </div>
  );
}

// Status Badge Variants
export function StatusBadge({
  status,
  children,
  className,
}: {
  status: "success" | "warning" | "error" | "info" | "neutral";
  children: React.ReactNode;
  className?: string;
}) {
  const variants = {
    success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
    error: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
    info: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
    neutral: "bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        variants[status],
        className
      )}
    >
      {children}
    </span>
  );
}

// Section Header
export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div>
        <h2 className={typography.h2}>{title}</h2>
        {subtitle && <p className={typography.caption + " mt-1"}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Empty State
export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className={typography.h4 + " mb-2"}>{title}</h3>
      {description && <p className={typography.bodySmall + " text-muted-foreground max-w-sm"}>{description}</p>}
    </div>
  );
}
