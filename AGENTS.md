# AGENTS.md - AI Agent Guidelines for HTPC Game Launcher

## Overview

This document provides guidelines for AI agents working on the HTPC Game Launcher project. Following these conventions ensures consistency and maintainability.

## UI/UX Design System - Liquid Glass

Het HTPC Game Launcher gebruikt een **Liquid Glass** design systeem geïnspireerd door Apple's visionOS en iOS 18. Dit creëert een premium, diepgaande gebruikerservaring met translucente lagen, lichtbreking en vloeiende animaties.

### Design Principes

1. **Diepte door lagen**: Meerdere semi-transparante lagen creëren visuele diepte
2. **Licht en schaduw**: Realistische verlichting met ambient light effects
3. **Vloeistof-achtige overgangen**: Soepele, organische animaties (spring physics)
4. **Focus op content**: Game artwork staat centraal, UI elementen ondersteunen
5. **Premium gevoel**: Glanzende oppervlakken, subtiele reflecties, high contrast

### Kleurenpalet

```css
/* Primaire Achtergrond - Diepzwart met subtiele blauwe ondertoon */
--bg-primary: rgba(10, 10, 15, 0.95);
--bg-secondary: rgba(20, 20, 30, 0.85);
--bg-tertiary: rgba(30, 30, 45, 0.70);

/* Glass Effect Kleuren */
--glass-bg: rgba(255, 255, 255, 0.08);
--glass-bg-hover: rgba(255, 255, 255, 0.15);
--glass-bg-active: rgba(255, 255, 255, 0.20);
--glass-border: rgba(255, 255, 255, 0.12);
--glass-border-highlight: rgba(255, 255, 255, 0.25);
--glass-shadow: rgba(0, 0, 0, 0.40);

/* Accent Kleuren - Levendig maar niet schreeuwend */
--accent-primary: rgba(120, 180, 255, 0.90);      /* Cool blue glow */
--accent-secondary: rgba(180, 120, 255, 0.85);    /* Subtle purple */
--accent-success: rgba(100, 220, 150, 0.90);      /* Soft green */
--accent-warning: rgba(255, 200, 100, 0.90);      /* Warm amber */
--accent-danger: rgba(255, 120, 120, 0.90);       /* Soft red */

/* Text Kleuren */
--text-primary: rgba(255, 255, 255, 0.95);
--text-secondary: rgba(255, 255, 255, 0.70);
--text-tertiary: rgba(255, 255, 255, 0.50);
--text-muted: rgba(255, 255, 255, 0.30);
```

### Glass Morphism Effecten

#### Basis Glass Card
```css
.glass-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

#### Game Card Specifiek
```css
.game-card {
  /* Basis glass effect */
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.03) 50%,
    rgba(0, 0, 0, 0.2) 100%
  );
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  
  /* Premium schaduw met diepte */
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.4),
    0 1px 3px rgba(255, 255, 255, 0.05) inset,
    0 -1px 2px rgba(0, 0, 0, 0.2) inset;
  
  /* Subtiele rand reflectie */
  position: relative;
  overflow: hidden;
}

/* Lichtreflectie bovenop card */
.game-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: skewX(-25deg);
  transition: left 0.6s ease;
}

.game-card:hover::before {
  left: 150%;
}
```

#### Geselecteerde State (Focused)
```css
.game-card.focused {
  background: linear-gradient(
    180deg,
    rgba(120, 180, 255, 0.15) 0%,
    rgba(120, 180, 255, 0.05) 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
  border-color: rgba(120, 180, 255, 0.4);
  box-shadow: 
    0 0 0 2px rgba(120, 180, 255, 0.3),
    0 8px 32px rgba(120, 180, 255, 0.2),
    0 4px 24px rgba(0, 0, 0, 0.5);
  transform: scale(1.05);
  z-index: 10;
}

/* Glow animatie */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 
      0 0 0 2px rgba(120, 180, 255, 0.3),
      0 8px 32px rgba(120, 180, 255, 0.2);
  }
  50% {
    box-shadow: 
      0 0 0 3px rgba(120, 180, 255, 0.4),
      0 12px 40px rgba(120, 180, 255, 0.3);
  }
}

.game-card.focused {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

### Achtergrond Effecten

#### Gelaagde Achtergrond
```css
.app-background {
  /* Basis kleur */
  background: radial-gradient(
    ellipse at 50% 0%,
    rgba(30, 35, 60, 1) 0%,
    rgba(10, 10, 15, 1) 50%,
    rgba(5, 5, 8, 1) 100%
  );
  
  /* Subtiele noise textuur voor diepte */
  background-image: 
    radial-gradient(ellipse at 50% 0%, rgba(30, 35, 60, 1) 0%, rgba(10, 10, 15, 1) 50%, rgba(5, 5, 8, 1) 100%),
    url('data:image/svg+xml,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noise)" opacity="0.03"/></svg>');
}

/* Floating ambient orbs */
.ambient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  pointer-events: none;
}

.ambient-orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(120, 180, 255, 0.8), transparent 70%);
  top: -200px;
  right: -200px;
}

.ambient-orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(180, 120, 255, 0.6), transparent 70%);
  bottom: -150px;
  left: -150px;
}
```

### Typografie

```css
/* Hoofdtitels - Clean, modern */
--font-heading: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-body: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font Weights */
--weight-light: 300;
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;

/* Schaal voor HTPC (grotere tekst voor afstand) */
--text-xs: 14px;      /* Hulpinfo */
--text-sm: 16px;      /* Labels */
--text-base: 20px;    /* Body text */
--text-lg: 24px;      /* Subtitels */
--text-xl: 32px;      /* Titels */
--text-2xl: 48px;     /* Hoofdtitels */
--text-3xl: 64px;     /* Hero text */

/* Line heights */
--leading-tight: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Letter spacing */
--tracking-tight: -0.02em;
--tracking-normal: 0;
--tracking-wide: 0.05em;
```

### Animaties & Transities

#### Timing Functies
```css
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);

/* Duur */
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 800ms;
```

#### Component Animaties
```css
/* Card verschijning */
@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.game-card {
  animation: card-enter 0.6s var(--ease-out-expo) backwards;
  animation-delay: calc(var(--card-index) * 50ms);
}

/* Hover effect */
.game-card {
  transition: 
    transform 0.3s var(--ease-spring),
    box-shadow 0.3s var(--ease-smooth),
    border-color 0.2s var(--ease-smooth);
}

.game-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(120, 180, 255, 0.1);
}

/* Modal/Dialog verschijning */
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
    backdrop-filter: blur(20px);
  }
}

.modal-overlay {
  animation: modal-enter 0.4s var(--ease-out-expo);
}

/* Loading shimmer */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.loading-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### Layout Grid & Spacing

```css
/* HTPC-optimized spacing */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
--space-8: 64px;
--space-9: 96px;

/* Game Grid */
--grid-columns: 4;        /* 4 games per rij op 1080p */
--grid-gap: 32px;         /* Ruimte tussen cards */
--card-aspect-ratio: 3/4; /* Portrait game covers */
--card-border-radius: 20px;

/* Margins voor TV viewing */
--safe-area-top: 60px;
--safe-area-bottom: 100px;
--safe-area-sides: 80px;
```

### Componenten Specificaties

#### Game Card
- **Afmetingen**: Flexibel, aspect ratio 3:4
- **Border radius**: 20px
- **Padding**: 0 (afbeelding tot edge)
- **Titel overlay**: Gradient van onderen, semi-transparant
- **Hover**: Scale 1.02, lift -8px, glow effect
- **Focused**: Scale 1.05, blue border glow, pulse animation

#### Settings Menu (Glass Sheet)
```css
.settings-sheet {
  background: linear-gradient(
    180deg,
    rgba(25, 25, 35, 0.95) 0%,
    rgba(15, 15, 25, 0.98) 100%
  );
  backdrop-filter: blur(40px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px 32px 0 0;
  box-shadow: 
    0 -10px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

#### Buttons
```css
.button-glass {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 16px 32px;
  font-weight: 600;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  transition: all 0.2s var(--ease-spring);
}

.button-glass:hover {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.18) 0%,
    rgba(255, 255, 255, 0.1) 100%
  );
  border-color: rgba(255, 255, 255, 0.25);
  transform: scale(1.02);
}

.button-glass:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.08);
}

/* Primary button met accent */
.button-primary {
  background: linear-gradient(
    180deg,
    rgba(120, 180, 255, 0.3) 0%,
    rgba(120, 180, 255, 0.15) 100%
  );
  border-color: rgba(120, 180, 255, 0.4);
  box-shadow: 
    0 4px 20px rgba(120, 180, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
```

#### Scrollbar (Custom)
```css
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
```

### Implementatie Richtlijnen

#### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.15)',
          active: 'rgba(255, 255, 255, 0.20)',
          border: 'rgba(255, 255, 255, 0.12)',
        },
        accent: {
          DEFAULT: 'rgba(120, 180, 255, 0.90)',
          glow: 'rgba(120, 180, 255, 0.30)',
        },
      },
      backdropBlur: {
        glass: '20px',
        modal: '40px',
      },
      borderRadius: {
        'glass': '24px',
        'card': '20px',
        'button': '16px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(120, 180, 255, 0.1)',
        'focused': '0 0 0 2px rgba(120, 180, 255, 0.3), 0 8px 32px rgba(120, 180, 255, 0.2)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
}
```

#### CSS Custom Properties Setup
```css
/* index.css - Vooraf definiëren */
:root {
  /* Alle kleuren en waarden hier */
}

/* Electron specifiek */
@supports (backdrop-filter: blur(20px)) {
  .glass-card {
    backdrop-filter: blur(20px) saturate(180%);
  }
}

/* Fallback voor oudere systemen */
@supports not (backdrop-filter: blur(20px)) {
  .glass-card {
    background: rgba(30, 30, 45, 0.95);
  }
}
```

### Performance Consideraties

1. **Backdrop-filter spaarzaam gebruiken**: Alleen op cards die het nodig hebben
2. **Will-change hints**: Toevoegen op geanimeerde elementen
3. **GPU Acceleration**: Transform en opacity voor animaties
4. **Lazy loading**: Game artwork pas laden wanneer in viewport
5. **Reduce motion**: Respecteer `prefers-reduced-motion` media query

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Best Practices

✅ **DO**:
- Gebruik semi-transparante overlays voor leesbaarheid
- Zorg voor voldoende contrast (WCAG 2.1 AA)
- Test op verschillende achtergronden
- Gebruik animaties om focus te leiden
- Maak interactieve elementen duidelijk zichtbaar

❌ **DON'T**:
- Gebruik teveel lagen (max 3-4)
- Maak text onleesbaar met blur
- Overdrijf met glow effects
- Vergeet focus indicators voor toetsenbord
- Gebruik harde schaduwen (soft only)

## Architecture Overview

This document provides guidelines for AI agents working on the HTPC Game Launcher project. Following these conventions ensures consistency and maintainability.

## Architecture Overview

This is an Electron + React application with a clear separation between:

- **Main Process** (`src/main/`): Node.js environment, file system access, system integration
- **Renderer Process** (`src/renderer/`): React UI, browser environment
- **Shared** (`src/shared/`): Constants and types used by both processes

## Directory Structure

```
src/
├── main/                       # Electron main process
│   ├── main.js                # Entry point
│   ├── preload.js             # Secure API exposure
│   ├── ipcHandlers.js         # IPC handler registration
│   └── services/              # Business logic
│       ├── gameService.js     # Game CRUD + launching
│       └── steamService.js    # Steam integration
├── renderer/                   # React UI
│   ├── index.jsx              # React entry
│   ├── App.jsx                # Root component
│   ├── components/            # React components
│   │   ├── error-boundaries/  # Error handling
│   │   ├── GameGrid.jsx
│   │   ├── GameCard.jsx
│   │   ├── SettingsMenu.jsx
│   │   └── AddGameDialog.jsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useGames.js
│   │   ├── useGamepad.js
│   │   └── useKeyboard.js
│   ├── services/              # API layer (calls main process)
│   │   ├── gameApi.js
│   │   ├── steamApi.js
│   │   └── appApi.js
│   └── utils/                 # Pure utility functions
│       ├── gameUtils.js
│       └── gamepadUtils.js
└── shared/                     # Shared constants
    └── constants.js           # ALL constants in one place
```

## Naming Conventions

### Files

- **Services**: `[feature]Service.js` or `[feature]Api.js` (business logic vs API layer)
- **Hooks**: `use[Feature].js`
- **Components**: `[ComponentName].jsx`
- **Utils**: `[feature]Utils.js`
- **Constants**: `constants.js` (singular, in shared/)

### Functions

- **Services**: camelCase, descriptive names
  - `loadGames()`, `addGame()`, `launchGame()`
- **Hooks**: camelCase, prefixed with `use`
  - `useGames()`, `useGamepad()`
- **Components**: PascalCase
  - `GameGrid`, `SettingsMenu`
- **Utils**: camelCase, action-oriented
  - `sortGamesByTitle()`, `validateGame()`

### IPC Channels

All IPC communication uses constants from `shared/constants.js`:

```javascript
// ✅ Good
import { IPC_CHANNELS } from '../shared/constants';
ipcMain.handle(IPC_CHANNELS.LOAD_GAMES, ...)

// ❌ Bad
ipcMain.handle('load-games', ...)
```

## Code Organization Rules

### 1. Never Duplicate File Names

❌ **DON'T:**
```
src/main/gameManager.js
src/renderer/utils/gameManager.js
```

✅ **DO:**
```
src/main/services/gameService.js     # Business logic in main
src/renderer/services/gameApi.js     # API layer in renderer
src/renderer/utils/gameUtils.js      # Pure utilities in renderer
```

### 2. Clear Separation of Concerns

**Main Process (Node.js):**
- ✅ File system operations
- ✅ Process spawning
- ✅ System integration (Steam, etc.)
- ✅ Data persistence

**Renderer Process (Browser):**
- ✅ UI rendering
- ✅ User input handling
- ✅ State management
- ✅ API calls to main process

**Shared:**
- ✅ Constants
- ✅ Type definitions (if using TypeScript)
- ✅ Pure utility functions (no side effects)

### 3. IPC Communication Pattern

**Main Process** (`ipcHandlers.js`):
```javascript
ipcMain.handle(IPC_CHANNELS.LAUNCH_GAME, async (_event, game) => {
  try {
    await gameService.launchGame(game);
    return { success: true };
  } catch (error) {
    console.error('[IPC] Error:', error);
    throw error;
  }
});
```

**Renderer** (`services/gameApi.js`):
```javascript
export async function launchGame(game) {
  const api = getApi();
  if (!api) {
    console.warn('[GameApi] Not in Electron');
    return;
  }
  return api.launchGame(game);
}
```

### 4. Error Handling

Always use try/catch in IPC handlers and services:

```javascript
// Main process
async function someOperation() {
  try {
    const result = await riskyOperation();
    return result;
  } catch (error) {
    console.error('[ServiceName] Error:', error.message);
    throw error; // Re-throw for IPC handler to catch
  }
}

// IPC handler
ipcMain.handle(IPC_CHANNELS.SOME_OP, async () => {
  try {
    return await someOperation();
  } catch (error) {
    console.error('[IPC] Operation failed:', error);
    throw error; // Will reject the promise in renderer
  }
});
```

## Constants Usage

All constants are defined in `src/shared/constants.js` and imported where needed:

```javascript
// ✅ Good
import { BUTTON_MAP, IPC_CHANNELS, GRID_CONFIG } from '../shared/constants';

// Use in code
if (gp.buttons[BUTTON_MAP.A].pressed) { ... }

// ❌ Bad
const BUTTON_MAP = { A: 0, B: 1, ... }; // Duplicated!
```

## Error Boundaries

Always wrap components with ErrorBoundary:

```javascript
import { ErrorBoundary } from './components/error-boundaries/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
```

## Logging

Use consistent logging prefixes:

```javascript
console.log('[ComponentName] Message');
console.error('[ServiceName] Error:', error.message);
console.warn('[HookName] Warning');
```

## Comments

- Use JSDoc for all public functions
- Include parameter types and return values
- Explain WHY, not WHAT (code should be self-explanatory)

```javascript
/**
 * Launch a game
 * @param {Object} game - Game to launch
 * @param {Function} onExit - Callback when game exits (exe games only)
 * @throws {Error} If game cannot be launched
 */
function launchGame(game, onExit) { ... }
```

## Testing

Before committing:

1. **Linting**: Run `npm run lint` if available
2. **Type checking**: Run `npm run typecheck` if using TypeScript
3. **Functional testing**: Test in the actual app
4. **No console errors**: Check DevTools for warnings

## Common Pitfalls

### 1. Accessing Node.js in Renderer
❌ Don't use `fs`, `path`, or other Node modules directly in renderer
✅ Use IPC to communicate with main process

### 2. Hardcoded Values
❌ Don't hardcode magic numbers or strings
✅ Use constants from `shared/constants.js`

### 3. Silent Failures
❌ Don't catch errors without logging
✅ Always log errors with context

### 4. Memory Leaks
❌ Don't forget to clean up event listeners
✅ Always return cleanup functions in useEffect

### 5. Inconsistent Error Handling
❌ Don't mix return values and throw errors
✅ Be consistent: throw for errors, return for success

## Quick Reference

| Task | Where to do it |
|------|---------------|
| Read/write files | `main/services/*Service.js` |
| Launch games | `main/services/gameService.js` |
| Access Steam | `main/services/steamService.js` |
| UI rendering | `renderer/components/*.jsx` |
| State management | `renderer/hooks/*.js` |
| API calls to main | `renderer/services/*Api.js` |
| Pure utilities | `renderer/utils/*Utils.js` |
| Constants | `shared/constants.js` |

## Need Help?

1. Check existing code for similar patterns
2. Look at `CLAUDE.md` for project-specific context
3. Follow the error handling and logging patterns shown above
4. When in doubt, ask for clarification
