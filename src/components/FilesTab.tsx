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

export function FilesTab({ data }: { data: ProjectData }) {
  const gitStatus = data.gitStatus;
  
  return (
    <div className="grid gap-6">
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-xl">Recent Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {gitStatus?.modifiedFiles && gitStatus.modifiedFiles.length > 0 ? (
              gitStatus.modifiedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="rounded-[22px] border border-white/20 bg-white/25 p-3 backdrop-blur-xl dark:bg-white/7 dark:border-white/10"
                >
                  <div className="font-mono text-sm">{file}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Modified (working tree: {gitStatus.workingTree})
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-sm">
                No modified files. Working tree is clean.
              </div>
            )}
          </div>
        </CardContent>
      </GlassCard>
      
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-xl">Git Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Branch: </span>
              <span className="font-mono">{gitStatus?.branch || 'unknown'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Working tree: </span>
              <span className={gitStatus?.workingTree === 'clean' ? 'text-green-300' : 'text-yellow-300'}>
                {gitStatus?.workingTree || 'unknown'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Ahead: </span>
              <span>{gitStatus?.ahead || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Behind: </span>
              <span>{gitStatus?.behind || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last commit: </span>
              <span>{gitStatus?.lastCommit ? new Date(gitStatus.lastCommit).toLocaleString('he-IL') : 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

