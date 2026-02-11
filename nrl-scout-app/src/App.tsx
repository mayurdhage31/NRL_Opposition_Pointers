import { useState, useMemo } from 'react';
import { useData } from './hooks/useData';
import { Sidebar } from './components/Sidebar';
import { ReportCard } from './components/ReportCard';
import { generateReport } from './logic/report';

type Season = '2023' | '2024' | '2025' | 'All 2023–25';

function App() {
  const { data, loading, error } = useData();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [season, setSeason] = useState<Season>('All 2023–25');
  const [activeTab, setActiveTab] = useState<'defence' | 'attack'>('defence');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const teams = useMemo(() => {
    if (!data) return [];
    const uniqueTeams = new Set(data.playerList.map((p) => p.team_name));
    return Array.from(uniqueTeams).sort();
  }, [data]);

  const report = useMemo(() => {
    if (!data || !selectedTeam) return null;
    return generateReport(data, selectedTeam, season);
  }, [data, selectedTeam, season]);

  const handleCopyAll = () => {
    if (!report) return;
    const text = `Defence:\n${report.defence.join('\n')}\n\nAttack:\n${report.attack.join('\n')}`;
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-300">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-400">Error loading data: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between" style={{ backgroundColor: 'var(--color-panel-darker)' }}>
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold">NRL Opposition Scout</h1>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value as Season)}
            className="px-4 py-2 rounded-md border border-white/10 text-white focus:outline-none"
            style={{ backgroundColor: 'var(--color-background)' }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-accent-teal)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          >
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="All 2023–25">All 2023–25</option>
          </select>
          <button
            onClick={handleCopyAll}
            disabled={!report}
            className="px-4 py-2 text-white rounded-md transition-colors font-medium disabled:bg-slate-700 disabled:text-slate-400"
            style={!report ? undefined : { backgroundColor: 'var(--color-accent-teal)' }}
            onMouseEnter={(e) => {
              if (report) e.currentTarget.style.backgroundColor = 'rgba(20, 184, 166, 0.9)';
            }}
            onMouseLeave={(e) => {
              if (report) e.currentTarget.style.backgroundColor = 'var(--color-accent-teal)';
            }}
          >
            Copy Report
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {data && (
          <Sidebar
            teams={teams}
            playerList={data.playerList}
            selectedTeam={selectedTeam}
            onTeamSelect={(team) => {
              setSelectedTeam(team);
              setSidebarOpen(false);
            }}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {!selectedTeam ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-400">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-lg">Select a team to generate scout report</p>
              </div>
            </div>
          ) : report ? (
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">{selectedTeam}</h2>
                <p className="text-slate-400">Season: {season}</p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-white/10">
                <button
                  onClick={() => setActiveTab('defence')}
                  className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                    activeTab === 'defence'
                      ? 'border-transparent text-slate-400 hover:text-slate-300'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                  style={
                    activeTab === 'defence'
                      ? {
                          borderBottomColor: 'var(--color-accent-teal)',
                          color: 'var(--color-accent-teal)',
                        }
                      : undefined
                  }
                >
                  Defence
                </button>
                <button
                  onClick={() => setActiveTab('attack')}
                  className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                    activeTab === 'attack'
                      ? 'border-transparent text-slate-400 hover:text-slate-300'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                  style={
                    activeTab === 'attack'
                      ? {
                          borderBottomColor: 'var(--color-accent-teal)',
                          color: 'var(--color-accent-teal)',
                        }
                      : undefined
                  }
                >
                  Attack
                </button>
              </div>

              {/* Report content */}
              <div className="space-y-6">
                {activeTab === 'defence' && (
                  <ReportCard
                    title="Defensive Game Plan"
                    lines={report.defence}
                    onCopy={() => {}}
                  />
                )}
                {activeTab === 'attack' && (
                  <ReportCard
                    title="Attacking Game Plan"
                    lines={report.attack}
                    onCopy={() => {}}
                  />
                )}
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default App;
