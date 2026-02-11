// CSV row types
export interface PlayerRow {
  team_name: string;
  player_name: string;
  position: string;
  position_group: string;
}

export interface StrikeDependencyRow {
  season: string;
  team_name: string;
  player_name: string;
  tries_share_pct: string;
  try_assists_share_pct: string;
}

export interface LinebreakInvolvementRow {
  season: string;
  team_name: string;
  player_name: string;
  line_breaks_share_pct: string;
  line_break_assists_share_pct: string;
}

export interface AttackShareRow {
  season: string;
  team_name: string;
  player_name: string;
  attack_output_share_pct: string;
}

export interface TackleTargetRow {
  season: string;
  team_name: string;
  player_name: string;
  position: string;
  tackle_failure_rate: string;
  rank_back7_tackle_failure: string;
}

export interface ErrorRankingRow {
  primary_team_name: string;
  player_name: string;
  primary_position: string;
  avg_errors_per_game: string;
  league_avg_errors_per_game: string;
}

export interface BackThreeProfileRow {
  primary_team_name: string;
  player_name: string;
  primary_position: string;
  games_played: string;
  minutes_played?: string;
  kicks_defused_per_game: string;
  league_kicks_defused_per_game: string;
  kick_return_metres_per_game: string;
  rank_back3_weak_returner: string;
  player_defusal_pct_of_team_kicks_received: string;
}

export interface TeamDefusalRow {
  season?: string;
  team_name: string;
  team_defusal_pct: string;
  back3_defusal_pct_proxy: string;
}

export interface NRLData {
  playerList: PlayerRow[];
  strikeDependency: StrikeDependencyRow[];
  linebreakInvolvement: LinebreakInvolvementRow[];
  attackShare: AttackShareRow[];
  tackleTargets: TackleTargetRow[];
  errorRanking: ErrorRankingRow[];
  backThree: BackThreeProfileRow[];
  teamDefusal: TeamDefusalRow[];
  teamDefusal2325: TeamDefusalRow[];
}
