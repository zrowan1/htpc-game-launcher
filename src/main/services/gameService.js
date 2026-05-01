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
const { DEFAULT_GAMES_DATA, FILE_NAMES, LAUNCHER_TYPES, LAUNCH_DELAYS, RAWG_API, STEAM_ARTWORK } = require('../../shared/constants');

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

/**
 * Get the covers cache directory path
 * @returns {string} Full path to covers directory
 */
function getCoversDir() {
  const { app } = require('electron');
  const coversDir = path.join(app.getPath('userData'), STEAM_ARTWORK.CACHE_FOLDER, 'covers');
  
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }
  
  return coversDir;
}

/**
 * Get the path for a specific game's cover
 * @param {string} gameId - Game ID
 * @returns {string} Full path to cover image
 */
function getCoverPath(gameId) {
  return path.join(getCoversDir(), `${gameId}.jpg`);
}

/**
 * Search games via RAWG API
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching games with cover URLs
 */
async function searchGamesRAWG(query) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    key: process.env.RAWG_API_KEY || RAWG_API.API_KEY || '',
    search: query.trim(),
    page_size: RAWG_API.PAGE_SIZE.toString(),
  });

  const url = `${RAWG_API.BASE_URL}${RAWG_API.SEARCH_ENDPOINT}?${params.toString()}`;
  console.log(`[GameService] Searching RAWG: ${query}`);

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`);
    }

    const data = await response.json();
    
    return (data.results || []).map(game => ({
      id: game.id?.toString() || '',
      title: game.name || 'Unknown',
      released: game.released || null,
      background_image: game.background_image || null,
      rating: game.rating || 0,
      metacritic: game.metacritic || null,
    }));
  } catch (error) {
    console.error('[GameService] RAWG search failed:', error.message);
    return [];
  }
}

/**
 * Download and save a cover image
 * @param {string} gameId - Game ID for filename
 * @param {string} imageUrl - Full URL to the image
 * @returns {Promise<Object>} Object with local path and original URL
 */
async function downloadCover(gameId, imageUrl) {
  if (!imageUrl || !gameId) {
    throw new Error('Missing imageUrl or gameId');
  }

  const coverPath = getCoverPath(gameId);
  console.log(`[GameService] Downloading cover for game ${gameId}`);

  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(coverPath, buffer);
    console.log(`[GameService] Cover saved to: ${coverPath}`);

    return {
      source: 'local',
      path: coverPath,
      originalUrl: imageUrl,
    };
  } catch (error) {
    console.error('[GameService] Cover download failed:', error.message);
    throw error;
  }
}

/**
 * Update a game with new data
 * @param {string} gameId - ID of game to update
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated game or null if not found
 */
function updateGame(gameId, updates) {
  const data = loadGames();
  const index = data.games.findIndex((g) => g.id === gameId);
  
  if (index === -1) {
    return null;
  }
  
  data.games[index] = {
    ...data.games[index],
    ...updates,
  };
  
  writeGamesFile(data);
  return data.games[index];
}

module.exports = {
  loadGames,
  saveGames,
  addGame,
  removeGame,
  updateGame,
  launchGame,
  searchGamesRAWG,
  downloadCover,
  getCoverPath,
};
