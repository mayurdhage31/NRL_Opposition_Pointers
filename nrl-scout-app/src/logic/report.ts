import type { NRLData, PlayerRow } from '../data/types';
import { parsePct, fmtPct, parseNumber, clampPct } from '../data/utils';

export interface ReportOutput {
  defence: string[];
  attack: string[];
  defenceGlossary?: Array<{ term: string; definition: string }>;
  attackGlossary?: Array<{ term: string; definition: string }>;
}

interface PlayerStat {
  player_name: string;
  value: number;
  formatted: string;
  position?: string;
}

// Filter data by season
function filterBySeason<T extends { season: string }>(
  data: T[],
  season: string
): T[] {
  if (season === 'All 2023–25') {
    return data.filter((row) =>
      ['2023', '2024', '2025'].includes(row.season)
    );
  }
  return data.filter((row) => row.season === season);
}

// Get player position from playerlist
function getPlayerPosition(
  playerList: PlayerRow[],
  teamName: string,
  playerName: string
): string {
  const player = playerList.find(
    (p) => p.team_name === teamName && p.player_name === playerName
  );
  return player?.position || '';
}

// Generate Defence tab write-up
export function generateDefenceReport(
  data: NRLData,
  teamName: string,
  season: string,
  selectedPlayers: string[] = []
): string[] {
  const lines: string[] = [];
  
  // Helper function to filter players based on selection
  const filterSelectedPlayers = (players: PlayerStat[]): PlayerStat[] => {
    if (selectedPlayers.length === 0) return players;
    return players.filter((p) => selectedPlayers.includes(p.player_name));
  };

  // 1. Strike dependency
  const strikeData = filterBySeason(data.strikeDependency, season).filter(
    (row) => row.team_name === teamName
  );

  if (strikeData.length > 0) {
    // Aggregate if "All 2023-25"
    const aggregated: Map<string, { tries: number; assists: number; count: number }> = new Map();
    
    strikeData.forEach((row) => {
      const key = row.player_name;
      const existing = aggregated.get(key) || { tries: 0, assists: 0, count: 0 };
      existing.tries += parsePct(row.tries_share_pct);
      existing.assists += parsePct(row.try_assists_share_pct);
      existing.count += 1;
      aggregated.set(key, existing);
    });

    const strikeInvolvement: PlayerStat[] = Array.from(aggregated.entries()).map(
      ([name, stats]) => {
        const avgTries = stats.tries / stats.count;
        const avgAssists = stats.assists / stats.count;
        const involvement = (avgTries + avgAssists) / 2;
        return {
          player_name: name,
          value: involvement,
          formatted: fmtPct(involvement),
        };
      }
    );

    strikeInvolvement.sort((a, b) => b.value - a.value);
    const filtered = filterSelectedPlayers(strikeInvolvement);
    const topStrike = filtered.slice(0, 5);

    if (topStrike.length > 0) {
      const names = topStrike.map((p, idx) => {
        if (idx === 0) {
          return `${p.player_name} (${p.formatted} strike involvement)`;
        }
        return `${p.player_name} (${p.formatted})`;
      }).join(', ');
      lines.push(`Strike dependency: ${names}`);
    }
  }

  // 2. Linebreak involvement
  const linebreakData = filterBySeason(data.linebreakInvolvement, season).filter(
    (row) => row.team_name === teamName
  );

  if (linebreakData.length > 0) {
    const aggregated: Map<string, { breaks: number; assists: number; count: number }> = new Map();
    
    linebreakData.forEach((row) => {
      const key = row.player_name;
      const existing = aggregated.get(key) || { breaks: 0, assists: 0, count: 0 };
      existing.breaks += parsePct(row.line_breaks_share_pct);
      existing.assists += parsePct(row.line_break_assists_share_pct);
      existing.count += 1;
      aggregated.set(key, existing);
    });

    const linebreakInvolvement: PlayerStat[] = Array.from(aggregated.entries()).map(
      ([name, stats]) => {
        const avgBreaks = stats.breaks / stats.count;
        const avgAssists = stats.assists / stats.count;
        const involvement = (avgBreaks + avgAssists) / 2;
        return {
          player_name: name,
          value: involvement,
          formatted: fmtPct(involvement),
          position: getPlayerPosition(data.playerList, teamName, name),
        };
      }
    );

    linebreakInvolvement.sort((a, b) => b.value - a.value);
    const filtered = filterSelectedPlayers(linebreakInvolvement);
    const topLinebreak = filtered.slice(0, 5);

    if (topLinebreak.length > 0) {
      const names = topLinebreak.map((p, idx) => {
        if (idx === 0) {
          return `${p.player_name} (${p.formatted} linebreak involvement)`;
        }
        return `${p.player_name} (${p.formatted})`;
      }).join(', ');
      
      lines.push(`Linebreak involvement: ${names}`);
    }
  }

  // 3. Share of attacking output
  const attackShareData = filterBySeason(data.attackShare, season).filter(
    (row) => row.team_name === teamName
  );

  if (attackShareData.length > 0) {
    const aggregated: Map<string, { share: number; count: number }> = new Map();
    
    attackShareData.forEach((row) => {
      const key = row.player_name;
      const existing = aggregated.get(key) || { share: 0, count: 0 };
      existing.share += parsePct(row.attack_output_share_pct);
      existing.count += 1;
      aggregated.set(key, existing);
    });

    const attackOutput: PlayerStat[] = Array.from(aggregated.entries()).map(
      ([name, stats]) => ({
        player_name: name,
        value: stats.share / stats.count,
        formatted: fmtPct(stats.share / stats.count),
      })
    );

    attackOutput.sort((a, b) => b.value - a.value);
    const filtered = filterSelectedPlayers(attackOutput);
    const topOutput = filtered.slice(0, 5);

    if (topOutput.length > 0) {
      const names = topOutput.map((p, idx) => {
        if (idx === 0) {
          return `${p.player_name} (${p.formatted} attacking output)`;
        }
        return `${p.player_name} (${p.formatted})`;
      }).join(', ');
      lines.push(`Attacking output hubs: ${names}`);
    }
  }

  if (lines.length === 0) {
    lines.push('No data available for this team/season.');
  }

  return lines;
}

// Generate Attack tab write-up
export function generateAttackReport(
  data: NRLData,
  teamName: string,
  season: string,
  selectedPlayers: string[] = []
): string[] {
  const lines: string[] = [];
  
  // Helper function to filter players based on selection
  const filterSelectedPlayers = (players: PlayerStat[]): PlayerStat[] => {
    if (selectedPlayers.length === 0) return players;
    return players.filter((p) => selectedPlayers.includes(p.player_name));
  };

  // 1. Attacking targets (tackle failure)
  const tackleData = filterBySeason(data.tackleTargets, season).filter(
    (row) => row.team_name === teamName
  );

  if (tackleData.length > 0) {
    const aggregated: Map<string, { rate: number; count: number }> = new Map();
    
    tackleData.forEach((row) => {
      const key = row.player_name;
      const existing = aggregated.get(key) || { rate: 0, count: 0 };
      existing.rate += parsePct(row.tackle_failure_rate);
      existing.count += 1;
      aggregated.set(key, existing);
    });

    const tackleTargets: PlayerStat[] = Array.from(aggregated.entries()).map(
      ([name, stats]) => ({
        player_name: name,
        value: stats.rate / stats.count,
        formatted: fmtPct(stats.rate / stats.count),
      })
    );

    tackleTargets.sort((a, b) => b.value - a.value);
    const filtered = filterSelectedPlayers(tackleTargets);
    const topTargets = filtered.slice(0, 6);

    if (topTargets.length > 0) {
      const names = topTargets.map((p, idx) => {
        if (idx === 0) {
          return `${p.player_name} (${p.formatted} tackle failure rate)`;
        }
        return `${p.player_name} (${p.formatted})`;
      }).join(', ');
      lines.push(`Run-at targets: ${names}`);
    }
  }

  // 2. Error-prone opponents
  const errorData = data.errorRanking.filter(
    (row) => row.primary_team_name === teamName
  );

  if (errorData.length > 0) {
    let playerErrors: Array<{
      player_name: string;
      position: string;
      errors: number;
      leagueAvg: number;
    }> = errorData.map((row) => ({
      player_name: row.player_name,
      position: row.primary_position,
      errors: parseNumber(row.avg_errors_per_game),
      leagueAvg: parseNumber(row.league_avg_errors_per_game),
    }));

    // Filter by selected players
    if (selectedPlayers.length > 0) {
      playerErrors = playerErrors.filter((p) => selectedPlayers.includes(p.player_name));
    }

    playerErrors.sort((a, b) => b.errors - a.errors);

    // Top 2 high error players
    const topErrors = playerErrors.slice(0, 2);
    if (topErrors.length > 0) {
      const errorNames = topErrors
        .map((p, idx) => {
          if (idx === 0) {
            return `${p.player_name} (${p.errors.toFixed(2)} errors/game)`;
          }
          return `${p.player_name} (${p.errors.toFixed(2)})`;
        })
        .join(', ');
      lines.push(`Target: ${errorNames}`);
    }

    // Bottom 1-2 low error players (avoid)
    const bottomErrors = playerErrors.slice(-2);
    if (bottomErrors.length > 0) {
      const avoidNames = bottomErrors
        .map((p, idx) => {
          if (idx === 0) {
            return `${p.player_name} (${p.errors.toFixed(2)} errors/game)`;
          }
          return `${p.player_name} (${p.errors.toFixed(2)})`;
        })
        .join(', ');
      lines.push(`Avoid: ${avoidNames}`);
    }
  }

  // 3. Kicking strategy (back three)
  let backThreeData = data.backThree.filter(
    (row) => row.primary_team_name === teamName
  );

  // Filter by selected players
  if (selectedPlayers.length > 0) {
    backThreeData = backThreeData.filter((p) => selectedPlayers.includes(p.player_name));
  }

  if (backThreeData.length > 0) {
    // Identify top 1 Fullback and top 2 Wingers by games played
    const fullbacks = backThreeData
      .filter((p) => p.primary_position === 'Fullback')
      .sort((a, b) => {
        const gamesA = parseNumber(a.games_played);
        const gamesB = parseNumber(b.games_played);
        if (gamesB !== gamesA) return gamesB - gamesA;
        return parseNumber(b.minutes_played) - parseNumber(a.minutes_played);
      });

    const wingers = backThreeData
      .filter((p) => p.primary_position === 'Winger')
      .sort((a, b) => {
        const gamesA = parseNumber(a.games_played);
        const gamesB = parseNumber(b.games_played);
        if (gamesB !== gamesA) return gamesB - gamesA;
        return parseNumber(b.minutes_played) - parseNumber(a.minutes_played);
      });

    const backThree = [
      ...fullbacks.slice(0, 1),
      ...wingers.slice(0, 2),
    ];

    if (backThree.length > 0) {
      // Pillar 1: kicks defused vs league avg
      const defusalStats = backThree.map((p) => {
        const playerDefused = parseNumber(p.kicks_defused_per_game);
        const leagueDefused = parseNumber(p.league_kicks_defused_per_game);
        return {
          player_name: p.player_name,
          position: p.primary_position,
          playerDefused,
          leagueDefused,
          isBelowAvg: playerDefused < leagueDefused,
        };
      });

      const defusalLines = defusalStats
        .map((p, idx) => {
          if (idx === 0) {
            return `${p.player_name} (${p.playerDefused.toFixed(2)} defused/game)`;
          }
          return `${p.player_name} (${p.playerDefused.toFixed(2)})`;
        })
        .join(', ');

      lines.push(`Kick defusal: ${defusalLines}`);

      // Pillar 2: weakest returner
      const returners = backThree
        .map((p) => ({
          player_name: p.player_name,
          returnMetres: parseNumber(p.kick_return_metres_per_game),
        }))
        .sort((a, b) => a.returnMetres - b.returnMetres);

      if (returners.length > 0) {
        const returnerNames = returners
          .map((r, idx) => {
            if (idx === 0) {
              return `${r.player_name} (${r.returnMetres.toFixed(2)} avg kick return metres/game)`;
            }
            return `${r.player_name} (${r.returnMetres.toFixed(2)})`;
          })
          .join(', ');
        lines.push(`Weakest returners: ${returnerNames}`);
      }
    }
  }

  // 4. Contested kicking viability
  const defusalRates =
    season === 'All 2023–25'
      ? data.teamDefusal2325.filter((row) => row.team_name === teamName)
      : data.teamDefusal.filter(
          (row) => row.team_name === teamName && row.season === season
        );

  if (defusalRates.length > 0) {
    const defusal = defusalRates[0];
    const teamDefusalPct = clampPct(parsePct(defusal.team_defusal_pct));
    const back3DefusalPct = clampPct(parsePct(defusal.back3_defusal_pct_proxy));

    lines.push(
      `Contested kick viability: back three defusal (${fmtPct(back3DefusalPct)}), team defusal (${fmtPct(teamDefusalPct)})`
    );
  }

  if (lines.length === 0) {
    lines.push('No data available for this team/season.');
  }

  return lines;
}

export function generateReport(
  data: NRLData,
  teamName: string,
  season: string,
  selectedPlayers: string[] = []
): ReportOutput {
  const defenceGlossary = [
    { term: 'Strike dependency', definition: 'Players who contribute most to scoring tries and try assists' },
    { term: 'Strike involvement', definition: 'Combined percentage of tries and try assists a player contributes to the team' },
    { term: 'Linebreak involvement', definition: 'Players who create or make linebreaks most frequently' },
    { term: 'Attacking output hubs', definition: 'Players who handle the ball most in attacking situations' },
  ];

  const attackGlossary = [
    { term: 'Tackle failure rate', definition: 'Percentage of tackles where a player fails to make an effective tackle' },
    { term: 'Run-at targets', definition: 'Defenders with the highest tackle failure rates to target in attack' },
    { term: 'Errors/game', definition: 'Average number of handling errors, penalties, or turnovers per game' },
    { term: 'Kick defusal', definition: 'Successfully catching or defusing kicks per game' },
    { term: 'Kick return metres', definition: 'Average metres gained when returning opposition kicks' },
    { term: 'Weakest returners', definition: 'Players who gain the fewest metres returning kicks' },
    { term: 'Contested kick viability', definition: 'Success rate of catching contested kicks under pressure' },
  ];

  return {
    defence: generateDefenceReport(data, teamName, season, selectedPlayers),
    attack: generateAttackReport(data, teamName, season, selectedPlayers),
    defenceGlossary,
    attackGlossary,
  };
}
