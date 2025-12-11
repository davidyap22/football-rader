import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { HandicapData, OverUnderData, MoneylineData, MatchInfo, MarketTab } from '@/types/market';

function sortById<T extends { id?: number | null }>(rows: T[]) {
  return rows.slice().sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
}

function pickValue(row: any, keys: string[]) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }
  return '';
}

function toStr(value: any) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function tableCandidates(table: string) {
  if (table === 'moneyline 1x2') return ['"moneyline 1x2"', 'moneyline 1x2'];
  return [table];
}

async function fetchMarketRows<T>(table: string, matchId: string) {
  if (!matchId) return [] as T[];
  for (const name of tableCandidates(table)) {
    try {
      const { data, error } = await supabase
        .from(name)
        .select('*')
        .eq('match_id', matchId)
        .order('id', { ascending: true });
      if (error) {
        console.error(`[marketData] query ${name} failed`, error);
        continue;
      }
      if (data) return data as T[];
    } catch (err) {
      console.error(`[marketData] query ${name} threw`, err);
    }
  }
  return [] as T[];
}

function formatHandicapSummary(row?: HandicapData) {
  if (!row) return '';
  return `Line ${row.handicap} | Home ${row.home_odds} Away ${row.away_odds}`;
}

function formatOverUnderSummary(row?: OverUnderData) {
  if (!row) return '';
  return `Line ${row.handicap} | Over ${row.over_odds} Under ${row.under_odds}`;
}

function formatMoneylineSummary(row?: MoneylineData) {
  if (!row) return '';
  return `Home ${row.home_odds} | Draw ${row.draw_odds} | Away ${row.away_odds}`;
}

export function useMarketData(matchId = '', fallbackHome?: string, fallbackAway?: string) {
  const [activeTab, setActiveTab] = useState<MarketTab>('handicap');
  const queryClient = useQueryClient();

  const {
    data: handicapRows = [],
    isFetching: isFetchingHandicap,
    error: handicapError,
  } = useQuery({
    queryKey: ['handicap', matchId],
    queryFn: () => fetchMarketRows<HandicapData>('handicap', matchId),
    enabled: Boolean(matchId),
    refetchInterval: 10000,
  });

  const {
    data: overUnderRows = [],
    isFetching: isFetchingOverUnder,
    error: overUnderError,
  } = useQuery({
    queryKey: ['overunder', matchId],
    queryFn: () => fetchMarketRows<OverUnderData>('total_points', matchId),
    enabled: Boolean(matchId),
    refetchInterval: 10000,
  });

  const {
    data: moneylineRows = [],
    isFetching: isFetchingMoneyline,
    error: moneylineError,
  } = useQuery({
    queryKey: ['moneyline', matchId],
    queryFn: () => fetchMarketRows<MoneylineData>('moneyline 1x2', matchId),
    enabled: Boolean(matchId),
    refetchInterval: 10000,
  });

  const isRefreshing = isFetchingHandicap || isFetchingOverUnder || isFetchingMoneyline;

  const sortedHandicap = useMemo(
    () =>
      sortById(
        handicapRows.map((row) => ({
          ...row,
          handicap: toStr(pickValue(row, ['handicap', 'pin_hdp_line', 'line'])),
          home_odds: toStr(pickValue(row, ['home_odds', 'pin_hdp_home'])),
          away_odds: toStr(pickValue(row, ['away_odds', 'pin_hdp_away'])),
        }))
      ),
    [handicapRows]
  );
  const sortedOverUnder = useMemo(
    () =>
      sortById(
        overUnderRows.map((row) => ({
          ...row,
          handicap: toStr(pickValue(row, ['handicap', 'pin_ou_line', 'line'])),
          over_odds: toStr(pickValue(row, ['over_odds', 'pin_ou_over', 'odds_over'])),
          under_odds: toStr(pickValue(row, ['under_odds', 'pin_ou_under', 'odds_under'])),
        }))
      ),
    [overUnderRows]
  );
  const sortedMoneyline = useMemo(
    () =>
      sortById(
        moneylineRows.map((row) => ({
          ...row,
          home_odds: toStr(pickValue(row, ['home_odds', 'pin_1x2_home'])),
          draw_odds: toStr(pickValue(row, ['draw_odds', 'pin_1x2_draw'])),
          away_odds: toStr(pickValue(row, ['away_odds', 'pin_1x2_away'])),
        }))
      ),
    [moneylineRows]
  );

  const latestHandicap = useMemo(
    () => (sortedHandicap.length ? sortedHandicap[sortedHandicap.length - 1] : undefined),
    [sortedHandicap]
  );

  const latestOverUnder = useMemo(
    () => (sortedOverUnder.length ? sortedOverUnder[sortedOverUnder.length - 1] : undefined),
    [sortedOverUnder]
  );

  const latestMoneyline = useMemo(
    () => (sortedMoneyline.length ? sortedMoneyline[sortedMoneyline.length - 1] : undefined),
    [sortedMoneyline]
  );

  const matchInfo: MatchInfo = useMemo(
    () => {
      const latest = latestHandicap ?? latestOverUnder ?? latestMoneyline;
      return {
        homeTeam: latest?.home_team || fallbackHome || 'Home',
        awayTeam: latest?.away_team || fallbackAway || 'Away',
        clock: latest?.clock || '0',
        score: latest?.score || '0 - 0',
        isLive: true,
      };
    },
    [latestHandicap, latestOverUnder, latestMoneyline]
  );

  const currentSignal = useMemo(() => {
    switch (activeTab) {
      case 'handicap':
        return {
          signal: latestHandicap?.signal || '',
          stakingPlan: latestHandicap?.staking_plan || '',
          oddsSummary: formatHandicapSummary(latestHandicap),
        };
      case 'overunder':
        return {
          signal: latestOverUnder?.signal || '',
          stakingPlan: latestOverUnder?.staking_plan || '',
          oddsSummary: formatOverUnderSummary(latestOverUnder),
        };
      case '1x2':
        return {
          signal: latestMoneyline?.signal || '',
          stakingPlan: latestMoneyline?.staking_plan || '',
          oddsSummary: formatMoneylineSummary(latestMoneyline),
        };
    }
  }, [activeTab, latestHandicap, latestOverUnder, latestMoneyline]);

  const signalHistory = useMemo(() => {
    switch (activeTab) {
      case 'handicap':
        return sortedHandicap.slice().reverse().map((row) => ({
          ...row,
          oddsSummary: formatHandicapSummary(row),
        })); // 最新在上，可滚动
      case 'overunder':
        return sortedOverUnder.slice().reverse().map((row) => ({
          ...row,
          oddsSummary: formatOverUnderSummary(row),
        }));
      case '1x2':
        return sortedMoneyline.slice().reverse().map((row) => ({
          ...row,
          oddsSummary: formatMoneylineSummary(row),
        }));
    }
  }, [activeTab, sortedHandicap, sortedOverUnder, sortedMoneyline]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['handicap', matchId] });
    queryClient.invalidateQueries({ queryKey: ['overunder', matchId] });
    queryClient.invalidateQueries({ queryKey: ['moneyline', matchId] });
  }, [queryClient, matchId]);

  return {
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
    errors: {
      handicap: handicapError,
      overunder: overUnderError,
      moneyline: moneylineError,
    },
  };
}
