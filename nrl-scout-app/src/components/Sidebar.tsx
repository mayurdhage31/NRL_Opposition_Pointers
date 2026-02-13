import { useMemo } from 'react';
import type { PlayerRow } from '../data/types';

interface SidebarProps {
  teams: string[];
  playerList: PlayerRow[];
  selectedTeam: string | null;
  onTeamSelect: (team: string) => void;
  selectedPlayers: string[];
  onPlayerToggle: (playerName: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  teams,
  playerList,
  selectedTeam,
  onTeamSelect,
  selectedPlayers,
  onPlayerToggle,
  isOpen,
  onToggle,
}: SidebarProps) {

  const teamPlayers = useMemo(() => {
    if (!selectedTeam) return [];
    return playerList.filter((p) => p.team_name === selectedTeam);
  }, [playerList, selectedTeam]);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md border border-white/10"
        style={{ backgroundColor: 'var(--color-panel-darker)' }}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
          />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-80 border-r border-white/10
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
        style={{ backgroundColor: 'var(--color-panel-darker)' }}
      >
        <div className="p-4 border-b border-white/10">
          <label className="block text-sm font-semibold text-slate-400 mb-2">
            Opposition
          </label>
          <select
            value={selectedTeam || ''}
            onChange={(e) => onTeamSelect(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-white/10 text-white focus:outline-none"
            style={{ backgroundColor: 'var(--color-background)' }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-accent-teal)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          >
            <option value="" disabled>Select a team...</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Player list with checkboxes */}
          {selectedTeam && teamPlayers.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-400">
                  Team Selection
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      teamPlayers.forEach((p) => {
                        if (!selectedPlayers.includes(p.player_name)) {
                          onPlayerToggle(p.player_name);
                        }
                      });
                    }}
                    className="text-xs px-2 py-1 rounded transition-colors"
                    style={{ 
                      color: 'var(--color-accent-teal)',
                      backgroundColor: 'rgba(20, 184, 166, 0.1)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(20, 184, 166, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(20, 184, 166, 0.1)'}
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => {
                      teamPlayers.forEach((p) => {
                        if (selectedPlayers.includes(p.player_name)) {
                          onPlayerToggle(p.player_name);
                        }
                      });
                    }}
                    className="text-xs px-2 py-1 rounded transition-colors text-slate-400 hover:text-slate-300"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {teamPlayers.map((player, idx) => {
                  const isChecked = selectedPlayers.includes(player.player_name);
                  return (
                    <label
                      key={`${player.player_name}-${idx}`}
                      className="flex items-start gap-3 px-2 py-2 rounded-md cursor-pointer transition-colors hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onPlayerToggle(player.player_name)}
                        className="mt-1 w-4 h-4 rounded border-white/20 focus:ring-2 focus:ring-offset-0"
                        style={{
                          accentColor: 'var(--color-accent-teal)',
                          backgroundColor: isChecked ? 'var(--color-accent-teal)' : 'transparent',
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-300">{player.player_name}</div>
                        <div className="text-xs text-slate-500">{player.position}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
