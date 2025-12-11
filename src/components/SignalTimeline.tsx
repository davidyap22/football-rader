import { cn } from '@/lib/utils';
import { getSignalType, getSignalColors, parseSignalText } from '@/lib/signals';
import { Clock } from 'lucide-react';

interface TimelineItem {
  idx: number;
  clock: string;
  score: string;
  signal: string;
  oddsSummary?: string;
  staking_plan?: string;
}

interface SignalTimelineProps {
  history: TimelineItem[];
}

export function SignalTimeline({ history }: SignalTimelineProps) {
  if (!history.length) return null;

  return (
    <div className="bg-card rounded-lg p-4 glow-card">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Signal History
        </span>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {history.map((item, index) => {
          const signalType = getSignalType(item.signal);
          const colors = getSignalColors(signalType);
          const { emoji, text } = parseSignalText(item.signal);

          return (
            <div
              key={item.idx}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border-l-4 transition-all',
                colors.bg,
                colors.border,
                index === 0 && 'ring-1 ring-border'
              )}
              >
              {/* Clock Badge */}
              <div className="shrink-0 bg-muted px-2 py-1 rounded text-center min-w-[40px]">
                <span className="font-mono text-sm font-bold text-foreground">{item.clock}'</span>
              </div>

              {/* Signal Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {emoji && <span className="text-lg">{emoji}</span>}
                  <p className={cn('text-sm font-medium truncate', colors.text)}>
                    {text || 'No signal'}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Score: <span className="font-mono">{item.score}</span>
                </p>
                {item.oddsSummary && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-mono">{item.oddsSummary}</span>
                  </p>
                )}
                {item.staking_plan && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Staking: <span className="font-mono">{item.staking_plan}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
