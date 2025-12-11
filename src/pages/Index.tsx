import { Scoreboard } from '@/components/Scoreboard';
import { RadarSignal } from '@/components/RadarSignal';
import { MarketTabs } from '@/components/MarketTabs';
import { SignalTimeline } from '@/components/SignalTimeline';
import { RefreshButton } from '@/components/RefreshButton';
import { FootballBackground } from '@/components/FootballBackground';
import { useMarketData } from '@/hooks/useMarketData';
import { useMatchList } from '@/hooks/useMatchList';
import { useEffect, useMemo, useState } from 'react';

const Index = () => {
  // 如需按 ai_prompt 过滤可改成字符串值，例如 '5.1'；默认不过滤，避免空数据
  const aiPrompt = "5.1";
  const { data: matches = [], error: matchListError } = useMatchList(aiPrompt);
  const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!selectedMatchId && matches.length > 0) {
      setSelectedMatchId(matches[0].match_id);
    }
  }, [matches, selectedMatchId]);

  const effectiveMatchId = selectedMatchId || matches[0]?.match_id || '20251206270DF25D';

  const {
    activeTab,
    setActiveTab,
    matchInfo,
    currentSignal,
    latestHandicap,
    latestOverUnder,
    latestMoneyline,
    signalHistory,
    refresh,
    isRefreshing,
    errors,
  } = useMarketData(effectiveMatchId, aiPrompt);

  const matchOptions = useMemo(() => matches.map((m) => ({
    value: m.match_id,
    label: m.home_team && m.away_team
      ? `${m.home_team} vs ${m.away_team}`
      : m.match_id,
  })), [matches]);

  // 如果列表为空，但当前已加载某场数据，提供一个基于当前数据的临时选项
  const fallbackOption = useMemo(() => {
    if (matchOptions.length === 0 && effectiveMatchId) {
      const { homeTeam, awayTeam } = matchInfo;
      const label = homeTeam && awayTeam
        ? `${homeTeam} vs ${awayTeam}`
        : effectiveMatchId;
      return { value: effectiveMatchId, label };
    }
    return undefined;
  }, [matchOptions.length, effectiveMatchId, matchInfo]);

  return (
    <div className="min-h-screen relative">
      <FootballBackground />
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚽</span>
            <h1 className="font-bold text-foreground">Football Radar</h1>
          </div>
          <div className="flex items-center gap-2">
            {matchListError && (
              <span className="text-xs text-red-400">比赛列表读取失败</span>
            )}
            {(errors.handicap || errors.overunder || errors.moneyline) && (
              <span className="text-xs text-red-400">
                数据读取出错，检查 Supabase 权限或表名
              </span>
            )}
            <RefreshButton onClick={refresh} isRefreshing={isRefreshing} />
          </div>
        </div>
        <div className="max-w-md mx-auto mt-2">
          <select
            className="w-full bg-muted text-foreground text-sm rounded-md px-3 py-2 border border-border"
            value={selectedMatchId || ''}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            >
            {matchOptions.length === 0 && fallbackOption && (
              <option value={fallbackOption.value}>{fallbackOption.label}</option>
            )}
            {matchOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-4 space-y-4 safe-bottom">
        {/* Scoreboard */}
        <Scoreboard matchInfo={matchInfo} />

        {/* Signal Radar */}
        <RadarSignal
          signal={currentSignal.signal}
          stakingPlan={currentSignal.stakingPlan}
        />

        {/* Market Tabs */}
        <MarketTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          handicapData={latestHandicap}
          overUnderData={latestOverUnder}
          moneylineData={latestMoneyline}
        />

        {/* Signal Timeline */}
        <SignalTimeline history={signalHistory} />
      </main>
    </div>
  );
};

export default Index;
