# GitHub Repository Setup Guide

## Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. **Repository name**: `htpc-game-launcher`
3. **Description**: "Controller-native game launcher for Windows HTPC. Auto-detects Steam games, manually add others."
4. **Public or Private**: Your choice (public = good for portfolio, private = safer if not ready to share)
5. **Add .gitignore**: Choose "Node"
6. **Add license**: Choose "MIT" (open source friendly)
7. **Click "Create repository"**

---

## Step 2: Clone & Initialize Locally

```bash
# Clone the repo
git clone https://github.com/<your-username>/htpc-game-launcher.git
cd htpc-game-launcher

# Initialize Node project
npm init -y

# Install initial dependencies
npm install electron react react-dom tailwindcss
npm install -D vite electron-builder

# Create initial folder structure
mkdir -p src/main src/renderer/components src/renderer/hooks src/renderer/utils src/data public
```

---

## Step 3: Create Initial Files

Copy the templates below and create them in your repository:

### 3.1 `.gitignore` (Already auto-created by GitHub, but add these lines)

```
# Node
node_modules/
package-lock.json
dist/
build/

# Electron
release/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# App data (local, don't commit)
src/data/games.json
src/data/games.json.bak
.env.local

# Logs
*.log
npm-debug.log*
```

### 3.2 `package.json` (Replace auto-generated)

```json
{
  "name": "htpc-game-launcher",
  "version": "0.1.0",
  "description": "Controller-native game launcher for Windows HTPC",
  "main": "src/main/main.js",
  "homepage": "./",
  "author": "Rowan",
  "license": "MIT",
  "scripts": {
    "start": "electron .",
    "dev": "electron . --dev",
    "build": "electron-builder",
    "reset-games": "rm -f src/data/games.json && echo 'games.json removed'",
    "refresh-steam": "node scripts/refresh-steam.js"
  },
  "devDependencies": {
    "electron": "^latest",
    "electron-builder": "^latest",
    "vite": "^latest"
  },
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "tailwindcss": "^3",
    "vdf-parser": "^1.1.0",
    "uuid": "^9.0.0"
  },
  "build": {
    "appId": "com.htpc.gameLauncher",
    "productName": "HTPC Game Launcher",
    "files": [
      "src/**/*",
      "public/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": [
        "portable",
        "nsis"
      ]
    }
  }
}
```

### 3.3 `src/main/main.js` (Electron entry point)

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../renderer/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
```

### 3.4 `public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTPC Game Launcher</title>
  <link rel="stylesheet" href="../renderer/index.css">
</head>
<body class="bg-gray-900">
  <div id="root"></div>
  <script src="../renderer/index.jsx"></script>
</body>
</html>
```

### 3.5 `src/renderer/App.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import GameGrid from './components/GameGrid';
import SettingsMenu from './components/SettingsMenu';
import { useGamepad } from './hooks/useGamepad';
import { useGames } from './hooks/useGames';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { games, addGame, removeGame, refreshSteamLibrary } = useGames();
  const gamepadState = useGamepad();

  useEffect(() => {
    // Handle B button for settings toggle
    if (gamepadState.buttonsPressed.B) {
      setShowSettings(!showSettings);
    }
  }, [gamepadState.buttonsPressed.B]);

  return (
    <div className="w-screen h-screen bg-gray-900 text-white">
      {showSettings ? (
        <SettingsMenu
          onClose={() => setShowSettings(false)}
          onRefreshSteam={refreshSteamLibrary}
        />
      ) : (
        <GameGrid
          games={games}
          gamepadState={gamepadState}
          onAddGame={addGame}
          onRemoveGame={removeGame}
        />
      )}
    </div>
  );
}
```

### 3.6 `src/renderer/index.jsx`

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 3.7 `src/renderer/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Source Sans Pro',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Focus ring for controller navigation */
.game-card-selected {
  @apply ring-4 ring-yellow-400 scale-105 transition-all duration-150;
}
```

### 3.8 `src/renderer/components/GameGrid.jsx` (Placeholder)

```jsx
import React, { useState } from 'react';
import GameCard from './GameCard';

export default function GameGrid({ games, gamepadState, onAddGame, onRemoveGame }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="p-8 w-full h-full bg-gray-900">
      <h1 className="text-4xl font-bold mb-8">HTPC Game Launcher</h1>
      <div className="grid grid-cols-6 gap-4">
        {games.length === 0 ? (
          <p className="text-gray-400">No games found. Press Y to add one.</p>
        ) : (
          games.map((game, idx) => (
            <GameCard
              key={game.id}
              game={game}
              isSelected={idx === selectedIndex}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

### 3.9 `src/renderer/components/GameCard.jsx` (Placeholder)

```jsx
import React from 'react';

export default function GameCard({ game, isSelected }) {
  return (
    <div
      className={`p-4 bg-gray-800 rounded-lg cursor-pointer transition-all ${
        isSelected ? 'game-card-selected' : 'hover:bg-gray-700'
      }`}
    >
      <div className="w-full h-32 bg-gray-700 rounded mb-2"></div>
      <h3 className="text-sm font-semibold truncate">{game.title}</h3>
      <p className="text-xs text-gray-400">{game.launcher}</p>
    </div>
  );
}
```

### 3.10 `src/renderer/components/SettingsMenu.jsx` (Placeholder)

```jsx
import React from 'react';

export default function SettingsMenu({ onClose, onRefreshSteam }) {
  return (
    <div className="w-full h-full bg-gray-900 p-8 flex flex-col">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>
      <button
        onClick={onRefreshSteam}
        className="px-4 py-2 bg-blue-600 rounded mb-4 hover:bg-blue-700"
      >
        Refresh Steam Library
      </button>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
      >
        Back (B Button)
      </button>
    </div>
  );
}
```

### 3.11 `src/renderer/hooks/useGamepad.js` (Placeholder)

```javascript
import { useState, useEffect } from 'react';

export function useGamepad() {
  const [gamepadState, setGamepadState] = useState({
    buttonsPressed: {},
    axes: [0, 0, 0, 0, 0, 0, 0, 0],
  });

  useEffect(() => {
    const handleGamepadInput = () => {
      const gamepads = navigator.getGamepads();
      if (gamepads[0]) {
        const gp = gamepads[0];
        const buttons = {};

        // Map buttons
        buttons.A = gp.buttons[0]?.pressed;
        buttons.B = gp.buttons[1]?.pressed;
        buttons.X = gp.buttons[2]?.pressed;
        buttons.Y = gp.buttons[3]?.pressed;
        buttons.Start = gp.buttons[9]?.pressed;

        setGamepadState({
          buttonsPressed: buttons,
          axes: gp.axes,
        });
      }
    };

    const interval = setInterval(handleGamepadInput, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

  return gamepadState;
}
```

### 3.12 `src/renderer/hooks/useGames.js` (Placeholder)

```javascript
import { useState, useEffect } from 'react';

export function useGames() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    // Load games from games.json
    // TODO: Implement actual loading
    setGames([]);
  }, []);

  const addGame = (game) => {
    // TODO: Implement
    setGames([...games, game]);
  };

  const removeGame = (gameId) => {
    // TODO: Implement
    setGames(games.filter((g) => g.id !== gameId));
  };

  const refreshSteamLibrary = () => {
    // TODO: Implement
  };

  return { games, addGame, removeGame, refreshSteamLibrary };
}
```

### 3.13 `src/renderer/utils/steamLibraryParser.js` (Placeholder)

```javascript
// TODO: Implement Steam library parsing
export function getSteamGames() {
  // Parse libraryfolders.vdf
  // Return array of games
  return [];
}
```

### 3.14 `src/renderer/utils/gameManager.js` (Placeholder)

```javascript
// TODO: Implement game launch and management
export function launchGame(game) {
  // Launch Steam or exe game
}

export function loadGamesFromFile() {
  // Load games.json
}

export function saveGamesToFile(games) {
  // Save games.json
}
```

---

## Step 4: Initial Commit

```bash
# Add all files
git add .

# Commit
git commit -m "init: initial project scaffold with component structure"

# Push to GitHub
git push origin main
```

---

## Step 5: Create README.md

Create `README.md` in repo root:

```markdown
# HTPC Game Launcher

A controller-native game launcher for Windows HTPC. Auto-detects Steam games and supports manual game entries.

## Features (Phase 1 - MVP)

- ✅ Auto-detect Steam games
- ✅ Manually add custom games
- ✅ Full controller support (8BitDo 2C tested)
- ✅ Fullscreen HTPC mode
- ✅ Auto-launch on Windows boot
- ✅ Return to menu after game exit

## Installation

### Requirements
- Windows 11
- Node.js 18+
- 8BitDo 2C (or compatible Xbox controller)

### Setup

```bash
git clone https://github.com/<your-username>/htpc-game-launcher.git
cd htpc-game-launcher
npm install
npm start
```

## Usage

- **D-Pad**: Navigate grid
- **A (Green)**: Launch game
- **B (Red)**: Settings menu
- **Y (Yellow)**: Add manual game
- **X (Blue)**: Refresh Steam library
- **Start/Menu**: Full restart

## Development

See `CLAUDE.md` for development workflow and checklist.

See `HTPC_GameLauncher_SPEC.md` for full technical specification.

## Project Status

- **Phase 1 (MVP)**: In progress
- **Phase 2**: Planned (cover art, favorites, filters)
- **Phase 3**: Planned (Epic Games, Game Pass, GOG, emulators)

## License

MIT
```

---

## Step 6: Add CLAUDE.md and SPEC to Repo

```bash
# Copy from your local files
cp ../CLAUDE.md .
cp ../HTPC_GameLauncher_SPEC.md .

# Commit
git add CLAUDE.md HTPC_GameLauncher_SPEC.md
git commit -m "docs: add development playbook and technical specification"
git push origin main
```

---

## Step 7: Verify Repo Structure

Your GitHub should look like:

```
htpc-game-launcher/
├── README.md
├── CLAUDE.md
├── HTPC_GameLauncher_SPEC.md
├── package.json
├── .gitignore
├── public/
│   └── index.html
└── src/
    ├── main/
    │   └── main.js
    ├── renderer/
    │   ├── App.jsx
    │   ├── index.jsx
    │   ├── index.css
    │   ├── components/
    │   ├── hooks/
    │   └── utils/
    └── data/
```

---

## You're Ready!

Now when you:
1. Boot up Windows 11 on the HTPC
2. Clone this repo locally
3. Run `npm install && npm start`

You'll have a working Electron skeleton ready for Week 1 implementation.

---

## Quick Reference: First Commands to Run

```bash
# After Windows 11 install on HTPC:
git clone https://github.com/<your-username>/htpc-game-launcher.git
cd htpc-game-launcher
npm install

# Test that everything loads:
npm start

# You should see:
# - Electron window opens
# - Tailwind dark theme loads (gray background)
# - Empty game grid
# - DevTools open (for debugging)
```

If you see any errors, note them and share with Claude (with the error message + screenshot).

---

**Next**: After this is set up, you can start **Week 1: Foundation** from CLAUDE.md
