import { cn } from '@/lib/utils';
import { getSignalType, getSignalColors, parseSignalText } from '@/lib/signals';
import { Radio } from 'lucide-react';

interface RadarSignalProps {
  signal: string;
  stakingPlan: string;
}

export function RadarSignal({ signal, stakingPlan }: RadarSignalProps) {
  const signalType = getSignalType(signal);
  const colors = getSignalColors(signalType);
  const { emoji, text } = parseSignalText(signal);

  return (
    <div
      className={cn(
        'rounded-lg p-5 border-2 transition-all duration-300 glow-card',
        colors.bg,
        colors.border,
        colors.glow,
        signalType !== 'none' && 'animate-signal-pulse'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Radio className={cn('w-5 h-5', colors.text)} />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Signal Radar
        </span>
      </div>

      {/* Signal Display */}
      <div className="space-y-3">
        {signal ? (
          <>
            <div className="flex items-start gap-3">
              {emoji && (
                <span className="text-3xl leading-none">{emoji}</span>
              )}
              <p className={cn('text-lg font-bold leading-tight', colors.text)}>
                {text || 'No active signal'}
              </p>
            </div>

            {stakingPlan && (
              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Staking:</span>
                <span className="font-mono text-sm font-semibold text-primary">
                  {stakingPlan}
                </span>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">Waiting for signals...</p>
        )}
      </div>
    </div>
  );
}
