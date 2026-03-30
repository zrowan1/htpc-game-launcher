# HTPC Game Launcher – Technical Specification

**Project**: Universal Game Launcher voor Windows HTPC  
**Version**: 1.0 (Phase 1)  
**Status**: Planning  
**Author**: Rowan  
**Date**: March 2026

---

## 1. Project Overview

Een **controller-native game launcher** voor Windows HTPC dat:
- Games van Steam automatisch detecteert
- Andere games/launchers handmatig kunnen worden toegevoegd
- Volledig bedienbaar met controller (d-pad navigatie, A/B knoppen)
- Automatisch opstart in fullscreen op Windows boot
- Na game exit terugkeert naar launcher menu

**Vergelijkbaar met**: Steam Big Picture Mode, maar launcher-agnostisch

---

## 2. Phase 1 Scope (MVP)

### Must Have (v1.0)
- [ ] Controller-friendly grid UI (navigatie, game select, launch)
- [ ] Steam game auto-detection (library via Steam API / local config)
- [ ] Manual game entry (title, exe path, artwork)
- [ ] Game launching (Steam games via Steam command, manual games via exe)
- [ ] Return to menu after game exit
- [ ] Windows autostart (launch on boot in fullscreen)
- [ ] Persistent game list storage (JSON file)

### Nice to Have (v1.1+)
- [ ] Game artwork/cover images
- [ ] Search / filter games
- [ ] Favorites / recent games
- [ ] Settings menu (brightness, audio, etc.)
- [ ] Controller button mapping display
- [ ] Dark/light theme toggle

### Out of Scope (Phase 2+)
- [ ] Epic Games auto-detection
- [ ] Game Pass auto-detection
- [ ] GOG auto-detection
- [ ] Standalone exe scanning
- [ ] Emulator integration

---

## 3. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Electron + React | Desktop app, no browser needed, full control over window, Gamepad API support |
| **UI Framework** | Tailwind CSS | Quick styling, responsive, dark mode built-in |
| **State Management** | React hooks (useState) | Simple for MVP, no need for Redux yet |
| **Game Data** | JSON file (local) | No backend needed, portable, easy to edit manually |
| **Steam Integration** | steamapps/libraryfolders.vdf parsing | No API key needed, reads local Steam config |
| **Game Launching** | Node.js child_process | Cross-launcher (Steam via steam://, exe direct) |
| **Controller Input** | Gamepad API (browser standard) | Works in Electron, built-in support, 8BitDo compatible |
| **Windows Autostart** | Electron auto-launcher + Registry/Task Scheduler | Reliable, user configurable |

---

## 4. Architecture

### 4.1 Directory Structure

```
htpc-launcher/
├── src/
│   ├── main/
│   │   └── main.js                 # Electron main process
│   ├── renderer/
│   │   ├── App.jsx                 # Root React component
│   │   ├── components/
│   │   │   ├── GameGrid.jsx        # Game list grid
│   │   │   ├── GameCard.jsx        # Single game card
│   │   │   ├── SettingsMenu.jsx    # (Phase 2)
│   │   │   └── ControllerInfo.jsx  # Button mapping display
│   │   ├── hooks/
│   │   │   ├── useGamepad.js       # Gamepad input handling
│   │   │   └── useGames.js         # Game data loading
│   │   ├── utils/
│   │   │   ├── steamLibraryParser.js   # Parse Steam config
│   │   │   ├── gameManager.js          # Add/remove/launch games
│   │   │   └── gamepadMapper.js        # Map controller buttons to actions
│   │   ├── index.css               # Tailwind + custom styles
│   │   └── index.jsx               # React entry point
│   └── data/
│       └── games.json              # Persistent game list (auto-created)
├── public/
│   └── index.html                  # Electron window template
├── package.json
└── README.md
```

### 4.2 Data Flow

```
Electron Main
    ↓
    ├─→ Load Steam library (steamLibraryParser.js)
    ├─→ Load manual games (games.json)
    ├─→ Spawn React renderer
    │
    └─→ React Component Tree
        ├─→ GameGrid (displays games)
        ├─→ Gamepad listener (useGamepad hook)
        │   └─→ Emit navigation/select events
        └─→ Game launch handler
            └─→ Execute via child_process
```

### 4.3 Game Launch Flow

```
User selects game via controller
    ↓
GameCard emits onLaunch event
    ↓
gameManager.launchGame()
    ├─→ If Steam: spawn `steam://rungameid/APPID`
    ├─→ If manual: spawn exe directly (path from games.json)
    └─→ Monitor process exit
        ↓
    Process exits → Return to menu
```

---

## 5. Data Models

### 5.1 Game Object

```javascript
{
  id: "unique-identifier",           // uuid or steamAppId
  title: "Game Title",
  launcher: "steam" | "manual",      // Game source
  steamAppId: 12345,                 // Only if launcher === "steam"
  exePath: "C:\\Games\\game.exe",    // Only if launcher === "manual"
  artworkUrl: "local/path/or/url",   // (Phase 1.1)
  addedDate: "2025-03-30",
  lastPlayed: "2025-03-29"           // (Phase 1.1)
}
```

### 5.2 games.json Structure

```json
{
  "version": 1,
  "steamLibraryPath": "C:\\Program Files (x86)\\Steam\\steamapps",
  "lastUpdated": "2025-03-30T10:00:00Z",
  "games": [
    {
      "id": "steam_12345",
      "title": "Portal 2",
      "launcher": "steam",
      "steamAppId": 620,
      "addedDate": "2025-03-30"
    },
    {
      "id": "manual_001",
      "title": "My Custom Game",
      "launcher": "manual",
      "exePath": "C:\\MyGames\\custom.exe",
      "addedDate": "2025-03-30"
    }
  ]
}
```

---

## 6. Controller Mapping (Phase 1)

**Assumed Controller**: 8BitDo 2C (or Xbox-compatible)

| Button | Action |
|--------|--------|
| **D-Pad Up** | Navigate up |
| **D-Pad Down** | Navigate down |
| **D-Pad Left** | Page left (6 games per row) |
| **D-Pad Right** | Page right |
| **A (Green)** | Launch selected game |
| **B (Red)** | Open settings / back |
| **Y (Yellow)** | Add manual game |
| **X (Blue)** | Refresh Steam library |
| **Menu/Start** | Full restart |

Controller info overlay available via button mapping display.

---

## 7. Implementation Roadmap

### Phase 1.0 (Weeks 1-2)
- [x] Project setup (Electron + React scaffolding)
- [x] Steam library parser (read libraryfolders.vdf)
- [x] Games.json persistence
- [x] Basic React component tree
- [x] Gamepad input handler
- [x] Game launch logic
- [x] Manual game add/remove
- [x] Windows autostart setup
- [x] Testing & bug fixes

### Phase 1.1 (Week 3+)
- [ ] Game artwork/covers
- [ ] Favorites system
- [ ] Search/filter
- [ ] Settings menu (placeholder)

### Phase 2 (TBD)
- [ ] Epic Games detection
- [ ] Game Pass detection
- [ ] GOG detection

### Phase 3 (TBD)
- [ ] Standalone exe auto-scanning
- [ ] Emulator integration
- [ ] Themes/customization

---

## 8. Key Technical Decisions

### Why Electron?
- Full control over window (fullscreen, no chrome)
- Gamepad API works natively
- Can spawn processes (needed for game launching)
- Single codebase for future macOS/Linux versions

### Why parse Steam locally instead of API?
- No Steam API key needed
- libraryfolders.vdf is always local and readable
- Instant, no network calls
- Works offline

### Why JSON instead of database?
- Phase 1 scope is small enough
- User can edit manually if needed
- No extra dependencies
- Easy to migrate to DB later

### Why manual game add instead of scanning?
- Scanning folders is error-prone (finds assets, mods, duplicates)
- User control = less clutter
- Faster Phase 1 completion
- Can add scanning later if desired

---

## 9. Known Unknowns & Risks

| Risk | Mitigation |
|------|-----------|
| Steam config path differs per Windows install | Read from Registry: `HKEY_CURRENT_USER\Software\Valve\Steam` |
| Gamepad input lag or missed inputs | Test thoroughly, add input debouncing if needed |
| Game doesn't return control after exit | Implement timeout (30s) + manual return button |
| Exe paths break after Windows update/game move | Store in JSON, user can edit manually |
| Controller not detected on startup | Display controller check on launch, helpful UI messages |

---

## 10. Success Criteria (Phase 1)

- [ ] Launcher starts in fullscreen on Windows boot
- [ ] Steam library loads and displays without errors
- [ ] Can select and launch any Steam game via controller
- [ ] Can manually add 3+ non-Steam games
- [ ] Controller navigation feels responsive (no lag)
- [ ] After game exit, returns to launcher menu
- [ ] Settings accessible (even if empty in v1.0)
- [ ] Repo is clean, documented, ready for Phase 2

---

## 11. Dependencies (npm packages)

```json
{
  "devDependencies": {
    "electron": "^latest",
    "react": "^18",
    "react-dom": "^18",
    "tailwindcss": "^3"
  },
  "dependencies": {
    "vdf-parser": "^1",  // Parse Steam vdf files
    "uuid": "^9"         // Generate unique IDs
  }
}
```

---

## 12. Next Steps

1. **Create skeleton Electron + React app**
2. **Build Steam library parser** (read vdf, extract app IDs/names)
3. **Implement games.json persistence**
4. **Build GameGrid + GameCard components**
5. **Implement Gamepad API hook**
6. **Connect game launch logic**
7. **Test with 5-10 real Steam games**
8. **Add manual game entry UI**
9. **Setup Windows autostart**
10. **Polish & document**

---

## Notes

- All paths should use cross-platform helpers (`path.join()`, not string concat)
- Electron auto-update not included in Phase 1 (can add later)
- No analytics/telemetry
- Simple dark theme by default (Tailwind dark: class)
- Test on 8BitDo controller specifically once setup is ready

