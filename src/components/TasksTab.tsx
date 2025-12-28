import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { ProjectData } from '../data/loadData';

function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`rounded-[28px] border border-white/25 bg-white/35 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] dark:bg-white/8 dark:border-white/10 ${className || ''}`}
    >
      {children}
    </Card>
  );
}

function SoftBadge({
  children,
  variant = "secondary",
}: {
  children: React.ReactNode;
  variant?: "secondary" | "outline";
}) {
  return (
    <Badge
      variant={variant}
      className={`rounded-2xl border-white/25 bg-white/40 text-foreground dark:bg-white/10 dark:border-white/10`}
    >
      {children}
    </Badge>
  );
}

export function TasksTab({ data }: { data: ProjectData }) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress' | 'pending'>('all');
  const executionLog = data.executionLog;
  
  const allTasks = useMemo(() => {
    if (!executionLog) return [];
    const tasks: Array<{
      id: string;
      name: string;
      status: string;
      owner: string;
      evidence: string;
      phase: string;
      type: 'epic' | 'task';
    }> = [];
    
    executionLog.phases.forEach(phase => {
      phase.epics.forEach(epic => {
        tasks.push({
          id: epic.id,
          name: epic.name,
          status: epic.status,
          owner: epic.owner,
          evidence: epic.evidence,
          phase: phase.name,
          type: 'epic'
        });
        epic.tasks.forEach(task => {
          tasks.push({
            id: task.id,
            name: task.name,
            status: task.status,
            owner: task.owner,
            evidence: task.evidence,
            phase: phase.name,
            type: 'task'
          });
        });
      });
    });
    
    return tasks;
  }, [executionLog]);
  
  const filteredTasks = useMemo(() => {
    if (filter === 'all') return allTasks;
    return allTasks.filter(t => t.status === filter);
  }, [allTasks, filter]);
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'done': 'bg-green-500/20 text-green-300',
      'in-progress': 'bg-blue-500/20 text-blue-300',
      'pending': 'bg-yellow-500/20 text-yellow-300',
    };
    return variants[status] || 'bg-gray-500/20 text-gray-300';
  };
  
  return (
    <div className="grid gap-6">
      <GlassCard>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Tasks</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-sm ${filter === 'all' ? 'bg-white/30' : 'bg-white/10'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 rounded-lg text-sm ${filter === 'completed' ? 'bg-white/30' : 'bg-white/10'}`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter('in-progress')}
                className={`px-3 py-1 rounded-lg text-sm ${filter === 'in-progress' ? 'bg-white/30' : 'bg-white/10'}`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 rounded-lg text-sm ${filter === 'pending' ? 'bg-white/30' : 'bg-white/10'}`}
              >
                Pending
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-[22px] border border-white/20 bg-white/25 p-4 backdrop-blur-xl dark:bg-white/7 dark:border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{task.name}</span>
                    <span className={`px-2 py-1 rounded-lg text-xs ${getStatusBadge(task.status)}`}>
                      {task.status.toUpperCase()}
                    </span>
                    {task.type === 'epic' && <SoftBadge variant="outline">Epic</SoftBadge>}
                  </div>
                  <div className="text-sm text-muted-foreground">{task.owner}</div>
                </div>
                <div className="text-xs text-muted-foreground mb-1">Phase: {task.phase}</div>
                <div className="text-xs font-mono text-muted-foreground">{task.evidence}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

