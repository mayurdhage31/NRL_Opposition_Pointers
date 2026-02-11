# NRL Opposition Pointers

This repository contains an NRL Opposition Scout Report application - a modern web tool for generating detailed NRL opposition scout reports based on comprehensive player and team statistics.

## Project Structure

- **nrl-scout-app/** - React/TypeScript/Vite web application
  - Full documentation in [nrl-scout-app/README.md](nrl-scout-app/README.md)
- **nrl_outputs_23_25_csv/** - Source CSV data files (backup/reference)

## Technology Stack

- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS v4 with custom CSS variables
- PapaParse for CSV data parsing

## Quick Start

```bash
cd nrl-scout-app
npm install
npm run dev
```

Visit `http://localhost:5173` to view the app.

## Deployment

This is a **React application** that can be deployed on platforms like:

- **Vercel** (Recommended) - Easy deployment with GitHub integration
- **Netlify** - Simple static site hosting
- **GitHub Pages** - Free hosting for GitHub repositories

### Deploy to Vercel (Recommended)

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import this GitHub repository
4. Set build settings:
   - Framework Preset: Vite
   - Root Directory: `nrl-scout-app`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Deploy!

### Deploy to Netlify

1. Push this repository to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Connect to GitHub and select this repository
4. Set build settings:
   - Base directory: `nrl-scout-app`
   - Build command: `npm run build`
   - Publish directory: `nrl-scout-app/dist`
5. Deploy!

## Features

- Team Selection and Player Roster View
- Season Filtering (2023, 2024, 2025, or aggregate)
- Defence Tab - Opposition attacking threats analysis
- Attack Tab - Opposition defensive weaknesses analysis
- One-click report copying for coaches
- Mobile responsive design with dark theme

## License

ISC
