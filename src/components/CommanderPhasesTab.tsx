import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, ExternalLink, Search } from 'lucide-react';
import { ProjectData } from '../data/loadData';
import { PremiumCard, StatusBadge, SectionHeader, EmptyState, typography } from '../lib/design-system';
import { cn } from '@/lib/utils';

function getStatusBadgeType(status: string): "success" | "warning" | "error" | "info" | "neutral" {
  if (status === 'done') return 'success';
  if (status === 'in-progress') return 'info';
  return 'neutral';
}

function PhaseAccordion({ phase, filters }: { phase: any; filters: { status?: string } }) {
  const [expanded, setExpanded] = useState(true);
  const [epicExpanded, setEpicExpanded] = useState<Record<string, boolean>>({});

  const filteredEpics = useMemo(() => {
    let epics = phase.epics || [];
    if (filters.status) {
      epics = epics.filter((e: any) => e.status === filters.status);
    }
    return epics;
  }, [phase.epics, filters]);

  if (filteredEpics.length === 0) return null;

  return (
    <PremiumCard className="overflow-hidden">
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          {expanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
          <h3 className={typography.h3}>{phase.name}</h3>
          <StatusBadge status="neutral">{filteredEpics.length} epics</StatusBadge>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-white/10">
          <div className="divide-y divide-white/5">
            {filteredEpics.map((epic: any, idx: number) => (
              <div
                key={epic.id}
                className={cn(
                  "p-6 hover:bg-white/5 transition-colors",
                  idx % 2 === 0 ? "bg-white/2" : "bg-transparent"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className={typography.h4}>{epic.name}</h4>
                      <StatusBadge status={getStatusBadgeType(epic.status)}>
                        {epic.status}
                      </StatusBadge>
                    </div>
                    {epic.owner && (
                      <p className={typography.caption}>Owner: {epic.owner}</p>
                    )}
                  </div>
                  {epic.evidence && (
                    <a
                      href={epic.evidence}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </a>
                  )}
                </div>
                
                {epic.tasks && epic.tasks.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setEpicExpanded(prev => ({ ...prev, [epic.id]: !prev[epic.id] }))}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {epicExpanded[epic.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      {epic.tasks.length} tasks
                    </button>
                    {epicExpanded[epic.id] && (
                      <div className="mt-3 ml-6 space-y-2">
                        {epic.tasks.map((task: any) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                          >
                            <span className={typography.bodySmall}>{task.name}</span>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={getStatusBadgeType(task.status)}>
                                {task.status}
                              </StatusBadge>
                              {task.evidence && (
                                <a
                                  href={task.evidence}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {epic.testSuggestions && epic.testSuggestions.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <p className={typography.label + " mb-2 text-blue-700 dark:text-blue-400"}>Test Suggestions</p>
                    <ul className="list-disc list-inside space-y-1">
                      {epic.testSuggestions.map((suggestion: string, idx: number) => (
                        <li key={idx} className={typography.bodySmall + " text-muted-foreground"}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </PremiumCard>
  );
}

export function CommanderPhasesTab({ data }: { data: ProjectData }) {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const phases = data.executionLog?.phases || [];

  const filteredPhases = useMemo(() => {
    if (!searchQuery) return phases;
    const q = searchQuery.toLowerCase();
    return phases.filter(phase =>
      phase.name.toLowerCase().includes(q) ||
      phase.epics?.some((epic: any) =>
        epic.name.toLowerCase().includes(q) ||
        epic.tasks?.some((task: any) => task.name.toLowerCase().includes(q))
      )
    );
  }, [phases, searchQuery]);

  const filters = { status: statusFilter || undefined };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Phases"
        subtitle="Track progress across phases, epics, and tasks"
        action={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phases, epics, tasks..."
                className={cn(
                  "pl-10 pr-4 h-10 w-64 rounded-xl border-white/25 bg-white/45 backdrop-blur-xl",
                  "dark:bg-white/10 dark:border-white/10"
                )}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={cn(
                "h-10 px-4 rounded-xl border border-white/25 bg-white/45 backdrop-blur-xl text-sm",
                "dark:bg-white/10 dark:border-white/10"
              )}
            >
              <option value="">All Status</option>
              <option value="done">Done</option>
              <option value="in-progress">In Progress</option>
              <option value="todo">TODO</option>
            </select>
          </div>
        }
      />

      {filteredPhases.length === 0 ? (
        <EmptyState
          title="No phases found"
          description="Try adjusting your search or filter criteria"
        />
      ) : (
        <div className="space-y-4">
          {filteredPhases.map((phase) => (
            <PhaseAccordion key={phase.id} phase={phase} filters={filters} />
          ))}
        </div>
      )}
    </div>
  );
}
