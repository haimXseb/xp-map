import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle2, Clock, Circle } from 'lucide-react';
import { ProjectData } from '../data/loadData';
import { PremiumCard, StatusBadge, SectionHeader, EmptyState, typography } from '../lib/design-system';
import { cn } from '@/lib/utils';

function StatusIcon({ status }: { status: string }) {
  const icons = {
    'done': <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    'in-progress': <Clock className="w-5 h-5 text-blue-500" />,
    'pending': <Circle className="w-5 h-5 text-gray-400" />,
  };
  return icons[status as keyof typeof icons] || <Circle className="w-5 h-5 text-gray-400" />;
}

export function CommanderFixHandoffTab({ data }: { data: ProjectData }) {
  const capabilities = data.capabilities || [];

  if (capabilities.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Fix & Handoff" subtitle="Capabilities with status and verify links" />
        <EmptyState
          title="No capabilities defined"
          description="Capabilities will appear here once they are added to the data"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Fix & Handoff" subtitle="Capabilities with status and verify links" />

      <div className="grid gap-4">
        {capabilities.map((capability) => (
          <PremiumCard key={capability.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4 flex-1">
                <div className={cn(
                  "p-2.5 rounded-xl",
                  capability.status === 'done' && "bg-emerald-500/10",
                  capability.status === 'in-progress' && "bg-blue-500/10",
                  capability.status === 'pending' && "bg-gray-500/10"
                )}>
                  <StatusIcon status={capability.status} />
                </div>
                <div className="flex-1">
                  <h3 className={typography.h4 + " mb-1"}>{capability.name}</h3>
                  {capability.description && (
                    <p className={typography.bodySmall + " text-muted-foreground"}>{capability.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge
                  status={
                    capability.status === 'done' ? 'success' :
                    capability.status === 'in-progress' ? 'info' :
                    'neutral'
                  }
                >
                  {capability.status}
                </StatusBadge>
                {capability.verifyLink && (
                  <Button
                    variant="secondary"
                    className="rounded-xl h-10 px-4"
                    onClick={() => window.open(capability.verifyLink, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Verify
                  </Button>
                )}
              </div>
            </div>
          </PremiumCard>
        ))}
      </div>
    </div>
  );
}
