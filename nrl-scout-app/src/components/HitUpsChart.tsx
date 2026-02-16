import { useMemo } from 'react';
import type { PlayerAggRow } from '../data/types';
import { parseNumber } from '../data/utils';

interface HitUpsChartProps {
  playerData: PlayerAggRow[];
  teamName: string;
  selectedPlayers: string[];
}

interface PlayerHitUps {
  player_name: string;
  hit_ups: number;
  position: string;
}

export function HitUpsChart({ playerData, teamName, selectedPlayers }: HitUpsChartProps) {
  const chartData = useMemo(() => {
    // Filter for the selected team and only Forwards/Interchange
    let teamPlayers = playerData.filter(
      (p) =>
        p.primary_team_name === teamName &&
        (p.primary_position_group === 'Forwards' || p.primary_position_group === 'Interchange')
    );

    // If specific players are selected, filter for them
    if (selectedPlayers.length > 0) {
      teamPlayers = teamPlayers.filter((p) => selectedPlayers.includes(p.player_name));
    }

    // Map and parse hit-ups data
    const hitUpsData: PlayerHitUps[] = teamPlayers.map((p) => ({
      player_name: p.player_name,
      hit_ups: parseNumber(p.hit_ups),
      position: p.primary_position,
    }));

    // Sort by hit-ups descending
    hitUpsData.sort((a, b) => b.hit_ups - a.hit_ups);

    // Get top 10 players
    const topPlayers = hitUpsData.slice(0, 10);

    // Calculate max for scaling
    const maxHitUps = topPlayers.length > 0 ? topPlayers[0].hit_ups : 0;

    return { topPlayers, maxHitUps };
  }, [playerData, teamName, selectedPlayers]);

  const { topPlayers, maxHitUps } = chartData;

  if (topPlayers.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 p-6 mt-6" style={{ backgroundColor: 'var(--color-panel-darker)' }}>
        <h3 className="text-lg font-semibold mb-2">Hit-Ups: Forwards & Interchange</h3>
        <p className="text-slate-400 text-sm">No data available for this team.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 p-6 mt-6" style={{ backgroundColor: 'var(--color-panel-darker)' }}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">Hit-Ups: Forwards & Interchange</h3>
        <p className="text-slate-400 text-sm">for {teamName}</p>
      </div>

      <div className="space-y-3">
        {topPlayers.map((player, index) => {
          const widthPercent = (player.hit_ups / maxHitUps) * 100;
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-slate-300">
                  {player.player_name}
                  <span className="text-xs text-slate-500 ml-2">({player.position})</span>
                </span>
                <span className="text-sm font-semibold text-slate-200">{player.hit_ups}</span>
              </div>
              <div className="w-full bg-slate-700/30 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: 'var(--color-accent-teal)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-xs text-slate-500">
          Data aggregated across 2023-2025 seasons • Showing top 10 players by total hit-ups
        </p>
      </div>
    </div>
  );
}
