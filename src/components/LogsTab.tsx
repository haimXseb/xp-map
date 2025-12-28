import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
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

export function LogsTab({ data }: { data: ProjectData }) {
  const [search, setSearch] = useState('');
  const executionLog = data.executionLog;
  
  const filteredLogs = useMemo(() => {
    if (!executionLog?.logEntries) return [];
    let logs = executionLog.logEntries;
    
    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(log => 
        log.message.toLowerCase().includes(q) ||
        log.type.toLowerCase().includes(q) ||
        log.phase.toLowerCase().includes(q)
      );
    }
    
    return logs.reverse(); // Latest first
  }, [executionLog, search]);
  
  return (
    <div className="grid gap-6">
      <GlassCard>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Logs</CardTitle>
            <input
              type="text"
              placeholder="חיפוש..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/20 border border-white/25 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {filteredLogs.map((log, idx) => (
              <div
                key={idx}
                className="rounded-[22px] border border-white/20 bg-white/25 p-4 backdrop-blur-xl dark:bg-white/7 dark:border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">{log.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString('he-IL')}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Type: {log.type}</span>
                  <span>•</span>
                  <span>Phase: {log.phase}</span>
                  {log.files.length > 0 && (
                    <>
                      <span>•</span>
                      <span>Files: {log.files.join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

