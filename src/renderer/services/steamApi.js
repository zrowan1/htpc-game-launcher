/**
 * Steam API
 * 
 * API layer for Steam-related operations.
 * All methods communicate with the main process via electronAPI.
 * 
 * @module services/steamApi
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
 * Get all Steam games from the library
 * @returns {Promise<Object[]>} Array of Steam game objects
 */
export async function getSteamGames() {
  const api = getApi();
  if (!api) {
    console.warn('[SteamApi] Not in Electron environment, returning empty array');
    return [];
  }
  return api.getSteamGames();
}

/**
 * Refresh the Steam library
 * @returns {Promise<{success: boolean, count: number}>}
 */
export async function refreshSteamLibrary() {
  const api = getApi();
  if (!api) {
    console.warn('[SteamApi] Cannot refresh: Not in Electron');
    return { success: false, count: 0 };
  }
  return api.refreshSteam();
}
