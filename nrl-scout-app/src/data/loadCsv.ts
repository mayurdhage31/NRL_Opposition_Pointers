import Papa from 'papaparse';
import type { NRLData } from './types';

const cache: Partial<NRLData> = {};

async function loadCSV<T>(filename: string): Promise<T[]> {
  const response = await fetch(`/data/${filename}`);
  const text = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse<T>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        resolve(results.data);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

// Clean duplicate columns from back_three_profiles.csv
function cleanBackThreeRow(row: any): any {
  const cleaned: any = {};
  
  for (const key in row) {
    // Prefer non-suffixed, then .x, skip .y
    if (key.endsWith('.y')) {
      continue;
    } else if (key.endsWith('.x')) {
      const baseKey = key.slice(0, -2);
      if (!cleaned[baseKey]) {
        cleaned[baseKey] = row[key];
      }
    } else {
      cleaned[key] = row[key];
    }
  }
  
  return cleaned;
}

export async function loadAllData(): Promise<NRLData> {
  try {
    const [
      playerList,
      strikeDependency,
      linebreakInvolvement,
      attackShare,
      tackleTargets,
      errorRanking,
      backThreeRaw,
      teamDefusal,
      teamDefusal2325,
    ] = await Promise.all([
      cache.playerList || loadCSV<any>('NRL_playerlist.csv'),
      cache.strikeDependency || loadCSV<any>('team_strike_dependency_all.csv'),
      cache.linebreakInvolvement || loadCSV<any>('team_linebreak_involvement_all.csv'),
      cache.attackShare || loadCSV<any>('team_attack_share_all.csv'),
      cache.tackleTargets || loadCSV<any>('back7_tackle_targets_teamseason.csv'),
      cache.errorRanking || loadCSV<any>('league_errors_ranking.csv'),
      cache.backThree || loadCSV<any>('back_three_profiles.csv'),
      cache.teamDefusal || loadCSV<any>('team_defusal_teamseason.csv'),
      cache.teamDefusal2325 || loadCSV<any>('team_defusal_23_25.csv'),
    ]);

    // Clean back three data
    const backThree = (backThreeRaw as any[]).map(cleanBackThreeRow);

    // Cache results
    cache.playerList = playerList as any;
    cache.strikeDependency = strikeDependency as any;
    cache.linebreakInvolvement = linebreakInvolvement as any;
    cache.attackShare = attackShare as any;
    cache.tackleTargets = tackleTargets as any;
    cache.errorRanking = errorRanking as any;
    cache.backThree = backThree as any;
    cache.teamDefusal = teamDefusal as any;
    cache.teamDefusal2325 = teamDefusal2325 as any;

    return {
      playerList: playerList as any,
      strikeDependency: strikeDependency as any,
      linebreakInvolvement: linebreakInvolvement as any,
      attackShare: attackShare as any,
      tackleTargets: tackleTargets as any,
      errorRanking: errorRanking as any,
      backThree: backThree as any,
      teamDefusal: teamDefusal as any,
      teamDefusal2325: teamDefusal2325 as any,
    };
  } catch (error) {
    console.error('Error loading CSV files:', error);
    throw error;
  }
}
