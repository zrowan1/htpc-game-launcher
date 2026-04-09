/**
 * Game API
 * 
 * API layer for game-related operations.
 * All methods communicate with the main process via electronAPI.
 * This is the ONLY place where window.electronAPI should be accessed for game operations.
 * 
 * @module services/gameApi
 */

/**
 * Check if running in Electron environment
 * @returns {boolean}
 */
function isElectron() {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
}

/**
 * Get the electron API instance
 * @returns {Object|null}
 */
function getApi() {
  return isElectron() ? window.electronAPI : null;
}

/**
 * Load games from persistence
 * @returns {Promise<Object>} Games data
 */
export async function loadGames() {
  const api = getApi();
  if (!api) {
    console.warn('[GameApi] Not in Electron environment');
    return { games: [] };
  }
  return api.loadGames();
}

/**
 * Add a new game
 * @param {Object} game - Game to add
 * @returns {Promise<Object>} Added game with ID
 */
export async function addGame(game) {
  const api = getApi();
  if (!api) {
    console.warn('[GameApi] Cannot add game: Not in Electron');
    return game;
  }
  return api.addGame(game);
}

/**
 * Remove a game
 * @param {string} gameId - Game ID to remove
 * @returns {Promise<void>}
 */
export async function removeGame(gameId) {
  const api = getApi();
  if (!api) {
    console.warn('[GameApi] Cannot remove game: Not in Electron');
    return;
  }
  return api.removeGame(gameId);
}

/**
 * Update a game
 * @param {string} gameId - Game ID to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated game
 */
export async function updateGame(gameId, updates) {
  const api = getApi();
  if (!api) {
    console.warn('[GameApi] Cannot update game: Not in Electron');
    return null;
  }
  return api.updateGame(gameId, updates);
}

/**
 * Launch a game
 * @param {Object} game - Game to launch
 * @returns {Promise<void>}
 */
export async function launchGame(game) {
  const api = getApi();
  if (!api) {
    console.warn('[GameApi] Cannot launch game: Not in Electron');
    return;
  }
  return api.launchGame(game);
}

/**
 * Save games data
 * @param {Object} data - Games data to save
 * @returns {Promise<void>}
 */
export async function saveGames(data) {
  const api = getApi();
  if (!api) {
    console.warn('[GameApi] Cannot save games: Not in Electron');
    return;
  }
  return api.saveGames(data);
}

/**
 * Search games via RAWG API
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching games
 */
export async function searchGames(query) {
  const api = getApi();
  if (!api) {
    console.warn('[GameApi] Cannot search games: Not in Electron');
    return [];
  }
  return api.searchGames(query);
}

/**
 * Download and save a cover image
 * @param {string} gameId - Game ID for filename
 * @param {string} imageUrl - URL to the image
 * @returns {Promise<Object>} Object with local path and original URL
 */
export async function downloadCover(gameId, imageUrl) {
  const api = getApi();
  if (!api) {
    console.warn('[GameApi] Cannot download cover: Not in Electron');
    return null;
  }
  return api.downloadCover(gameId, imageUrl);
}
