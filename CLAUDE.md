# CLAUDE.md – HTPC Game Launcher Development Playbook

**Project**: Universal Game Launcher voor Windows HTPC  
**Status**: Phase 1 (MVP)  
**Owner**: Rowan  
**Created**: March 30, 2026  

---

## Quick Reference

**What this project does**: A controller-native game launcher for Windows HTPC that auto-detects Steam games and lets you manually add others. Launches everything from one clean, fullscreen menu. Think Steam Big Picture, but for all your games.

**Tech Stack**: Electron + React + Tailwind + Node.js  
**Target**: Windows 11 HTPC with 8BitDo 2C controller  
**Phase 1 Duration**: 2-3 weeks (MVP)

---

## Development Workflow

### Before You Start

**Checklist**:
- [ ] Windows 11 installed on HTPC
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Git configured
- [ ] GitHub repo created (see "Repository Setup" below)
- [ ] 8BitDo 2C paired and tested (test in gamepad-tester.com)
- [ ] Spec reviewed (see `HTPC_GameLauncher_SPEC.md`)

### Session Structure

Each development session follows this pattern:

1. **Start**: Load context (read last session's notes)
2. **Work**: Follow the Implementation Checklist below
3. **Test**: Run locally, test controller input, verify no regressions
4. **Document**: Update progress, note blockers, commit to git
5. **End**: Write brief session summary (what worked, what's next)

### Code Review Checklist (Before commit)

- [ ] Code runs without errors locally
- [ ] Controller input tested (all 8 buttons)
- [ ] No console warnings (except known third-party)
- [ ] Commit message is clear (e.g., "feat: add Steam library parser")
- [ ] If UI change: tested at 1920x1080 fullscreen

---

## Implementation Checklist (Phase 1)

### Week 1: Foundation

#### 1.1 Project Setup
- [ ] Clone repo locally
- [ ] `npm install` runs without errors
- [ ] Electron window opens (blank window is fine)
- [ ] React loads in DevTools
- [ ] Confirm no startup errors

**CLI Commands**:
```bash
git clone <your-repo-url>
cd htpc-game-launcher
npm install
npm start
```

#### 1.2 Steam Library Parser
- [ ] `steamLibraryParser.js` reads local Steam config
- [ ] Parses `libraryfolders.vdf` correctly
- [ ] Extracts ≥3 test games without errors
- [ ] Returns array of game objects (id, title, steamAppId)
- [ ] Handles missing Steam install gracefully

**Test**:
```javascript
// In Node REPL or test script:
const parser = require('./src/utils/steamLibraryParser');
const games = parser.getSteamGames();
console.log(games); // Should show Steam games
```

#### 1.3 Games.json Persistence
- [ ] `gameManager.js` can load/save `games.json`
- [ ] File auto-creates if missing
- [ ] Initial load merges Steam games + manual games
- [ ] Manual game add/remove works
- [ ] No data loss on app crash (test: force-quit during save)

**Test Structure**:
```json
{
  "version": 1,
  "steamLibraryPath": "C:\\Program Files (x86)\\Steam\\steamapps",
  "lastUpdated": "2025-03-30T10:00:00Z",
  "games": []
}
```

#### 1.4 Basic React Component Tree
- [ ] App.jsx loads without errors
- [ ] GameGrid component renders (even if empty)
- [ ] GameCard renders per game
- [ ] Tailwind CSS loads (dark theme visible)
- [ ] No React warnings in console

**Components**:
- App.jsx (root)
  - GameGrid.jsx (grid layout)
    - GameCard.jsx × N (per game)

### Week 2: Interaction & Launch

#### 2.1 Gamepad Input Handler
- [ ] `useGamepad.js` hook detects controller input
- [ ] D-pad navigation works (up/down/left/right)
- [ ] Button presses (A, B, X, Y, Start) register
- [ ] No input lag (< 50ms response)
- [ ] Works with 8BitDo 2C specifically

**Test**:
- Connect controller
- Open DevTools
- Press buttons, see events logged
- Navigate grid with D-pad (no game needed yet)

#### 2.2 Game Selection & Highlighting
- [ ] Selected game highlights (border/glow effect)
- [ ] Selection persists when navigating
- [ ] Wraps around (down from last = first game)
- [ ] Smooth 60fps rendering

#### 2.3 Game Launch Logic
- [ ] `gameManager.launchGame()` works for Steam games
  - Steam games via `steam://rungameid/{appid}`
- [ ] Exe-based games via direct path execution
- [ ] Process monitoring (detect when game exits)
- [ ] Return to menu after game exit (after 2s delay for cleanup)

**Test**:
- Launch Portal 2 (common Steam game)
- Verify it starts in Steam
- Exit game
- Verify launcher returns to menu

#### 2.4 Manual Game Add UI
- [ ] Y button opens "Add Game" dialog
- [ ] Input fields: Title, Exe Path, (optional: Artwork)
- [ ] B button cancels
- [ ] A button confirms and saves to games.json
- [ ] New game appears in grid immediately

**Test**:
- Add a test game (any .exe on system)
- Verify it saves
- Restart app, verify it persists

#### 2.5 Settings Menu (Placeholder)
- [ ] B button opens settings
- [ ] Settings has: "Refresh Steam Library", "Exit to Desktop"
- [ ] "Refresh" re-reads Steam config
- [ ] "Exit" cleanly closes app

### Week 3: Polish & Integration

#### 3.1 Windows Autostart Setup
- [ ] Electron auto-launcher configured
- [ ] App launches in fullscreen on Windows boot
- [ ] No window decorations (borderless)
- [ ] Correct monitor/resolution

**Implementation**:
- Electron built-in `app.setLoginItemSettings()`
- Launch with `--fullscreen` flag
- Window BrowserWindow config: `fullscreen: true`

#### 3.2 Controller Detection & Guidance
- [ ] On startup: checks if controller connected
- [ ] If not detected: display helpful message
- [ ] Display button mapping (what each button does)
- [ ] Controller info can be toggled via button

#### 3.3 Error Handling & Edge Cases
- [ ] If Steam not installed: graceful fallback (manual games only)
- [ ] If game exe not found: error message, don't crash
- [ ] If games.json corrupted: backup + recreate
- [ ] If controller disconnects mid-game: warning, not crash

#### 3.4 Final Testing
- [ ] All 8 buttons mapped correctly
- [ ] Launch ≥3 Steam games (successful exit)
- [ ] Launch ≥2 manual games (successful exit)
- [ ] Reboot Windows, verify autostart works
- [ ] No console errors in DevTools
- [ ] Settings menu responsive

#### 3.5 Documentation & Cleanup
- [ ] README.md complete (setup, usage, troubleshooting)
- [ ] Code comments on complex sections
- [ ] No debug logs left in production code
- [ ] .gitignore proper (node_modules, games.json temp backups)
- [ ] Commit history clean

---

## Common Workflows

### Adding a New Feature

1. Create branch: `git checkout -b feat/feature-name`
2. Implement against checklist
3. Test locally (controller + UI)
4. Commit: `git add . && git commit -m "feat: description"`
5. Push: `git push origin feat/feature-name`
6. Merge to main when satisfied

### Debugging Game Launch Issues

```javascript
// Add temporary logging in gameManager.launchGame():
console.log(`Launching: ${game.title}`);
console.log(`Launcher: ${game.launcher}`);
if (game.launcher === 'steam') {
  console.log(`Steam URL: steam://rungameid/${game.steamAppId}`);
} else {
  console.log(`Exe path: ${game.exePath}`);
}

// Run app with DevTools: npm start (Ctrl+Shift+I to open)
// Watch console output during launch
```

### Testing Controller Input

Use gamepad-tester.com in browser, or test within app:

```javascript
// In Electron DevTools console:
navigator.getGamepads(); // See all connected gamepads
```

### Resetting to Clean State

```bash
# Clear games.json but keep code:
rm src/data/games.json
npm start  # Will recreate empty

# Clean install:
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## Directory Structure (Reference)

```
htpc-game-launcher/
├── src/
│   ├── main/
│   │   └── main.js                 # Electron entry point
│   ├── renderer/
│   │   ├── App.jsx                 # Root component
│   │   ├── components/
│   │   │   ├── GameGrid.jsx        # Game list grid
│   │   │   ├── GameCard.jsx        # Single game card
│   │   │   ├── SettingsMenu.jsx    # Settings overlay
│   │   │   └── ControllerInfo.jsx  # Button mapping display
│   │   ├── hooks/
│   │   │   ├── useGamepad.js       # Controller input
│   │   │   └── useGames.js         # Game data loading
│   │   ├── utils/
│   │   │   ├── steamLibraryParser.js   # Steam vdf parsing
│   │   │   ├── gameManager.js          # Game add/remove/launch
│   │   │   └── gamepadMapper.js        # Button→action mapping
│   │   ├── index.css               # Tailwind + custom
│   │   └── index.jsx               # React entry
│   └── data/
│       └── games.json              # Persistent game list (local)
├── public/
│   └── index.html                  # Electron window template
├── .github/
│   └── workflows/                  # (Phase 2: CI/CD)
├── .gitignore
├── package.json
├── CLAUDE.md                       # This file
├── HTPC_GameLauncher_SPEC.md       # Technical spec
└── README.md                       # User guide
```

---

## Known Blockers & Solutions

| Issue | Solution |
|-------|----------|
| Steam config path wrong on some Windows installs | Read from Registry: `HKEY_CURRENT_USER\Software\Valve\Steam` |
| Controller lag in Electron | May need input debouncing (50ms) + RAF loop |
| Game doesn't return focus to launcher | Implement 2-3s delay + explicit window focus call |
| libraryfolders.vdf parse errors | Use `vdf-parser` npm package (handles edge cases) |
| games.json permissions error | Fallback to user temp folder if AppData not writable |

---

## Controller Button Mapping (Hardcoded in Phase 1)

```javascript
const BUTTON_MAP = {
  0: 'A (Green)',      // Launch game
  1: 'B (Red)',        // Settings/back
  2: 'X (Blue)',       // Refresh Steam
  3: 'Y (Yellow)',     // Add manual game
  9: 'Start/Menu',     // Full restart
  // D-pad: axes[6] and axes[7]
};
```

Test with: `navigator.getGamepads()[0]` in DevTools

---

## Performance Targets

| Metric | Target |
|--------|--------|
| App startup | < 2s |
| Steam library load | < 3s |
| Controller input response | < 50ms |
| Game launch | < 1s (Steam), < 500ms (exe) |
| Menu navigation | 60fps smooth |
| Fullscreen mode | No stuttering |

---

## Git Workflow

### Commits
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Example: `feat: implement gamepad navigation in GameGrid`
- Keep commits small (one feature = one commit ideally)

### Branches
- `main`: stable, tested, ready to run
- `feat/feature-name`: new features
- `fix/bug-name`: bug fixes
- Delete after merge

### PR Template (if collaborating)
```markdown
## What
Brief description of change

## Why
Why this change needed

## Testing
- [ ] Tested locally with controller
- [ ] No console errors
- [ ] Verified against checklist
```

---

## Useful Commands

```bash
# Development
npm start                 # Run with hot reload
npm run build             # Build for production
npm run build-exe         # Create .exe installer

# Testing
npm test                  # Run tests (phase 2)
npm run lint             # Check code style

# Database/Data
npm run reset-games      # Clear games.json
npm run refresh-steam    # Force Steam library refresh

# Git
git status               # See changes
git log --oneline        # See commit history
git diff src/            # See code changes
```

---

## Resources

- **Electron Docs**: https://www.electronjs.org/docs
- **React Docs**: https://react.dev
- **Gamepad API**: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Steam VDF Parser**: https://www.npmjs.com/package/vdf-parser
- **8BitDo Controller**: Check firmware version on device, update if needed

---

## Session Notes Template

Copy this after each session:

```markdown
### Session: [DATE]

**Duration**: [TIME]  
**Checklist Progress**: [X/Y items completed]

**Completed**:
- Item 1
- Item 2

**Blockers**:
- Issue: Description
- Solution/Workaround: ...

**Next Session**:
- Start with: [Next item in checklist]
- Known issues to watch: ...
- Questions for Claude: ...

**Commit Hash**: [git log --oneline -1]
```

---

## Phase 2 Preview (NOT Phase 1)

These are ideas for after MVP is stable:

- Epic Games auto-detection (complex – own launcher format)
- Game Pass detection (requires Xbox API integration)
- Cover art/game artwork display
- Favorites system
- Recent games carousel
- Settings persistence (themes, controller sensitivity)
- Achievements display
- Playtime tracking
- Custom themes

---

## Final Notes

**On this project**:
- You have ADHD → prefer explicit pressure signals over subtle hints
- You like concrete steps → see Implementation Checklist above
- You like understanding code → expect comments on complex sections
- You prefer planning before coding → this document is your north star

**When stuck**:
1. Check this document (Blockers section)
2. Test with DevTools open
3. Commit your current state
4. Ask Claude with context (show recent code + error)

**Keep momentum**:
- Week 1 = foundation (boring but necessary)
- Week 2 = interaction (things start feeling real)
- Week 3 = polish (feels complete)

You've got this. Start small, test often, commit regularly.

---

**Last Updated**: March 30, 2026  
**Next Review**: After Week 1 completion
