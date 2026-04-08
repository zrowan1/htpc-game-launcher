/**
 * Game Service
 * 
 * Handles all game-related business logic in the main process.
 * This includes persistence, CRUD operations, and game launching.
 * 
 * @module services/gameService
 */

const fs = require('fs');
const path = require('path');
const { shell } = require('electron');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const { DEFAULT_GAMES_DATA, FILE_NAMES, LAUNCHER_TYPES, LAUNCH_DELAYS } = require('../../shared/constants');

// Lazy-init so app.getPath() is safe to call after app.ready
let gamesFilePath = null;

/**
 * Get the path to the games.json file
 * @returns {string} Full path to games.json
 */
function getGamesFilePath() {
  if (!gamesFilePath) {
    const { app } = require('electron');
    gamesFilePath = path.join(app.getPath('userData'), FILE_NAMES.GAMES_JSON);
  }
  return gamesFilePath;
}

/**
 * Write data to the games.json file
 * @param {Object} data - The data to write
 */
function writeGamesFile(data) {
  const filePath = getGamesFilePath();
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const toWrite = { 
    ...data, 
    lastUpdated: new Date().toISOString() 
  };
  
  fs.writeFileSync(filePath, JSON.stringify(toWrite, null, 2), 'utf-8');
}

/**
 * Load games from persistence
 * @returns {Object} Games data object
 */
function loadGames() {
  const filePath = getGamesFilePath();

  try {
    if (!fs.existsSync(filePath)) {
      writeGamesFile(DEFAULT_GAMES_DATA);
      return DEFAULT_GAMES_DATA;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to load games, backing up and creating fresh:', error.message);
    
    // Back up corrupted file and start fresh
    try {
      fs.renameSync(filePath, `${filePath}.bak.${Date.now()}`);
    } catch {
      // Ignore if rename also fails
    }
    
    writeGamesFile(DEFAULT_GAMES_DATA);
    return DEFAULT_GAMES_DATA;
  }
}

/**
 * Save games data to persistence
 * @param {Object} data - Complete games data object
 */
function saveGames(data) {
  writeGamesFile(data);
}

/**
 * Add a new game to persistence
 * @param {Object} game - Game object to add
 * @returns {Object} Game with generated ID
 */
function addGame(game) {
  const data = loadGames();
  const newGame = { 
    ...game, 
    id: game.id || uuidv4(),
    addedAt: new Date().toISOString(),
  };
  
  data.games.push(newGame);
  writeGamesFile(data);
  
  return newGame;
}

/**
 * Remove a game from persistence
 * @param {string} gameId - ID of game to remove
 */
function removeGame(gameId) {
  const data = loadGames();
  data.games = data.games.filter((g) => g.id !== gameId);
  writeGamesFile(data);
}

/**
 * Launch a game
 * @param {Object} game - Game to launch
 * @param {Function} onExit - Callback when game exits (only for exe games)
 */
function launchGame(game, onExit) {
  console.log(`[GameService] Launching: ${game.title} (type: ${game.launcher})`);

  try {
    if (game.launcher === LAUNCHER_TYPES.STEAM) {
      // Steam games are launched via URL protocol
      shell.openExternal(`steam://rungameid/${game.steamAppId}`);
      // Steam games are managed externally; process monitoring not available
      
    } else if (game.exePath) {
      // Quote path to handle spaces; exec on Windows uses cmd.exe
      const child = exec(`"${game.exePath}"`, (err) => {
        if (err) {
          console.error(`[GameService] Failed to launch ${game.title}:`, err.message);
        }
      });
      
      if (onExit && child) {
        child.on('exit', () => {
          console.log(`[GameService] Game exited: ${game.title}`);
          setTimeout(() => onExit(), LAUNCH_DELAYS.FOCUS_RETURN);
        });
      }
    } else {
      throw new Error(`No launch method available for game: ${game.title}`);
    }
  } catch (error) {
    console.error(`[GameService] Launch error for ${game.title}:`, error.message);
    throw error;
  }
}

module.exports = {
  loadGames,
  saveGames,
  addGame,
  removeGame,
  launchGame,
};
