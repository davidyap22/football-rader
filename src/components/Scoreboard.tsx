import { cn } from '@/lib/utils';
import type { MatchInfo } from '@/types/market';

interface ScoreboardProps {
  matchInfo: MatchInfo;
}

export function Scoreboard({ matchInfo }: ScoreboardProps) {
  const { homeTeam, awayTeam, clock, score, isLive } = matchInfo;
  const [homeScore, awayScore] = score.split(' - ');

  return (
    <div className="bg-card rounded-lg p-4 border glow-card">
      {/* Live Indicator & Clock */}
      <div className="flex items-center justify-center gap-3 mb-3">
        {isLive && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-live animate-pulse-live" />
            <span className="text-xs font-semibold text-live uppercase tracking-wider">Live</span>
          </div>
        )}
        <div className="bg-muted px-3 py-1 rounded-full">
          <span className="font-mono text-lg font-bold text-foreground">{clock}'</span>
        </div>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-2">
        {/* Home Team */}
        <div className="flex-1 text-right min-w-0">
          <p className="text-sm font-medium text-foreground truncate leading-tight">
            {homeTeam}
          </p>
        </div>

        {/* Score */}
        <div className="flex items-center gap-3 px-4">
          <span className="font-mono text-4xl font-bold text-foreground">{homeScore}</span>
          <span className="text-2xl text-muted-foreground">-</span>
          <span className="font-mono text-4xl font-bold text-foreground">{awayScore}</span>
        </div>

        {/* Away Team */}
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-foreground truncate leading-tight">
            {awayTeam}
          </p>
        </div>
      </div>
    </div>
  );
}
