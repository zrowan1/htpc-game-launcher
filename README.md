# HTPC Game Launcher

A controller-native game launcher for Windows HTPC. Auto-detects Steam games and supports manual game entries.

## Features (Phase 1 - MVP)

- Auto-detect Steam games
- Manually add custom games
- Full controller support (8BitDo 2C tested)
- Fullscreen HTPC mode
- Auto-launch on Windows boot
- Return to menu after game exit

## Installation

### Requirements
- Windows 11
- Node.js 18+
- 8BitDo 2C (or compatible Xbox controller)

### Setup

```bash
git clone https://github.com/zrowan1/htpc-game-launcher.git
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
