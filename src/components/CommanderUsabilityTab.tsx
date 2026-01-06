import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ProjectData } from '../data/loadData';
import { PremiumCard, SectionHeader, typography } from '../lib/design-system';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export function CommanderUsabilityTab({ data }: { data: ProjectData }) {
  // Mock data - in real implementation, this would come from data.json
  const eventsOverTime = useMemo(() => {
    const recent = data.recent || [];
    return recent.map((entry) => ({
      date: entry.date,
      events: entry.items.length,
    }));
  }, [data.recent]);

  const topTags = useMemo(() => {
    const tags: Record<string, number> = {};
    data.executionLog?.phases?.forEach(phase => {
      phase.epics?.forEach(epic => {
        if (epic.name) {
          const words = epic.name.split(/\s+/);
          words.forEach(word => {
            if (word.length > 3) {
              tags[word] = (tags[word] || 0) + 1;
            }
          });
        }
      });
    });
    return Object.entries(tags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data.executionLog]);

  const confidenceDistribution = useMemo(() => {
    return [
      { range: '0-20%', count: 2 },
      { range: '21-40%', count: 5 },
      { range: '41-60%', count: 8 },
      { range: '61-80%', count: 12 },
      { range: '81-100%', count: 15 },
    ];
  }, []);

  const roles = useMemo(() => {
    const roleCounts: Record<string, number> = {};
    data.executionLog?.phases?.forEach(phase => {
      phase.epics?.forEach(epic => {
        if (epic.owner) {
          roleCounts[epic.owner] = (roleCounts[epic.owner] || 0) + 1;
        }
        epic.tasks?.forEach(task => {
          if (task.owner) {
            roleCounts[task.owner] = (roleCounts[task.owner] || 0) + 1;
          }
        });
      });
    });
    return Object.entries(roleCounts).map(([name, value]) => ({ name, value }));
  }, [data.executionLog]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Usability & Feedback"
        subtitle="Charts: events over time, top tags, confidence distribution, roles"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <PremiumCard className="p-6">
          <h3 className={typography.h4 + " mb-4"}>Events Over Time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={eventsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              />
              <Line
                type="monotone"
                dataKey="events"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </PremiumCard>

        <PremiumCard className="p-6">
          <h3 className={typography.h4 + " mb-4"}>Top Tags</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topTags}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PremiumCard>

        <PremiumCard className="p-6">
          <h3 className={typography.h4 + " mb-4"}>Confidence Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={confidenceDistribution}
                dataKey="count"
                nameKey="range"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {confidenceDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </PremiumCard>

        <PremiumCard className="p-6">
          <h3 className={typography.h4 + " mb-4"}>Roles Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={roles}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              />
              <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PremiumCard>
      </div>
    </div>
  );
}
