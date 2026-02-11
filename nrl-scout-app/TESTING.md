# Testing Guide

## Quick Start Test

1. Open http://localhost:5173 in your browser
2. You should see a dark-themed interface with:
   - Header with "NRL Opposition Scout", season selector, and "Copy Report" button
   - Left sidebar with team list
   - Empty state in main area saying "Select a team to generate scout report"

## Basic Functionality Tests

### Test 1: Team Selection
1. Click on any team in the sidebar (e.g., "Sydney Roosters")
2. Verify:
   - Team name appears highlighted in teal
   - Team roster appears below the team list
   - Main area shows team name and two tabs: "Defence" and "Attack"

### Test 2: Season Selection
1. With a team selected, change the season dropdown
2. Try each option: 2023, 2024, 2025, All 2023–25
3. Verify:
   - Report content changes based on season
   - Different players may appear depending on data availability

### Test 3: Defence Tab
1. Select "Sydney Roosters" and "2023" season
2. Click on "Defence" tab (should be active by default)
3. Verify report shows:
   - Strike dependency section with player names and percentages
   - Linebreak involvement section
   - Attacking output hubs section
   - Strategic recommendations after each section

### Test 4: Attack Tab
1. With same team selected, click "Attack" tab
2. Verify report shows:
   - Run-at targets with tackle failure rates
   - Target/Avoid sections for error-prone players
   - Kick defusal statistics
   - Weakest returners
   - Contested kick viability with percentages

### Test 5: Copy Functionality
1. With a report displayed, click the "Copy" button in the report card
2. Button should briefly show "Copied!"
3. Paste into a text editor to verify content was copied
4. Try the "Copy Report" button in header to copy both tabs

### Test 6: Search Functionality
1. In the sidebar search box, type "storm"
2. Verify team list filters to show "Melbourne Storm"
3. Clear search to see all teams again

### Test 7: Mobile Responsiveness
1. Resize browser window to mobile width (< 1024px)
2. Verify:
   - Sidebar collapses and is hidden
   - Hamburger menu button appears in top-left
   - Click hamburger to open/close sidebar
   - Sidebar overlays content with backdrop

## Data Validation Tests

### Test Sample Teams
Try these teams with "All 2023–25" season to verify data loading:

1. **Sydney Roosters** - Should show James Tedesco, Joseph Suaalii data
2. **Melbourne Storm** - Should show strong defusal rates
3. **Penrith Panthers** - Should show championship-caliber stats
4. **South Sydney Rabbitohs** - Full roster available

### Verify Percentage Formatting
- All percentages should display with 2 decimal places
- Format: "45.56 %" (with space before %)
- No percentage should exceed 100.00 %

### Verify Strategic Recommendations
Each section should include actionable coaching recommendations, not just numbers:
- Defence tab: "win ruck speed early", "tighten edge spacing", "jam inside shoulders"
- Attack tab: "stack shapes at them", "pressure with repeat efforts", "kick long corners"

## Edge Cases

### Test Empty State
1. Select a team that may have limited data (newer teams)
2. Some seasons may show "No data available for this team/season"
3. This is expected behavior

### Test All Positions
1. Verify back three analysis includes:
   - 1 Fullback (most games played)
   - 2 Wingers (most games played)
2. Different positions should appear in different sections appropriately

## Performance Tests

### Load Time
- Initial page load should be under 2 seconds
- CSV loading should complete within 3-5 seconds
- HMR updates should be instant during development

### Memory Usage
- Multiple team selections should not cause memory leaks
- Check browser dev tools for excessive memory growth

## Visual/UI Tests

### Theme Consistency
- Dark navy background (#0B1220)
- Dark panels (#0F172A, #111827)
- Teal accents for active states and buttons
- White/slate-300 text for good contrast

### Typography
- Clear hierarchy: headings, body text, secondary text
- Readable font sizes throughout
- Proper line spacing in report cards

### Interactions
- Hover states on buttons should show visual feedback
- Active tab should have teal underline and text color
- Selected team should have teal background
- Focus states on inputs should show teal border

## Known Limitations

1. Back three profiles CSV has duplicate columns - automatically handled
2. Team defusal rates may exceed 100% in raw data - clamped to 100% in display
3. Some players may not have complete data across all seasons
4. Report line count is not strictly enforced but generally stays under 10 bullets

## Browser Compatibility

Tested and working on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Troubleshooting

### CSV Not Loading
- Check browser console for fetch errors
- Verify CSV files exist in `public/data/`
- Check CSV file permissions

### Empty Reports
- Verify team name matches exactly in CSV files
- Some teams may have no data for certain seasons
- Check browser console for parsing errors

### Styling Issues
- Clear browser cache and reload
- Verify Tailwind CSS is compiling correctly
- Check for CSS variable support in browser

### TypeScript Errors
Run `npm run build` to check for compilation errors

## Success Criteria

The app is working correctly if:
- ✅ All teams load in sidebar
- ✅ Team selection shows player roster
- ✅ Both tabs generate unique content
- ✅ Percentages are formatted correctly
- ✅ Strategic recommendations appear
- ✅ Copy functionality works
- ✅ Season filtering updates reports
- ✅ Mobile sidebar works
- ✅ Dark theme is consistent
- ✅ No console errors
