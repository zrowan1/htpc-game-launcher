# HTPC Game Launcher – Quick Start Checklist

## Pre-Development (Before Week 1)

**Hardware Ready?**
- [ ] Windows 11 installed on HTPC
- [ ] 8BitDo 2C paired and working
- [ ] Network/internet available for npm install
- [ ] Monitor resolution 1920x1080 or higher

**Software Ready?**
- [ ] Node.js 18+ installed (`node --version` in terminal)
- [ ] Git installed (`git --version`)
- [ ] GitHub account created
- [ ] VS Code or editor installed (optional but recommended)

**Knowledge?**
- [ ] Read `HTPC_GameLauncher_SPEC.md` (tech overview)
- [ ] Read `CLAUDE.md` (development workflow)
- [ ] Understand Phase 1 scope (Steam auto-detect + manual add)

---

## GitHub Setup (First Time Only)

- [ ] Create repo: https://github.com/new → `htpc-game-launcher`
- [ ] Add MIT license + Node .gitignore
- [ ] Clone locally: `git clone <repo-url>`
- [ ] Copy all template files from `GITHUB_SETUP.md`
- [ ] First commit: `git commit -m "init: project scaffold"`
- [ ] Push to GitHub: `git push origin main`

---

## Local Development Setup (HTPC)

**Clone & Install**
```bash
git clone https://github.com/<your-username>/htpc-game-launcher.git
cd htpc-game-launcher
npm install
```

- [ ] No npm errors after `npm install`
- [ ] `npm start` launches Electron window
- [ ] Tailwind CSS loaded (gray background visible)
- [ ] DevTools opens (Ctrl+Shift+I)

**Controller Test**
- [ ] Connect 8BitDo 2C
- [ ] Go to gamepad-tester.com in browser
- [ ] All 8 buttons light up when pressed
- [ ] D-pad registers correctly

---

## Week 1: Foundation (Follow CLAUDE.md)

### 1.1 Project Setup
- [ ] `npm start` runs without errors
- [ ] No console warnings on startup

### 1.2 Steam Library Parser
- [ ] Reads Steam config path correctly
- [ ] Parses libraryfolders.vdf without errors
- [ ] Returns ≥3 test Steam games

### 1.3 Games.json Persistence
- [ ] File auto-creates if missing
- [ ] Can add/remove games manually
- [ ] Data persists after app restart

### 1.4 Basic React Components
- [ ] App.jsx loads
- [ ] GameGrid renders (even if empty)
- [ ] No React warnings in console

---

## Week 2: Interaction & Launch

### 2.1 Gamepad Input
- [ ] Controller connected on startup
- [ ] D-pad navigation works
- [ ] All 8 buttons register in console

### 2.2 Game Selection
- [ ] Selected game highlights
- [ ] Smooth navigation between games
- [ ] Wraps around (down from last → first)

### 2.3 Game Launch
- [ ] Launch Steam game (Portal 2 or other test game)
- [ ] Game starts in Steam client
- [ ] Game closes normally
- [ ] Launcher returns to menu

### 2.4 Manual Game Add
- [ ] Y button opens add dialog
- [ ] Can enter title + exe path
- [ ] Game saves and appears in grid
- [ ] Persists after restart

### 2.5 Settings Menu
- [ ] B button opens settings
- [ ] Can refresh Steam library
- [ ] Can exit to desktop

---

## Week 3: Polish & Integration

### 3.1 Windows Autostart
- [ ] App launches fullscreen on Windows boot
- [ ] No window decorations

### 3.2 Controller Detection
- [ ] Shows message if controller not detected
- [ ] Displays button mapping on startup

### 3.3 Error Handling
- [ ] Missing Steam: graceful fallback
- [ ] Missing game exe: error message, no crash
- [ ] Corrupted games.json: auto-backup + recreate

### 3.4 Testing
- [ ] Launch 3+ Steam games (all exit properly)
- [ ] Launch 2+ manual games (all exit properly)
- [ ] Reboot Windows, verify autostart
- [ ] No console errors in DevTools

### 3.5 Documentation
- [ ] README.md complete
- [ ] Code comments on complex sections
- [ ] No debug logs in production code
- [ ] Clean commit history

---

## Debugging Quick Links

**Controller not working?**
- Restart app
- Check device manager (Windows)
- Try gamepad-tester.com
- Check 8BitDo firmware (online)

**Game won't launch?**
- Check DevTools console (Ctrl+Shift+I)
- Verify Steam app ID is correct
- Verify exe path exists (if manual game)
- Try launching in Steam directly first

**Fullscreen issues?**
- Check primary monitor resolution
- Test with 1920x1080 or higher
- Check Electron BrowserWindow config

**games.json corrupted?**
```bash
npm run reset-games  # Delete and recreate
```

---

## Git Workflow (Simple Version)

**Start work:**
```bash
git checkout -b feat/feature-name
```

**After changes:**
```bash
git add .
git commit -m "feat: description of what changed"
git push origin feat/feature-name
```

**Keep it clean:**
- One feature = one branch
- Commit after each checklist item
- Use clear commit messages

---

## Important Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Development playbook (read first!) |
| `HTPC_GameLauncher_SPEC.md` | Technical specification |
| `package.json` | Dependencies + npm scripts |
| `src/main/main.js` | Electron entry point |
| `src/renderer/App.jsx` | React root component |
| `src/data/games.json` | Persistent game list (local) |

---

## When Stuck

1. **Check CLAUDE.md** → Blockers section
2. **Open DevTools** → Ctrl+Shift+I → Console tab
3. **Read error message carefully** → Google it
4. **Try isolation** → Test one feature at a time
5. **Commit & reset** → `git reset --hard HEAD`
6. **Ask Claude** → Share error + recent code + what you tried

---

## Success Criteria (Minimum Viable)

When Phase 1 is done, you should be able to:

1. Boot Windows 11 → App launches fullscreen automatically
2. See list of your Steam games
3. Select a game with controller → Press A → Game launches
4. Exit game → App returns to menu
5. Add a custom game with Y button → Game appears + launches
6. Everything works with controller only (no mouse needed)

---

## Speed Tips (For ADHD Motivation)

- **Don't aim for perfect** → Aim for working
- **Commit after every checklist item** → Visible progress
- **Test early and often** → Dopamine from things working
- **Week 1 is boring but necessary** → Week 2 is where it gets fun
- **If stuck > 30 min** → Commit, document, ask Claude

---

**Version**: 1.0  
**Last Updated**: March 30, 2026  
**Status**: Ready to implement
