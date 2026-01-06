import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, CheckCircle2, XCircle, AlertCircle, MinusCircle } from 'lucide-react';
import { ProjectData, Component, ComponentCheck } from '../data/loadData';
import { PremiumCard, StatusBadge, SectionHeader, EmptyState, typography } from '../lib/design-system';
import { cn } from '@/lib/utils';

function CheckStatusIcon({ status }: { status: string }) {
  const icons = {
    'pass': <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    'fail': <XCircle className="w-4 h-4 text-red-500" />,
    'warning': <AlertCircle className="w-4 h-4 text-amber-500" />,
    'missing': <MinusCircle className="w-4 h-4 text-gray-400" />,
  };
  return icons[status as keyof typeof icons] || <MinusCircle className="w-4 h-4 text-gray-400" />;
}

function ComponentDrawer({ component, onClose }: { component: Component; onClose: () => void }) {
  const checksByGroup = component.checks.reduce((acc, check) => {
    if (!acc[check.group]) acc[check.group] = [];
    acc[check.group].push(check);
    return acc;
  }, {} as Record<string, ComponentCheck[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <PremiumCard variant="elevated" className="w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className={typography.h2}>{component.name}</h2>
            <p className={typography.caption + " mt-1"}>{component.type}</p>
          </div>
          <Button
            variant="secondary"
            className="rounded-full w-9 h-9 p-0"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <StatusBadge status={component.status === 'unlocked' ? 'success' : component.status === 'in-progress' ? 'info' : 'neutral'}>
                {component.status}
              </StatusBadge>
            </div>
            {Object.entries(checksByGroup).map(([group, checks]) => (
              <div key={group}>
                <h3 className={typography.h4 + " mb-3"}>{group}</h3>
                <div className="space-y-2">
                  {checks.map((check) => (
                    <div
                      key={check.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CheckStatusIcon status={check.status} />
                        <span className={typography.bodySmall}>{check.name}</span>
                      </div>
                      {check.evidence && (
                        <a
                          href={check.evidence}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={typography.caption + " hover:text-foreground transition-colors"}
                        >
                          View Evidence
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {component.checks.some(c => c.testSuggestions?.length) && (
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <h3 className={typography.h4 + " mb-3 text-blue-700 dark:text-blue-400"}>Test Suggestions</h3>
                <ul className="list-disc list-inside space-y-1">
                  {component.checks.flatMap(c => c.testSuggestions || []).map((suggestion, idx) => (
                    <li key={idx} className={typography.bodySmall + " text-muted-foreground"}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>
      </PremiumCard>
    </div>
  );
}

export function CommanderComponentsTab({ data }: { data: ProjectData }) {
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const components = data.components || [];

  // Get unique check groups
  const checkGroups = Array.from(
    new Set(components.flatMap(c => c.checks.map(ch => ch.group)))
  );

  if (components.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Components & Checks" subtitle="Matrix view: components × check groups" />
        <EmptyState
          title="No components defined"
          description="Components will appear here once they are added to the data"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Components & Checks"
        subtitle="Matrix view: components × check groups"
      />

      <PremiumCard className="overflow-hidden">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-white/20">
                <tr>
                  <th className={cn(
                    "text-right p-4 font-semibold sticky left-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl",
                    "border-r border-white/20 min-w-[200px]"
                  )}>
                    Component
                  </th>
                  {checkGroups.map((group) => (
                    <th key={group} className="text-center p-4 font-semibold min-w-[140px]">
                      {group}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {components.map((component, rowIdx) => {
                  const checksByGroup = component.checks.reduce((acc, check) => {
                    if (!acc[check.group]) acc[check.group] = [];
                    acc[check.group].push(check);
                    return acc;
                  }, {} as Record<string, ComponentCheck[]>);

                  return (
                    <tr
                      key={component.id}
                      className={cn(
                        "border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer",
                        rowIdx % 2 === 0 ? "bg-white/2" : "bg-transparent"
                      )}
                      onClick={() => setSelectedComponent(component)}
                    >
                      <td className={cn(
                        "p-4 sticky left-0 z-10 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl",
                        "border-r border-white/20 font-medium"
                      )}>
                        <div>{component.name}</div>
                        <div className={typography.caption}>{component.type}</div>
                      </td>
                      {checkGroups.map((group) => {
                        const groupChecks = checksByGroup[group] || [];
                        const statusCounts = groupChecks.reduce((acc, check) => {
                          acc[check.status] = (acc[check.status] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);

                        return (
                          <td key={group} className="p-4 text-center">
                            {groupChecks.length > 0 ? (
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                {statusCounts.pass && (
                                  <StatusBadge status="success">{statusCounts.pass}</StatusBadge>
                                )}
                                {statusCounts.fail && (
                                  <StatusBadge status="error">{statusCounts.fail}</StatusBadge>
                                )}
                                {statusCounts.warning && (
                                  <StatusBadge status="warning">{statusCounts.warning}</StatusBadge>
                                )}
                                {statusCounts.missing && (
                                  <StatusBadge status="neutral">{statusCounts.missing}</StatusBadge>
                                )}
                              </div>
                            ) : (
                              <span className={typography.caption}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </PremiumCard>

      {selectedComponent && (
        <ComponentDrawer
          component={selectedComponent}
          onClose={() => setSelectedComponent(null)}
        />
      )}
    </div>
  );
}
