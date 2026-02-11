import { useState, useMemo } from 'react';
import type { PlayerRow } from '../data/types';

interface SidebarProps {
  teams: string[];
  playerList: PlayerRow[];
  selectedTeam: string | null;
  onTeamSelect: (team: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  teams,
  playerList,
  selectedTeam,
  onTeamSelect,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [search, setSearch] = useState('');

  const filteredTeams = useMemo(() => {
    if (!search) return teams;
    return teams.filter((team) =>
      team.toLowerCase().includes(search.toLowerCase())
    );
  }, [teams, search]);

  const selectedPlayers = useMemo(() => {
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
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-white/10 text-white placeholder-slate-400 focus:outline-none"
            style={{ backgroundColor: 'var(--color-background)' }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-accent-teal)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Team list */}
          <div className="p-2">
            <h3 className="px-3 py-2 text-sm font-semibold text-slate-400">
              Teams
            </h3>
            <div className="space-y-1">
              {filteredTeams.map((team) => (
                <button
                  key={team}
                  onClick={() => onTeamSelect(team)}
                  className={`
                    w-full text-left px-3 py-2 rounded-md transition-colors
                    ${selectedTeam === team ? '' : 'hover:bg-white/5 text-slate-300'}
                  `}
                  style={
                    selectedTeam === team
                      ? {
                          backgroundColor: 'rgba(20, 184, 166, 0.2)',
                          color: 'var(--color-accent-teal)',
                        }
                      : undefined
                  }
                >
                  {team}
                </button>
              ))}
            </div>
          </div>

          {/* Player list */}
          {selectedTeam && selectedPlayers.length > 0 && (
            <div className="p-2 border-t border-white/10 mt-2">
              <h3 className="px-3 py-2 text-sm font-semibold text-slate-400">
                {selectedTeam} Squad
              </h3>
              <div className="space-y-1">
                {selectedPlayers.map((player, idx) => (
                  <div
                    key={`${player.player_name}-${idx}`}
                    className="px-3 py-2 text-sm text-slate-300"
                  >
                    <div>{player.player_name}</div>
                    <div className="text-xs text-slate-500">
                      {player.position}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
