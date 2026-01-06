import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ProjectData } from '../data/loadData';
import { PremiumCard, StatusBadge, typography } from '../lib/design-system';
import { cn } from '@/lib/utils';
import { Target, AlertCircle, Award, ArrowRight } from 'lucide-react';

export function CommanderOverview({ data }: { data: ProjectData }) {
  const executionLog = data.executionLog;
  const currentPhase = executionLog?.metadata?.currentPhase || 'N/A';
  const currentGoal = executionLog?.metadata?.currentGoal || 'N/A';
  const currentPillar = data.currentPillar || data.pillars?.[0]?.name || 'N/A';

  // Calculate remaining stats
  const stats = useMemo(() => {
    let tasksRemaining = 0;
    let checksMissing = 0;
    let badgesRemaining = 0;

    // Count tasks from phases
    if (executionLog?.phases) {
      executionLog.phases.forEach(phase => {
        phase.epics?.forEach(epic => {
          epic.tasks?.forEach(task => {
            if (task.status !== 'done') tasksRemaining++;
          });
          if (epic.status !== 'done') tasksRemaining++;
        });
      });
    }

    // Count missing checks from components
    if (data.components) {
      data.components.forEach(comp => {
        comp.checks?.forEach(check => {
          if (check.status === 'missing' || check.status === 'fail') checksMissing++;
        });
      });
    }

    // Count locked/in-progress badges
    if (data.badges) {
      badgesRemaining = data.badges.filter(b => b.status !== 'unlocked').length;
    }

    return { tasksRemaining, checksMissing, badgesRemaining };
  }, [data, executionLog]);

  const statCards = [
    {
      label: 'Remaining Tasks',
      value: stats.tasksRemaining,
      icon: Target,
      color: 'info' as const,
    },
    {
      label: 'Checks Missing',
      value: stats.checksMissing,
      icon: AlertCircle,
      color: 'warning' as const,
    },
    {
      label: 'Badges Remaining',
      value: stats.badgesRemaining,
      icon: Award,
      color: 'neutral' as const,
    },
  ];

  return (
    <div className="grid gap-6">
      {/* Hero Section - Current Status */}
      <PremiumCard variant="elevated" className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className={typography.caption + " uppercase tracking-wider"}>Active</span>
            </div>
            <h1 className={typography.h1 + " mb-2"}>{currentPhase}</h1>
            <p className={typography.bodySmall + " text-muted-foreground max-w-2xl"}>{currentGoal}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge status="info">{currentPillar}</StatusBadge>
        </div>
      </PremiumCard>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <PremiumCard key={stat.label} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "p-2.5 rounded-xl",
                  stat.color === 'info' && "bg-blue-500/10",
                  stat.color === 'warning' && "bg-amber-500/10",
                  stat.color === 'neutral' && "bg-gray-500/10"
                )}>
                  <Icon className={cn(
                    "w-5 h-5",
                    stat.color === 'info' && "text-blue-600 dark:text-blue-400",
                    stat.color === 'warning' && "text-amber-600 dark:text-amber-400",
                    stat.color === 'neutral' && "text-gray-600 dark:text-gray-400"
                  )} />
                </div>
                <StatusBadge status={stat.color}>{stat.value}</StatusBadge>
              </div>
              <div className={typography.label + " text-muted-foreground"}>{stat.label}</div>
            </PremiumCard>
          );
        })}
      </div>

      {/* Quick Actions */}
      <PremiumCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={typography.h4 + " mb-1"}>Quick Actions</h3>
            <p className={typography.caption}>Navigate to key sections</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="default"
              className="rounded-xl px-6 h-11 font-medium"
              onClick={() => {
                const event = new CustomEvent('navigate-tab', { detail: 'commander-phases' });
                window.dispatchEvent(event);
              }}
            >
              View Phases
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              className="rounded-xl px-6 h-11 font-medium border border-white/25 bg-white/45 backdrop-blur-xl hover:bg-white/55"
              onClick={() => {
                const event = new CustomEvent('navigate-tab', { detail: 'commander-components' });
                window.dispatchEvent(event);
              }}
            >
              View Components
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
}
