export type SignalType = 'entry' | 'fire' | 'wait' | 'hold' | 'none';

interface MarketRowBase {
  id: number;
  match_id: string;
  score: string;
  signal: string;
  clock: string;
  created_at?: string;
  ai_prompt?: string;
  staking_plan?: string;
  home_team?: string;
  away_team?: string;
}

export interface HandicapData extends MarketRowBase {
  idx?: number;
  market_type: string;
  handicap: string;
  home_odds: string;
  away_odds: string;
  sportsbook?: string;
}

export interface OverUnderData extends MarketRowBase {
  idx?: number;
  market_type: string;
  handicap: string;
  over_odds: string;
  under_odds: string;
  sportsbook?: string;
}

export interface MoneylineData extends MarketRowBase {
  idx?: number;
  home_odds: string;
  draw_odds: string;
  away_odds: string;
  sportsbook?: string;
}

export interface MatchInfo {
  homeTeam: string;
  awayTeam: string;
  clock: string;
  score: string;
  isLive: boolean;
}

export type MarketTab = 'handicap' | 'overunder' | '1x2';
