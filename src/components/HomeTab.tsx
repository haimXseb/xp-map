import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, X } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ProjectData, ExecutionLog } from '../data/loadData';
import { cn } from '@/lib/utils';

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "rounded-[28px] border border-white/25 bg-white/35 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]",
        "dark:bg-white/8 dark:border-white/10",
        "transition-all duration-300 hover:shadow-[0_25px_70px_-30px_rgba(0,0,0,0.45)] hover:scale-[1.01]",
        className
      )}
    >
      {children}
    </Card>
  );
}

function SoftBadge({
  children,
  variant = "secondary",
  className,
}: {
  children: React.ReactNode;
  variant?: "secondary" | "outline";
  className?: string;
}) {
  return (
    <Badge
      variant={variant}
      className={cn(
        "rounded-2xl border-white/25 bg-white/40 text-foreground",
        "dark:bg-white/10 dark:border-white/10",
        "transition-all duration-200 hover:bg-white/50 hover:scale-105",
        className
      )}
    >
      {children}
    </Badge>
  );
}

function ProgressRing({
  value,
  label,
  sub,
}: {
  value: number; // 0..1
  label: string;
  sub?: string;
}) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, value)) * c;
  const percentage = Math.round(value * 100);
  
  return (
    <div className="flex items-center gap-4 p-2">
      <svg width="86" height="86" viewBox="0 0 86 86" className="shrink-0 transition-transform duration-300 hover:scale-110">
        <defs>
          <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <circle cx="43" cy="43" r={r} stroke="currentColor" strokeOpacity="0.10" strokeWidth="10" fill="none" />
        <circle
          cx="43"
          cy="43"
          r={r}
          stroke="url(#progressGradient)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 43 43)"
          className="transition-all duration-500"
        />
        <text x="43" y="46" textAnchor="middle" className="fill-foreground" fontSize="16" fontWeight="700">
          {percentage}%
        </text>
      </svg>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        {sub ? <div className="text-xs text-muted-foreground">{sub}</div> : null}
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-[22px] border border-white/20 bg-white/30 p-4 backdrop-blur-xl dark:bg-white/7 dark:border-white/10 transition-all duration-200 hover:bg-white/40 hover:scale-[1.02] hover:shadow-lg">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}


function useLocalChecklist(key: string, ids: string[]) {
  const [state, setState] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return Object.fromEntries(ids.map((id) => [id, false]));
      const parsed = JSON.parse(raw);
      const base = Object.fromEntries(ids.map((id) => [id, false]));
      return { ...base, ...parsed };
    } catch {
      return Object.fromEntries(ids.map((id) => [id, false]));
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state]);

  return {
    state,
    toggle: (id: string) => setState((s) => ({ ...s, [id]: !s[id] })),
    setAll: (v: boolean) => setState(Object.fromEntries(ids.map((id) => [id, v]))),
  };
}

function MasterPlanTree({ executionLog }: { executionLog?: ExecutionLog }) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  
  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };
  
  const getStatusIcon = (status: string) => {
    if (status === 'done') return '✅';
    if (status === 'in-progress') return '🔄';
    return '⏳';
  };
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'done': 'bg-green-500/20 text-green-300',
      'in-progress': 'bg-blue-500/20 text-blue-300',
      'pending': 'bg-yellow-500/20 text-yellow-300',
    };
    return variants[status] || 'bg-gray-500/20 text-gray-300';
  };
  
  if (!executionLog?.phases) {
    return <div className="text-muted-foreground p-4">אין נתוני שלבים זמינים</div>;
  }
  
  return (
    <div className="grid gap-3 p-2">
      {executionLog.phases.map((phase) => (
        <div 
          key={phase.id} 
          className="rounded-[22px] border border-white/20 bg-white/25 p-4 backdrop-blur-xl dark:bg-white/7 dark:border-white/10 transition-all duration-200 hover:bg-white/35 hover:scale-[1.01]"
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => togglePhase(phase.id)}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl transition-transform duration-200">{expandedPhases.has(phase.id) ? '▼' : '▶'}</span>
              <span className="text-lg font-semibold">{phase.name}</span>
            </div>
          </div>
          
          {expandedPhases.has(phase.id) && (
            <div className="mt-4 ml-8 grid gap-3 animate-in slide-in-from-top-2 duration-300">
              {phase.epics.map((epic) => (
                <div key={epic.id} className="rounded-[18px] border border-white/15 bg-white/20 p-3 backdrop-blur-xl transition-all duration-200 hover:bg-white/30 hover:scale-[1.01]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{getStatusIcon(epic.status)}</span>
                      <span className="font-medium">{epic.name}</span>
                      <span className={cn("px-2 py-1 rounded-lg text-xs transition-all duration-200 hover:scale-105", getStatusBadge(epic.status))}>
                        {epic.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{epic.owner}</div>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">{epic.evidence}</div>
                  
                  {epic.tasks.length > 0 && (
                    <div className="mt-3 ml-4 grid gap-2">
                      {epic.tasks.map((task) => (
                        <div key={task.id} className="rounded-[14px] border border-white/10 bg-white/15 p-2 transition-all duration-200 hover:bg-white/25 hover:scale-[1.01]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{getStatusIcon(task.status)}</span>
                              <span className="text-sm">{task.name}</span>
                            </div>
                            <span className={cn("px-2 py-0.5 rounded text-xs transition-all duration-200", getStatusBadge(task.status))}>
                              {task.status}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono mt-1">{task.evidence}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function HomeTab({ data }: { data: ProjectData }) {
  const executionLog = data.executionLog;
  const gitStatus = data.gitStatus;
  const progress = data.progress;
  
  // Pipeline checklist (from DashboardScreen)
  const pipelineIds = data.pipeline?.map((p) => p.id) || [];
  const checklist = useLocalChecklist("oz.dashboard.pipeline", pipelineIds);
  
  const completion = useMemo(() => {
    const total = pipelineIds.length;
    const done = pipelineIds.filter((id) => checklist.state[id]).length;
    return total === 0 ? 0 : done / total;
  }, [checklist.state, pipelineIds]);
  
  const confidenceSeries = useMemo(
    () => [
      { name: "Local", value: Math.round((data.gates?.local?.confidence || 0) * 100) },
      { name: "Structural", value: Math.round((data.gates?.local?.structural || 0) * 100) },
      { name: "Vision", value: data.gates?.vision?.enabledByDefault ? 100 : 30 },
    ],
    [data]
  );
  
  const historySeries = useMemo(() => {
    if (!data.recent || data.recent.length === 0) {
      // Fallback: create sample data if no recent data
      const today = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('he-IL', { month: 'short', day: 'numeric' }),
          items: Math.floor(Math.random() * 5) + 1,
          score: Math.min(100, 40 + i * 8 + Math.floor(Math.random() * 10)),
        };
      });
    }
    const points = data.recent
      .slice()
      .reverse()
      .map((x, idx) => ({
        date: x.date,
        items: x.items.length,
        score: Math.min(100, 35 + idx * 18 + x.items.length * 5),
      }));
    return points;
  }, [data]);
  
  // Get recent tasks (3 completed, 3 pending)
  const completedTasks = useMemo(() => {
    if (!executionLog) return [];
    const allTasks: Array<{ name: string; date: string; evidence: string }> = [];
    executionLog.phases?.forEach(phase => {
      phase.epics?.forEach(epic => {
        if (epic.status === 'done') {
          allTasks.push({ name: epic.name, date: executionLog.metadata?.lastUpdated || '', evidence: epic.evidence });
        }
        epic.tasks?.forEach(task => {
          if (task.status === 'done') {
            allTasks.push({ name: task.name, date: executionLog.metadata?.lastUpdated || '', evidence: task.evidence });
          }
        });
      });
    });
    return allTasks.slice(0, 3);
  }, [executionLog]);
  
  const pendingTasks = useMemo(() => {
    if (!executionLog) return [];
    const allTasks: Array<{ name: string; evidence: string }> = [];
    executionLog.phases?.forEach(phase => {
      phase.epics?.forEach(epic => {
        if (epic.status === 'pending' || epic.status === 'in-progress') {
          allTasks.push({ name: epic.name, evidence: epic.evidence });
        }
        epic.tasks?.forEach(task => {
          if (task.status === 'pending' || task.status === 'in-progress') {
            allTasks.push({ name: task.name, evidence: task.evidence });
          }
        });
      });
    });
    return allTasks.slice(0, 3);
  }, [executionLog]);
  
  // Get recent logs
  const recentLogs = useMemo(() => {
    if (!executionLog?.logEntries) return [];
    return executionLog.logEntries.slice(-5).reverse();
  }, [executionLog]);
  
  // Notifications panel state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = useMemo(() => {
    if (!data.notifications) return 0;
    return data.notifications.filter((n: any) => !n.read).length;
  }, [data.notifications]);
  
  return (
    <div className="grid gap-6 p-6">
      {/* Notifications Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="secondary"
          className={cn(
            "relative rounded-full w-12 h-12 p-0 border border-white/25 bg-white/45 backdrop-blur-xl",
            "hover:bg-white/55 dark:bg-white/10 dark:border-white/10",
            "transition-all duration-200 hover:scale-105 shadow-lg"
          )}
          onClick={() => setNotificationsOpen(!notificationsOpen)}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notifications Side Panel */}
      {notificationsOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setNotificationsOpen(false)}
          />
          <div className={cn(
            "fixed top-0 left-0 h-full w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
            "border-r border-white/25 shadow-2xl z-50",
            "transition-transform duration-300",
            notificationsOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-white/20">
                <h2 className="text-xl font-semibold">נוטיפיקציות</h2>
                <Button
                  variant="secondary"
                  className="rounded-full w-8 h-8 p-0"
                  onClick={() => setNotificationsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {data.notifications && data.notifications.length > 0 ? (
                    data.notifications.map((notif: any, idx: number) => (
                      <Card
                        key={idx}
                        className={cn(
                          "p-4 transition-all duration-200 hover:scale-[1.02]",
                          !notif.read && "border-blue-400/50 bg-blue-500/10"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{notif.title}</div>
                            {notif.message && (
                              <div className="mt-1 text-xs text-muted-foreground">{notif.message}</div>
                            )}
                            {notif.timestamp && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                {new Date(notif.timestamp).toLocaleString('he-IL')}
                              </div>
                            )}
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                          )}
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      אין נוטיפיקציות
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </>
      )}
      
      {/* Main Header - Merged from DashboardScreen */}
      <GlassCard>
        <CardHeader className="pb-4 px-6 pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="text-2xl">{data.meta?.name || 'OZ – Design-Time Accessibility Assistant'}</CardTitle>
              <div className="mt-2 text-sm text-muted-foreground">
                MVP: <span className="font-medium">{data.meta?.mvp || 'Text Field – E2E'}</span> · עודכן: {data.meta?.updated || 'N/A'}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <SoftBadge variant="outline">Repo: {data.meta?.repo || 'github.com/haimXseb/figma-oz'}</SoftBadge>
                <SoftBadge>Shift-Left</SoftBadge>
                <SoftBadge>Text Field focus</SoftBadge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ProgressRing value={completion} label="התקדמות MVP" sub="Checklist מקומי (לפי השלבים)" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-6 pb-6 grid gap-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Stat label="Gate מקומי" value={`${pct(data.gates?.local?.confidence || 0)} + structural ${pct(data.gates?.local?.structural || 0)}`} hint="Strict gating" />
            <Stat label="AI Vision" value="Opt-in" hint={data.gates?.vision?.role || 'Optional'} />
            <Stat label="Build" value={<span className="font-mono">{data.build?.command || 'npm run build'}</span>} />
            <Stat label="Scope" value="Text Field בלבד" hint="Button/Checkbox/Dropdown – ארכיטקטורה לעתיד" />
          </div>
        </CardContent>
      </GlassCard>
      
      {/* Header Snapshot - from HomeTab */}
      <GlassCard>
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-xl mb-4">Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat
              label="מטרה נוכחית"
              value={executionLog?.metadata?.currentGoal || 'לא זמין'}
            />
            <Stat
              label="שלב נוכחי"
              value={executionLog?.metadata?.currentPhase?.replace('phase', 'שלב ') || 'לא זמין'}
            />
            <Stat
              label="חסימות"
              value={executionLog?.blockers?.length || 0}
              hint={executionLog?.blockers?.length ? `${executionLog.blockers.length} חסימות פעילות` : 'אין חסימות'}
            />
            <Stat
              label="עדכון אחרון"
              value={gitStatus?.timestamp ? new Date(gitStatus.timestamp).toLocaleString('he-IL') : 'לא זמין'}
            />
          </div>
        </CardContent>
      </GlassCard>
      
      {/* Progress Bars */}
      <GlassCard>
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-xl mb-4">Progress</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressRing
              value={progress?.masterPlan?.percentage || 0}
              label="השלמת תוכנית ראשית"
              sub={`${progress?.masterPlan?.completed || 0}/${progress?.masterPlan?.total || 0} משימות`}
            />
            <ProgressRing
              value={progress?.rules?.percentage || 0}
              label="כיסוי חוקים"
              sub={`${progress?.rules?.implemented || 0}/${progress?.rules?.total || 0} חוקים`}
            />
          </div>
        </CardContent>
      </GlassCard>
      
      {/* Pipeline Checklist + Charts - from DashboardScreen */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <CardHeader className="px-6 pt-6">
            <CardTitle className="text-base">שלבי ה-MVP (סמן מה Done אצלך)</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 grid gap-2">
            {data.pipeline?.map((p, idx) => (
              <div
                key={p.id}
                className={cn(
                  "flex items-start gap-3 rounded-[22px] border border-white/20 bg-white/25 p-4 backdrop-blur-xl",
                  "dark:bg-white/7 dark:border-white/10",
                  "transition-all duration-200 hover:bg-white/35 hover:scale-[1.01]"
                )}
              >
                <Checkbox
                  id={`pipe-${p.id}`}
                  checked={Boolean(checklist.state[p.id])}
                  onCheckedChange={() => {
                    checklist.toggle(p.id);
                  }}
                />
                <label htmlFor={`pipe-${p.id}`} className="w-full cursor-pointer">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{idx + 1}. {p.title}</div>
                    <SoftBadge variant="outline">{p.id}</SoftBadge>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{p.detail}</div>
                </label>
              </div>
            ))}
            <div className="mt-2 flex flex-wrap gap-2">
              <Button 
                className="rounded-2xl transition-all duration-200 hover:scale-105" 
                onClick={() => {
                  checklist.setAll(true);
                }}
              >
                סמן הכל Done
              </Button>
              <Button 
                variant="secondary" 
                className="rounded-2xl transition-all duration-200 hover:scale-105" 
                onClick={() => {
                  checklist.setAll(false);
                }}
              >
                איפוס
              </Button>
            </div>
          </CardContent>
        </GlassCard>
        
        <GlassCard>
          <CardHeader className="px-6 pt-6">
            <CardTitle className="text-base">גרפים</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 grid gap-4">
            <div className="rounded-[22px] border border-white/20 bg-white/25 p-4 backdrop-blur-xl dark:bg-white/7 dark:border-white/10 transition-all duration-200 hover:bg-white/35">
              <div className="text-sm font-medium">״דופק״ התקדמות (proxy)</div>
              <div className="mt-1 text-xs text-muted-foreground">מדד פנימי לפי עושר ה-changelog, רק כדי להמחיש קצב.</div>
              <div className="mt-3 h-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historySeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeOpacity={0.1} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickMargin={8} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} width={28} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.22)",
                        backdropFilter: "blur(14px)",
                        background: "rgba(255,255,255,0.35)",
                      }}
                      labelStyle={{ fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="score" stroke="currentColor" fill="currentColor" fillOpacity={0.12} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="rounded-[22px] border border-white/20 bg-white/25 p-4 backdrop-blur-xl dark:bg-white/7 dark:border-white/10 transition-all duration-200 hover:bg-white/35">
              <div className="text-sm font-medium">Gates (סיכום)</div>
              <div className="mt-2 grid gap-2">
                {confidenceSeries.map((x) => (
                  <div key={x.name} className="flex items-center justify-between transition-all duration-200 hover:scale-105">
                    <div className="text-xs text-muted-foreground">{x.name}</div>
                    <div className="text-sm font-semibold">{x.value}%</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </div>
      
      {/* Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <CardHeader className="px-6 pt-6">
            <CardTitle className="text-base">משימות</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground mb-2">הושלמו (3 אחרונות)</div>
              {completedTasks.map((task, idx) => (
                <div key={idx} className="text-sm p-3 rounded-lg bg-white/10 transition-all duration-200 hover:bg-white/20 hover:scale-[1.02]">
                  {task.name}
                </div>
              ))}
              <div className="text-xs text-muted-foreground mt-4 mb-2">ממתינות (3 הבאות)</div>
              {pendingTasks.map((task, idx) => (
                <div key={idx} className="text-sm p-3 rounded-lg bg-yellow-500/10 transition-all duration-200 hover:bg-yellow-500/20 hover:scale-[1.02]">
                  {task.name}
                </div>
              ))}
            </div>
          </CardContent>
        </GlassCard>
        
        <GlassCard>
          <CardHeader className="px-6 pt-6">
            <CardTitle className="text-base">לוגים</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <ScrollArea className="h-32">
              <div className="space-y-2 pr-4">
                {recentLogs.map((log, idx) => (
                  <div key={idx} className="text-xs p-2 rounded transition-all duration-200 hover:bg-white/10">
                    <div className="text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString('he-IL')}
                    </div>
                    <div className="mt-1">{log.message}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </GlassCard>
        
        <GlassCard>
          <CardHeader className="px-6 pt-6">
            <CardTitle className="text-base">מצבי ממשק</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-sm space-y-2">
              <div className="p-2 rounded transition-all duration-200 hover:bg-white/10">מצב המתנה → זיהוי</div>
              <div className="p-2 rounded transition-all duration-200 hover:bg-white/10">→ דורש אישור</div>
              <div className="p-2 rounded transition-all duration-200 hover:bg-white/10">→ מזוהה</div>
              <div className="p-2 rounded transition-all duration-200 hover:bg-white/10">→ תוכנית מוכנה</div>
              <div className="p-2 rounded transition-all duration-200 hover:bg-white/10">→ מבצע → הושלם</div>
            </div>
          </CardContent>
        </GlassCard>
        
        <GlassCard>
          <CardHeader className="px-6 pt-6">
            <CardTitle className="text-base">סטטוס Git</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-sm space-y-2">
              <div className="p-2 rounded transition-all duration-200 hover:bg-white/10">
                <span className="text-muted-foreground">ענף: </span>
                <span className="font-mono">{gitStatus?.branch || 'לא ידוע'}</span>
              </div>
              <div className="p-2 rounded transition-all duration-200 hover:bg-white/10">
                <span className="text-muted-foreground">עץ עבודה: </span>
                <SoftBadge variant={gitStatus?.workingTree === 'clean' ? 'secondary' : 'outline'}>
                  {gitStatus?.workingTree === 'clean' ? 'נקי' : gitStatus?.workingTree || 'לא ידוע'}
                </SoftBadge>
              </div>
              <div className="p-2 rounded transition-all duration-200 hover:bg-white/10">
                <span className="text-muted-foreground">סטטוס: </span>
                {gitStatus?.ahead ? <span>קדימה {gitStatus.ahead}</span> : null}
                {gitStatus?.behind ? <span>מאחור {gitStatus.behind}</span> : null}
                {!gitStatus?.ahead && !gitStatus?.behind ? <span>מעודכן</span> : null}
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </div>
      
      {/* Master Plan Tree */}
      <GlassCard>
        <CardHeader className="px-6 pt-6">
            <CardTitle className="text-xl mb-4">עץ תוכנית ראשית</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <MasterPlanTree executionLog={executionLog} />
        </CardContent>
      </GlassCard>
      
      {/* Prompt Queue (placeholder) */}
      <GlassCard>
        <CardHeader className="px-6 pt-6">
            <CardTitle className="text-xl mb-4">תור פקודות</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-muted-foreground text-sm">
              תור הפקודות ייושם כאשר PROMPTS_LOG.json ייווצר.
            </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}
