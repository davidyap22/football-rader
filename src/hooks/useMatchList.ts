import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

interface MatchItem {
  match_id: string;
  last_clock: number;
  last_created_at?: string;
  home_team?: string;
  away_team?: string;
}

async function fetchMatches(aiPrompt?: string): Promise<MatchItem[]> {
  const sevenDaysAgoDate = new Date();
  sevenDaysAgoDate.setDate(sevenDaysAgoDate.getDate() - 7);
  sevenDaysAgoDate.setUTCHours(0, 0, 0, 0);
  const sevenDaysAgoTs = sevenDaysAgoDate.getTime();
  const sevenDaysAgoIso = sevenDaysAgoDate.toISOString();

  const tables = ['handicap', 'total_points', 'moneyline 1x2'] as const;

  const fetchTable = async (table: (typeof tables)[number], applyDateFilter: boolean) => {
    // moneyline 1x2 可能没有 home_team/away_team，使用不同的列选择避免报错
    const selectColumns =
      table === 'moneyline 1x2'
        ? 'match_id, clock, created_at, ai_prompt'
        : 'match_id, clock, created_at, home_team, away_team, ai_prompt';

    const tableName = table === 'moneyline 1x2' ? '"moneyline 1x2"' : table;

    let q = supabase
      .from(tableName)
      .select(selectColumns)
      .order('created_at', { ascending: false })
      .limit(500);

    if (applyDateFilter) {
      q = q.gte('created_at', sevenDaysAgoIso);
    }

    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  };

  // 先尝试 7 天窗口，若所有表无数据，再放宽时间
  let data: any[] = [];
  for (const table of tables) {
    const rows = await fetchTable(table, true);
    data.push(...rows);
  }
  if (!data.length) {
    for (const table of tables) {
      const rows = await fetchTable(table, false);
      data.push(...rows);
    }
  }

  const filterByTime = (row: any) => {
    const ts = Date.parse(row.created_at || '');
    if (Number.isNaN(ts)) return true;
    return ts >= sevenDaysAgoTs;
  };

  const applyFilter = (rows: any[]) =>
    rows.filter((row) => {
      if (aiPrompt && row.ai_prompt !== aiPrompt) return false;
      return filterByTime(row);
    });

  let rows = applyFilter(data);
  // 若按 ai_prompt 过滤后为空，则放宽 ai_prompt
  if (!rows.length && aiPrompt) {
    rows = data.filter(filterByTime);
  }

  const grouped: Record<string, MatchItem> = {};
  rows.forEach((row) => {
    const clockNum = Number(row.clock || 0);
    const existing = grouped[row.match_id];
    if (!existing || clockNum > existing.last_clock) {
      grouped[row.match_id] = {
        match_id: row.match_id,
        last_clock: clockNum,
        last_created_at: row.created_at ?? undefined,
        home_team: row.home_team ?? existing?.home_team ?? undefined,
        away_team: row.away_team ?? existing?.away_team ?? undefined,
      };
    }
  });

  return Object.values(grouped).sort((a, b) => b.last_clock - a.last_clock);
}

export function useMatchList(aiPrompt?: string) {
  return useQuery({
    queryKey: ['match-list', aiPrompt],
    queryFn: () => fetchMatches(aiPrompt),
  });
}
