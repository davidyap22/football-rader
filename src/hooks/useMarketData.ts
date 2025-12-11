import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { HandicapData, OverUnderData, MoneylineData, MatchInfo, MarketTab } from '@/types/market';

function sortByClock<T extends { clock?: string | null }>(rows: T[]) {
  return rows
    .slice()
    .sort((a, b) => Number(a.clock || 0) - Number(b.clock || 0));
}

async function fetchMarketRows<T>(table: string, matchId: string, aiPrompt?: string) {
  if (!matchId) return [] as T[];

  const tableName = table === 'moneyline 1x2' ? '"moneyline 1x2"' : table;
  let query = supabase.from(tableName).select('*').eq('match_id', matchId);

  if (aiPrompt) {
    query = query.eq('ai_prompt', aiPrompt);
  }

  const { data, error } = await query.order('clock', { ascending: true });

  if (error) throw error;
  return (data || []) as T[];
}

export function useMarketData(matchId = '20251206270DF25D', aiPrompt?: string) {
  const [activeTab, setActiveTab] = useState<MarketTab>('handicap');
  const queryClient = useQueryClient();

  const {
    data: handicapRows = [],
    isFetching: isFetchingHandicap,
    error: handicapError,
  } = useQuery({
    queryKey: ['handicap', matchId, aiPrompt],
    queryFn: () => fetchMarketRows<HandicapData>('handicap', matchId, aiPrompt),
  });

  const {
    data: overUnderRows = [],
    isFetching: isFetchingOverUnder,
    error: overUnderError,
  } = useQuery({
    queryKey: ['overunder', matchId, aiPrompt],
    queryFn: () => fetchMarketRows<OverUnderData>('total_points', matchId, aiPrompt),
  });

  const {
    data: moneylineRows = [],
    isFetching: isFetchingMoneyline,
    error: moneylineError,
  } = useQuery({
    queryKey: ['moneyline', matchId, aiPrompt],
    queryFn: () => fetchMarketRows<MoneylineData>('moneyline 1x2', matchId, aiPrompt),
  });

  const isRefreshing = isFetchingHandicap || isFetchingOverUnder || isFetchingMoneyline;

  const sortedHandicap = useMemo(() => sortByClock(handicapRows), [handicapRows]);
  const sortedOverUnder = useMemo(() => sortByClock(overUnderRows), [overUnderRows]);
  const sortedMoneyline = useMemo(() => sortByClock(moneylineRows), [moneylineRows]);

  // Get latest data from each market
  const latestHandicap = useMemo(
    () => sortedHandicap[sortedHandicap.length - 1],
    [sortedHandicap]
  );

  const latestOverUnder = useMemo(
    () => sortedOverUnder[sortedOverUnder.length - 1],
    [sortedOverUnder]
  );

  const latestMoneyline = useMemo(
    () => sortedMoneyline[sortedMoneyline.length - 1],
    [sortedMoneyline]
  );

  // Derive match info from latest data
  const matchInfo: MatchInfo = useMemo(
    () => {
      const latest = latestHandicap ?? latestOverUnder ?? latestMoneyline;
      return {
        homeTeam: latest?.home_team || 'Home',
        awayTeam: latest?.away_team || 'Away',
        clock: latest?.clock || '0',
        score: latest?.score || '0 - 0',
        isLive: true,
      };
    },
    [latestHandicap, latestOverUnder, latestMoneyline]
  );

  // Get current signal based on active tab
  const currentSignal = useMemo(() => {
    switch (activeTab) {
      case 'handicap':
        return {
          signal: latestHandicap?.signal || '',
          stakingPlan: latestHandicap?.staking_plan || '',
        };
      case 'overunder':
        return {
          signal: latestOverUnder?.signal || '',
          stakingPlan: latestOverUnder?.staking_plan || '',
        };
      case '1x2':
        return {
          signal: latestMoneyline?.signal || '',
          stakingPlan: latestMoneyline?.staking_plan || '',
        };
    }
  }, [activeTab, latestHandicap, latestOverUnder, latestMoneyline]);

  // Get history for timeline
  const signalHistory = useMemo(() => {
    switch (activeTab) {
      case 'handicap':
        return sortedHandicap.slice().reverse().slice(0, 10);
      case 'overunder':
        return sortedOverUnder.slice().reverse().slice(0, 10);
      case '1x2':
        return sortedMoneyline.slice().reverse().slice(0, 10);
    }
  }, [activeTab, sortedHandicap, sortedOverUnder, sortedMoneyline]);

  // Refresh handler (prepared for real-time)
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['handicap', matchId, aiPrompt] });
    queryClient.invalidateQueries({ queryKey: ['overunder', matchId, aiPrompt] });
    queryClient.invalidateQueries({ queryKey: ['moneyline', matchId, aiPrompt] });
  }, [queryClient, matchId, aiPrompt]);

  // Optional: subscribe to table changes for live updates
  useEffect(() => {
    const channel = supabase
      .channel(`radar-${matchId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'handicap', filter: `match_id=eq.${matchId}` },
        () => queryClient.invalidateQueries({ queryKey: ['handicap', matchId, aiPrompt] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'total_points', filter: `match_id=eq.${matchId}` },
        () => queryClient.invalidateQueries({ queryKey: ['overunder', matchId, aiPrompt] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'moneyline 1x2', filter: `match_id=eq.${matchId}` },
        () => queryClient.invalidateQueries({ queryKey: ['moneyline', matchId, aiPrompt] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, queryClient]);

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
