# NRL Opposition Scout Report

A modern web application for generating detailed NRL opposition scout reports, analyzing both defensive and attacking strategies based on comprehensive player and team statistics.

## Features

- **Team Selection**: Browse and search through all NRL teams
- **Player Roster View**: View complete team rosters with positions
- **Season Filtering**: Analyze data for 2023, 2024, 2025, or aggregate across all three seasons
- **Dual Report Tabs**:
  - **Defence Tab**: Identifies opposition attacking threats and provides defensive strategies
  - **Attack Tab**: Highlights opposition defensive weaknesses and kicking strategies
- **Copy Functionality**: Easy one-click copy of reports for coaches and analysts
- **Dark Theme**: Professional dark navy/charcoal theme with teal accents
- **Mobile Responsive**: Collapsible sidebar for mobile viewing

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS v4** with custom CSS variables
- **PapaParse** for CSV data parsing

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Data Files

All CSV data files should be placed in `public/data/`:

- `NRL_playerlist.csv` - Team rosters and player positions
- `team_strike_dependency_all.csv` - Try and try assist statistics
- `team_linebreak_involvement_all.csv` - Linebreak statistics
- `team_attack_share_all.csv` - Overall attacking output shares
- `back7_tackle_targets_teamseason.csv` - Defensive vulnerability data
- `league_errors_ranking.csv` - Player error rates vs league averages
- `back_three_profiles.csv` - Back three kicking and return statistics
- `team_defusal_teamseason.csv` - Team kick defusal rates by season
- `team_defusal_23_25.csv` - Aggregate defusal rates 2023-2025

## Report Generation Logic

### Defence Tab (Their Threats)

Analyzes the opposition's attacking strengths to help plan defensive strategies:

1. **Strike Dependency**: Top 5 players by combined tries and try assists share
2. **Linebreak Involvement**: Top 5 players by linebreak creation
3. **Attacking Output Hubs**: Top 5 players by overall attacking contribution

Each section includes strategic recommendations for neutralizing these threats.

### Attack Tab (Their Weaknesses)

Identifies opportunities to exploit opposition defensive vulnerabilities:

1. **Run-at Targets**: Players with highest tackle failure rates
2. **Error-Prone Players**: Players with above-average error rates (targets) and ultra-reliable players (to avoid)
3. **Back Three Kicking Analysis**:
   - Kick defusal rates vs league averages
   - Weakest kick returners
   - Overall contested kicking viability based on team defusal percentages

## Project Structure

```
src/
├── components/
│   ├── ReportCard.tsx      # Report display card with copy button
│   └── Sidebar.tsx          # Team/player selection sidebar
├── data/
│   ├── loadCsv.ts           # CSV loading and caching
│   ├── types.ts             # TypeScript type definitions
│   └── utils.ts             # Parsing and formatting utilities
├── hooks/
│   └── useData.ts           # Data loading hook
├── logic/
│   └── report.ts            # Report generation algorithms
├── App.tsx                  # Main application component
├── main.tsx                 # Application entry point
└── index.css                # Global styles and theme
```

## Key Features

### Season Aggregation

When "All 2023-25" is selected, the app:
- Aggregates player statistics across all three seasons
- Recalculates percentages based on combined totals
- Uses aggregate defusal rate data

### Percentage Formatting

All percentages maintain consistent formatting:
- Input: `"45.56 %"` (with space before %)
- Output: `"45.56 %"` (preserved formatting)
- Clamped to maximum 100% for display

### Data Cleaning

- Back three profiles CSV has duplicate columns (.x and .y suffixes)
- App automatically prefers non-suffixed, then .x, and drops .y columns

## Design System

### Color Palette

- Background: `#0B1220`
- Panel Dark: `#0F172A`
- Panel Darker: `#111827`
- Accent Teal: `#14B8A6`
- Accent Green: `#22C55E`
- Accent Amber: `#F59E0B`
- Accent Red: `#EF4444`

### Typography

- System fonts: system-ui, -apple-system, sans-serif
- White primary text with slate-300 secondary text
- Clean spacing and rounded cards throughout

## Contributing

This is a specialized sports analytics tool. For updates or modifications, ensure all CSV data structures remain consistent with the parsing logic in `src/data/loadCsv.ts`.

## License

ISC
