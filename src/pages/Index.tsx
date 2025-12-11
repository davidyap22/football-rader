import { Scoreboard } from '@/components/Scoreboard';
import { RadarSignal } from '@/components/RadarSignal';
import { MarketTabs } from '@/components/MarketTabs';
import { SignalTimeline } from '@/components/SignalTimeline';
import { RefreshButton } from '@/components/RefreshButton';
import { FootballBackground } from '@/components/FootballBackground';
import { useMarketData } from '@/hooks/useMarketData';
import { useMatchList, ALLOWED_MATCH_IDS } from '@/hooks/useMatchList';
import { useEffect, useMemo, useState } from 'react';

const Index = () => {
  // 不过滤 ai_prompt，避免因字段不存在导致无数据；如需可改成具体字符串
  const aiPrompt = undefined;
  const { data: matches = [], error: matchListError } = useMatchList();
  const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!selectedMatchId && matches.length > 0) {
      setSelectedMatchId(matches[0].match_id);
    }
  }, [matches, selectedMatchId]);

  const effectiveMatchId = selectedMatchId || matches[0]?.match_id || ALLOWED_MATCH_IDS[0] || '20251206270DF25D';
  const selectedMatch = matches.find((m) => m.match_id === effectiveMatchId);

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
  } = useMarketData(
    effectiveMatchId,
    selectedMatch?.home_team,
    selectedMatch?.away_team
  );

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
              <span className="text-xs text-red-400">
                比赛列表读取失败（查看控制台日志）
              </span>
            )}
            {errors.fast && (
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
          oddsSummary={currentSignal.oddsSummary}
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
