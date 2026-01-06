import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { ProjectData } from '../data/loadData';
import { PremiumCard, typography } from '../lib/design-system';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export function CommanderProgressGraph({ data }: { data: ProjectData }) {
  // Get pillars from data or derive from phases
  const pillars = useMemo(() => {
    if (data.pillars && data.pillars.length > 0) {
      return data.pillars;
    }
    // Fallback: derive from phases if pillars not available
    const phases = data.executionLog?.phases || [];
    return phases.map((phase) => ({
      id: phase.id,
      name: phase.name,
      progress: {
        total: phase.epics?.length || 0,
        completed: phase.epics?.filter((e: any) => e.status === 'done').length || 0,
        percentage: 0,
      },
    })).map(pillar => ({
      ...pillar,
      progress: {
        ...pillar.progress,
        percentage: pillar.progress.total > 0
          ? (pillar.progress.completed / pillar.progress.total) * 100
          : 0,
      },
    }));
  }, [data]);

  const chartData = pillars.map(pillar => ({
    name: pillar.name,
    percentage: pillar.progress.percentage,
    completed: pillar.progress.completed,
    total: pillar.progress.total,
  }));

  const overallProgress = useMemo(() => {
    if (pillars.length === 0) return 0;
    const total = pillars.reduce((sum, p) => sum + p.progress.total, 0);
    const completed = pillars.reduce((sum, p) => sum + p.progress.completed, 0);
    return total > 0 ? (completed / total) * 100 : 0;
  }, [pillars]);

  return (
    <PremiumCard variant="elevated" className="p-6">
      <div className="mb-6">
        <h2 className={typography.h3 + " mb-1"}>MVP Progress by Pillars</h2>
        <p className={typography.caption}>Overall completion across all pillars</p>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className={typography.label}>Overall Progress</span>
          <span className={typography.h2}>{Math.round(overallProgress)}%</span>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 rounded-full"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="name"
            stroke="rgba(255,255,255,0.5)"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={90}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            tick={{ fontSize: 12 }}
            domain={[0, 100]}
            label={{ value: 'Progress %', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '12px',
            }}
            formatter={(value: number) => [`${Math.round(value)}%`, 'Progress']}
          />
          <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
        {pillars.map((pillar) => (
          <div key={pillar.id} className="text-center">
            <div className={typography.caption + " mb-1"}>{pillar.name}</div>
            <div className={typography.h3}>{Math.round(pillar.progress.percentage)}%</div>
            <div className={typography.caption}>
              {pillar.progress.completed}/{pillar.progress.total}
            </div>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}
