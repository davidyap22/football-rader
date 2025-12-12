import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

// 仅展示这 5 场
export const ALLOWED_MATCH_IDS = [
  '20251212C6D055BD',
  '2025121273F1C480',
  '2025121224386B6D',
  '202512123D857ECD',
] as const;

interface MatchItem {
  match_id: string;
  home_team?: string;
  away_team?: string;
}

type TableSource = 'handicap' | 'total_points' | 'moneyline 1x2' | 'odds_fast_history';

const TABLES: TableSource[] = ['handicap', 'total_points', 'moneyline 1x2', 'odds_fast_history'];

const selectByTable: Record<TableSource, string[]> = {
  handicap: ['match_id, home_team, away_team'],
  total_points: ['match_id, home_team, away_team'],
  'moneyline 1x2': ['match_id, home_team, away_team', 'match_id'], // moneyline 表可能缺主客队
  odds_fast_history: ['match_id, home_team, away_team'],
};

async function fetchTable(table: TableSource) {
  const candidates = table === 'moneyline 1x2' ? ['"moneyline 1x2"', 'moneyline 1x2'] : [table];
  for (const name of candidates) {
    for (const select of selectByTable[table]) {
      const { data, error } = await supabase
        .from(name)
        .select(select)
        .in('match_id', ALLOWED_MATCH_IDS as unknown as string[])
        .limit(500);
      if (error) continue;
      if (data) return data;
    }
  }
  return [];
}

async function fetchMatches(): Promise<MatchItem[]> {
  const grouped: Record<string, MatchItem> = {};

  for (const table of TABLES) {
    const rows = await fetchTable(table);
    (rows || []).forEach((row: any) => {
      if (!row.match_id || !ALLOWED_MATCH_IDS.includes(row.match_id)) return;
      const existing = grouped[row.match_id];
      if (!existing) {
        grouped[row.match_id] = {
          match_id: row.match_id,
          home_team: row.home_team ?? undefined,
          away_team: row.away_team ?? undefined,
        };
      } else {
        grouped[row.match_id] = {
          match_id: row.match_id,
          home_team: existing.home_team || row.home_team || undefined,
          away_team: existing.away_team || row.away_team || undefined,
        };
      }
    });
  }

  // 按固定顺序返回
  return ALLOWED_MATCH_IDS.map((id) => ({
    match_id: id,
    home_team: grouped[id]?.home_team,
    away_team: grouped[id]?.away_team,
  }));
}

export function useMatchList() {
  return useQuery({
    queryKey: ['match-list'],
    queryFn: () => fetchMatches(),
  });
}
