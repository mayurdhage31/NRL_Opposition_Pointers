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

// Helper to identify position groups
function identifyPositionGroup(positions: string[]): string {
  const halves = ['Halfback', 'Five-eighth'];
  const outsideBacks = ['Centre', 'Winger'];
  const backThree = ['Fullback', 'Winger'];
  const middleForwards = ['Prop', 'Hooker'];
  const edgeForwards = ['Second Row', 'Lock'];

  // Count positions in each group
  const halvesCount = positions.filter(p => halves.includes(p)).length;
  const outsideBacksCount = positions.filter(p => outsideBacks.includes(p)).length;
  const backThreeCount = positions.filter(p => backThree.includes(p)).length;
  const middleCount = positions.filter(p => middleForwards.includes(p)).length;
  const edgeCount = positions.filter(p => edgeForwards.includes(p)).length;

  if (halvesCount >= 2) return 'halves';
  if (outsideBacksCount >= 2) return 'outside backs';
  if (backThreeCount >= 2) return 'back three';
  if (middleCount >= 2) return 'middle forwards';
  if (edgeCount >= 2) return 'edge forwards';
  
  return '';
}

// Helper to generate tactical advice for strike dependency
function getStrikeDependencyAdvice(players: PlayerStat[], positionGroup: string): string {
  const totalDependency = players.slice(0, 2).reduce((sum, p) => sum + p.value, 0);
  
  if (positionGroup === 'halves') {
    return 'Apply defensive pressure on playmakers to disrupt attack at source';
  } else if (positionGroup === 'outside backs' || positionGroup === 'back three') {
    return 'Target key strike weapons in defensive structure';
  } else if (players.length >= 2 && totalDependency > 35) {
    return `${players.length} players account for majority of scoring - mark key threats closely`;
  }
  return 'Prioritize shutting down primary attacking threats';
}

// Helper to generate tactical advice for linebreak involvement
function getLinebreakAdvice(players: PlayerStat[], positionGroup: string): string {
  if (positionGroup === 'halves') {
    return 'Rush defense to limit time and space for playmaking';
  } else if (positionGroup === 'outside backs' || positionGroup === 'back three') {
    return 'Compress space on edges to limit linebreak opportunities';
  } else if (positionGroup === 'middle forwards') {
    return 'Control ruck speed to limit momentum through middle';
  } else if (positionGroup === 'edge forwards') {
    return 'Watch for second-phase play and offloads on edges';
  }
  return 'Focus defensive line speed to shut down linebreak threats';
}

// Helper to generate tactical advice for attacking output
function getAttackOutputAdvice(players: PlayerStat[]): string {
  const topTwo = players.slice(0, 2);
  const totalShare = topTwo.reduce((sum, p) => sum + p.value, 0);
  
  if (totalShare > 40) {
    return `Two players account for ${Math.round(totalShare)}% of attack - double-team key threats in critical situations`;
  } else if (players.length >= 3) {
    return 'Balanced attack across multiple players - maintain discipline across defensive line';
  }
  return 'Focus on neutralizing primary attacking weapons';
}

// Helper to generate tactical advice for tackle targets
function getTackleTargetAdvice(players: Array<{ player_name: string; value: number; formatted: string; position?: string }>): string {
  const positions = players.map(p => p.position || '').filter(p => p);
  const positionGroup = identifyPositionGroup(positions);
  
  const wingers = positions.filter(p => p === 'Winger').length;
  const centres = positions.filter(p => p === 'Centre').length;
  const fullbacks = positions.filter(p => p === 'Fullback').length;
  
  if (wingers >= 2) {
    return `${wingers} of top ${players.length} failures on wings - funnel play down both edges`;
  } else if (centres >= 2) {
    return 'Target centres in defensive line with direct running';
  } else if ((wingers + centres) >= 2) {
    return 'Exploit edge defense weaknesses with width';
  } else if (positionGroup === 'back three' || (wingers + fullbacks) >= 2) {
    return 'Attack back three under pressure with quick ball movement';
  } else if (positionGroup === 'halves') {
    return 'Run at playmakers to disrupt structure';
  } else if (positionGroup === 'middle forwards') {
    return 'Target middle defense with power running game';
  }
  return 'Identify and exploit weak defenders in attack';
}

// Helper to generate error targeting advice
function getErrorAdvice(highErrorPlayers: Array<{ player_name: string; position: string; errors: number }>, numPlayers: number): string {
  if (numPlayers === 2) {
    return 'with early ball carries to capitalize on handling issues';
  } else if (numPlayers === 3) {
    return 'with repeat sets and high-pressure situations to force errors';
  }
  return 'to exploit handling weaknesses';
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
          position: getPlayerPosition(data.playerList, teamName, name),
        };
      }
    );

    strikeInvolvement.sort((a, b) => b.value - a.value);
    const filtered = filterSelectedPlayers(strikeInvolvement);
    
    // Dynamic selection: top 2-3 based on value clustering
    let numToShow = 3;
    if (filtered.length >= 2 && filtered[0].value - filtered[1].value > 5) {
      numToShow = 2; // Clear leader
    } else if (filtered.length >= 3 && filtered[2].value > 12) {
      numToShow = 3; // Three strong contributors
    }
    
    const topStrike = filtered.slice(0, numToShow);

    if (topStrike.length > 0) {
      const positions = topStrike.map(p => p.position || '').filter(p => p);
      const positionGroup = identifyPositionGroup(positions);
      
      // Build natural language insight
      if (positionGroup === 'halves' && topStrike.length >= 2) {
        const names = topStrike.slice(0, 2).map(p => `${p.player_name} (${p.formatted})`).join(' and ');
        const advice = getStrikeDependencyAdvice(topStrike, positionGroup);
        lines.push(`${names} dominate scoring opportunities - ${advice.toLowerCase()}`);
      } else {
        const names = topStrike.map((p, idx) => {
          if (idx === 0) {
            return `${p.player_name} (${p.formatted} strike dependency)`;
          }
          return `${p.player_name} (${p.formatted})`;
        }).join(', ');
        const advice = getStrikeDependencyAdvice(topStrike, positionGroup);
        lines.push(`${names} - ${advice.toLowerCase()}`);
      }
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
    
    // Dynamic selection: top 2-3
    const numToShow = filtered.length >= 3 && filtered[2].value > 10 ? 3 : 2;
    const topLinebreak = filtered.slice(0, numToShow);

    if (topLinebreak.length > 0) {
      const positions = topLinebreak.map(p => p.position || '').filter(p => p);
      const positionGroup = identifyPositionGroup(positions);
      
      // Build natural language insight with position grouping
      if ((positionGroup === 'outside backs' || positionGroup === 'back three') && topLinebreak.length >= 2) {
        const names = topLinebreak.slice(0, 2).map(p => `${p.player_name} (${p.formatted})`).join(', ');
        const advice = getLinebreakAdvice(topLinebreak, positionGroup);
        lines.push(`${names} generate majority of linebreaks - ${advice.toLowerCase()}`);
      } else if (positionGroup === 'halves' && topLinebreak.length >= 2) {
        const names = topLinebreak.slice(0, 2).map(p => `${p.player_name} (${p.formatted})`).join(' and ');
        const advice = getLinebreakAdvice(topLinebreak, positionGroup);
        lines.push(`${names} top linebreak involvement - ${advice.toLowerCase()}`);
      } else {
        const names = topLinebreak.map((p, idx) => {
          if (idx === 0) {
            return `${p.player_name} (${p.formatted} linebreak involvement)`;
          }
          return `${p.player_name} (${p.formatted})`;
        }).join(', ');
        const advice = getLinebreakAdvice(topLinebreak, positionGroup);
        lines.push(`${names} - ${advice.toLowerCase()}`);
      }
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
        position: getPlayerPosition(data.playerList, teamName, name),
      })
    );

    attackOutput.sort((a, b) => b.value - a.value);
    const filtered = filterSelectedPlayers(attackOutput);
    
    // Dynamic selection: show 2-4 players
    let numToShow = 3;
    const topTwo = filtered.slice(0, 2);
    const topTwoTotal = topTwo.reduce((sum, p) => sum + p.value, 0);
    
    if (topTwoTotal > 40) {
      numToShow = 2; // Heavy concentration
    } else if (filtered.length >= 4 && filtered[3].value > 10) {
      numToShow = 4; // Distributed attack
    }
    
    const topOutput = filtered.slice(0, numToShow);

    if (topOutput.length > 0) {
      const advice = getAttackOutputAdvice(topOutput);
      
      // Vary presentation style
      if (topOutput.length === 2 && topTwoTotal > 40) {
        const names = topOutput.map(p => `${p.player_name} (${p.formatted})`).join(', ');
        lines.push(`${names} - ${advice.toLowerCase()}`);
      } else {
        const names = topOutput.map((p, idx) => {
          if (idx === 0) {
            return `${p.player_name} (${p.formatted} share of attacking output)`;
          }
          return `${p.player_name} (${p.formatted})`;
        }).join(', ');
        lines.push(`${names} - ${advice.toLowerCase()}`);
      }
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
    const aggregated: Map<string, { rate: number; count: number; position: string }> = new Map();
    
    tackleData.forEach((row) => {
      const key = row.player_name;
      const existing = aggregated.get(key) || { rate: 0, count: 0, position: row.position };
      existing.rate += parsePct(row.tackle_failure_rate);
      existing.count += 1;
      aggregated.set(key, existing);
    });

    const tackleTargets: Array<{ player_name: string; value: number; formatted: string; position?: string }> = 
      Array.from(aggregated.entries()).map(([name, stats]) => ({
        player_name: name,
        value: stats.rate / stats.count,
        formatted: fmtPct(stats.rate / stats.count),
        position: stats.position,
      }));

    tackleTargets.sort((a, b) => b.value - a.value);
    const filtered = filterSelectedPlayers(tackleTargets);
    
    // Dynamic selection: top 3-4 based on clustering
    const numToShow = filtered.length >= 4 && filtered[3].value > 20 ? 4 : 3;
    const topTargets = filtered.slice(0, numToShow);

    if (topTargets.length > 0) {
      const advice = getTackleTargetAdvice(topTargets);
      const names = topTargets.map((p, idx) => {
        if (idx === 0) {
          return `${p.player_name} (${p.formatted} tackle failure rate)`;
        }
        return `${p.player_name} (${p.formatted})`;
      }).join(', ');
      
      lines.push(`Run-at targets: ${names} - ${advice.toLowerCase()}`);
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

    // Dynamic: top 2-3 high error players
    const numToTarget = playerErrors.length >= 3 && playerErrors[2].errors > 1.5 ? 3 : 2;
    const topErrors = playerErrors.slice(0, numToTarget);
    
    if (topErrors.length > 0) {
      const advice = getErrorAdvice(topErrors, numToTarget);
      
      if (topErrors.length === 2) {
        const errorNames = topErrors.map(p => `${p.player_name} (${p.errors.toFixed(2)} errors/game)`).join(' and ');
        lines.push(`Target ${errorNames} ${advice}`);
      } else {
        const errorNames = topErrors.map((p, idx) => {
          if (idx === 0) {
            return `${p.player_name} (${p.errors.toFixed(2)} errors/game)`;
          }
          return `${p.player_name} (${p.errors.toFixed(2)})`;
        }).join(', ');
        lines.push(`Target ${errorNames} ${advice}`);
      }
    }

    // Bottom 1-2 low error players (avoid)
    const bottomErrors = playerErrors.slice(-1);
    if (bottomErrors.length > 0 && bottomErrors[0].errors < 1.0) {
      const avoidPlayer = bottomErrors[0];
      lines.push(`Avoid ${avoidPlayer.player_name} (${avoidPlayer.errors.toFixed(2)} errors/game) - safe ball handler`);
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
      // Pillar 1: kicks defused - identify weakest under high ball
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

      // Sort in ascending order (lowest defused first)
      defusalStats.sort((a, b) => a.playerDefused - b.playerDefused);

      // Natural language for weakest defuser(s)
      const weakestDefuser = defusalStats[0];
      if (weakestDefuser.isBelowAvg) {
        lines.push(`${weakestDefuser.player_name} (${weakestDefuser.playerDefused.toFixed(2)} defused/game) struggles under high ball - target with contestable kicks`);
      } else if (defusalStats.length >= 2) {
        const topTwo = defusalStats.slice(0, 2);
        const names = topTwo.map(p => `${p.player_name} (${p.playerDefused.toFixed(2)})`).join(', ');
        lines.push(`Kick defusal rates: ${names} defused/game - test back three under pressure`);
      }

      // Pillar 2: weakest returners - position grouped
      const returners = backThree
        .map((p) => ({
          player_name: p.player_name,
          position: p.primary_position,
          returnMetres: parseNumber(p.kick_return_metres_per_game),
        }))
        .sort((a, b) => a.returnMetres - b.returnMetres);

      if (returners.length > 0) {
        const weakestReturner = returners[0];
        const wingersInWeak = returners.filter(r => r.position === 'Winger').slice(0, 2);
        
        if (wingersInWeak.length >= 2 && wingersInWeak.every(w => w.returnMetres < 5)) {
          const wNames = wingersInWeak.map(w => `${w.player_name} (${w.returnMetres.toFixed(1)}m)`).join(' and ');
          lines.push(`Wingers ${wNames} lack yardage on returns - pin in corners to limit field position`);
        } else if (weakestReturner.returnMetres < 4.5) {
          lines.push(`${weakestReturner.player_name} (${weakestReturner.returnMetres.toFixed(1)}m avg return) weakest returner - pin deep with grubbers and bombs`);
        } else {
          const names = returners.slice(0, 2).map(r => `${r.player_name} (${r.returnMetres.toFixed(1)}m)`).join(', ');
          lines.push(`Kick return metres: ${names} - target with tactical kicking`);
        }
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

    // Natural language presentation with tactical context
    if (back3DefusalPct < 75) {
      lines.push(
        `Back three defusal rate (${fmtPct(back3DefusalPct)}) below average - high probability for contestable kick success`
      );
    } else if (teamDefusalPct < 80) {
      lines.push(
        `Team defusal rate (${fmtPct(teamDefusalPct)}) - moderate opportunity for contested kicks and pressure situations`
      );
    } else {
      lines.push(
        `Contested kick viability: back three ${fmtPct(back3DefusalPct)}, team ${fmtPct(teamDefusalPct)} - strong under high ball`
      );
    }
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
    { term: 'Strike dependency', definition: "player's % share of team total tries + try assists" },
    { term: 'Linebreak involvement', definition: "player's % share of team total linebreaks + linebreak assists" },
    { term: 'Share of attacking output', definition: "player's % share of team total tries + try assists + linebreaks + linebreak assists" },
  ];

  const attackGlossary = [
    { term: 'Tackle failure rate', definition: 'missed + ineffective tackles as % of all tackles' },
    { term: 'Errors/game', definition: 'includes handling errors' },
    { term: 'Defused/game', definition: 'oppn back 3 ranked on average kicks defused per game' },
    { term: 'Weakest returners', definition: 'oppn back 3 ranked on average kick return metres per game' },
  ];

  return {
    defence: generateDefenceReport(data, teamName, season, selectedPlayers),
    attack: generateAttackReport(data, teamName, season, selectedPlayers),
    defenceGlossary,
    attackGlossary,
  };
}
