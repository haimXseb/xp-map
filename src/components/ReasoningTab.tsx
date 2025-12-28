import React from 'react';
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

export function ReasoningTab({ data }: { data: ProjectData }) {
  const executionLog = data.executionLog;
  
  return (
    <div className="grid gap-6">
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-xl">Reasoning - Actions Taken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {executionLog?.reasoning && executionLog.reasoning.length > 0 ? (
              executionLog.reasoning.map((entry, idx) => (
                <div
                  key={idx}
                  className="rounded-[22px] border border-white/20 bg-white/25 p-4 backdrop-blur-xl dark:bg-white/7 dark:border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{entry.action}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString('he-IL')}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    <strong>Why:</strong> {entry.why}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <strong>Phase:</strong> {entry.phase}
                  </div>
                  {entry.relatedFiles.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-2">
                      <strong>Related files:</strong> {entry.relatedFiles.join(', ')}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-sm">No reasoning entries yet.</div>
            )}
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

