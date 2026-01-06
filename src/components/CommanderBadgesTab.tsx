import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, CheckCircle2, Lock, Clock } from 'lucide-react';
import { ProjectData, Badge as BadgeType } from '../data/loadData';
import { PremiumCard, StatusBadge, SectionHeader, EmptyState, typography } from '../lib/design-system';
import { cn } from '@/lib/utils';

function BadgeCard({ badge, onClick }: { badge: BadgeType; onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  const isUnlocked = badge.status === 'unlocked';
  const isInProgress = badge.status === 'in-progress';
  const isLocked = badge.status === 'locked';

  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 cursor-pointer transition-all duration-300",
        "border overflow-hidden",
        // Locked: grayscale + low contrast + disabled feel
        isLocked && "border-white/10 bg-white/5 opacity-60 grayscale",
        // Unlocked: metallic gradient + soft highlight + inner shadow
        isUnlocked && [
          "border-white/30 bg-gradient-to-br from-amber-50/40 via-yellow-50/30 to-orange-50/40",
          "dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.1),0_8px_24px_rgba(251,191,36,0.15)]",
          "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(0,0,0,0.1),0_12px_32px_rgba(251,191,36,0.2)]",
        ],
        // In Progress: subtle blue gradient
        isInProgress && [
          "border-white/25 bg-gradient-to-br from-blue-50/30 via-cyan-50/20 to-sky-50/30",
          "dark:from-blue-950/20 dark:via-cyan-950/15 dark:to-sky-950/20",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_16px_rgba(59,130,246,0.1)]",
        ],
        "hover:scale-[1.02]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Metallic highlight overlay for unlocked */}
      {isUnlocked && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/5 to-transparent" />
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {isUnlocked && <CheckCircle2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
            {isInProgress && <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
            {isLocked && <Lock className="w-6 h-6 text-gray-400" />}
            <div>
              <h3 className={typography.h4 + (isLocked ? " text-muted-foreground" : "")}>{badge.name}</h3>
            </div>
          </div>
          <StatusBadge
            status={
              isUnlocked ? 'success' :
              isInProgress ? 'info' :
              'neutral'
            }
          >
            {badge.status}
          </StatusBadge>
        </div>

        <p className={cn(
          typography.bodySmall,
          "mb-4",
          isLocked ? "text-muted-foreground" : "text-muted-foreground"
        )}>
          {badge.description}
        </p>

        {/* Progress Pips (5 total) */}
        <div className="flex gap-1.5 mb-4">
          {[0, 1, 2, 3, 4].map((pip) => {
            const isFilled = pip < badge.progress;
            return (
              <div
                key={pip}
                className={cn(
                  "h-2 flex-1 rounded-full transition-all duration-300",
                  isFilled
                    ? isUnlocked
                      ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                      : isInProgress
                      ? "bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500"
                      : "bg-gray-400"
                    : "bg-white/20 dark:bg-white/10"
                )}
              />
            );
          })}
        </div>

        {/* Hover checklist */}
        {isHovered && badge.checklist && badge.checklist.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className={typography.label + " mb-2"}>Checklist:</div>
            <ul className="space-y-1.5">
              {badge.checklist.map((item, idx) => (
                <li key={idx} className={cn(
                  typography.bodySmall,
                  "flex items-start gap-2",
                  isLocked ? "text-muted-foreground" : ""
                )}>
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function BadgeDrawer({ badge, onClose }: { badge: BadgeType; onClose: () => void }) {
  const isUnlocked = badge.status === 'unlocked';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <PremiumCard
        variant="elevated"
        className={cn(
          "w-full max-w-2xl max-h-[85vh] flex flex-col",
          isUnlocked && "border-amber-500/20"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className={typography.h2}>{badge.name}</h2>
            <p className={typography.caption + " mt-1"}>{badge.description}</p>
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
              <StatusBadge status={isUnlocked ? 'success' : badge.status === 'in-progress' ? 'info' : 'neutral'}>
                {badge.status}
              </StatusBadge>
              {badge.unlockedAt && (
                <span className={typography.caption}>
                  Unlocked: {new Date(badge.unlockedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <div>
              <h3 className={typography.h4 + " mb-3"}>Progress</h3>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map((pip) => {
                  const isFilled = pip < badge.progress;
                  return (
                    <div
                      key={pip}
                      className={cn(
                        "h-3 flex-1 rounded-full transition-all",
                        isFilled
                          ? isUnlocked
                            ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500"
                            : "bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500"
                          : "bg-white/20"
                      )}
                    />
                  );
                })}
              </div>
              <p className={typography.caption + " mt-2"}>{badge.progress}/5 completed</p>
            </div>

            {badge.checklist && badge.checklist.length > 0 && (
              <div>
                <h3 className={typography.h4 + " mb-3"}>Checklist</h3>
                <ul className="space-y-2">
                  {badge.checklist.map((item, idx) => (
                    <li key={idx} className={cn(
                      typography.bodySmall,
                      "flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-white/10"
                    )}>
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
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

export function CommanderBadgesTab({ data }: { data: ProjectData }) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const badges = data.badges || [];

  const badgesByStatus = {
    unlocked: badges.filter(b => b.status === 'unlocked'),
    'in-progress': badges.filter(b => b.status === 'in-progress'),
    locked: badges.filter(b => b.status === 'locked'),
  };

  if (badges.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Badges" subtitle="Track your achievements and progress" />
        <EmptyState
          title="No badges defined"
          description="Badges will appear here once they are added to the data"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Badges"
        subtitle="Track your achievements and progress"
      />

      {badgesByStatus.unlocked.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className={typography.h3}>Unlocked</h3>
            <StatusBadge status="success">{badgesByStatus.unlocked.length}</StatusBadge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {badgesByStatus.unlocked.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                onClick={() => setSelectedBadge(badge)}
              />
            ))}
          </div>
        </div>
      )}

      {badgesByStatus['in-progress'].length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className={typography.h3}>In Progress</h3>
            <StatusBadge status="info">{badgesByStatus['in-progress'].length}</StatusBadge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {badgesByStatus['in-progress'].map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                onClick={() => setSelectedBadge(badge)}
              />
            ))}
          </div>
        </div>
      )}

      {badgesByStatus.locked.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className={typography.h3}>Locked</h3>
            <StatusBadge status="neutral">{badgesByStatus.locked.length}</StatusBadge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {badgesByStatus.locked.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                onClick={() => setSelectedBadge(badge)}
              />
            ))}
          </div>
        </div>
      )}

      {selectedBadge && (
        <BadgeDrawer
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
}
