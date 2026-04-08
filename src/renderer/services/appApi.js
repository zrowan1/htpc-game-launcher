/**
 * App API
 * 
 * API layer for application-level operations.
 * 
 * @module services/appApi
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
 * Quit the application
 * @returns {Promise<void>}
 */
export async function quitApp() {
  const api = getApi();
  if (!api) {
    console.warn('[AppApi] Cannot quit: Not in Electron');
    return;
  }
  return api.quitApp();
}

/**
 * Listen for game exited events
 * @param {Function} callback - Callback function
 * @returns {Function} Cleanup function
 */
export function onGameExited(callback) {
  const api = getApi();
  if (!api) {
    console.warn('[AppApi] Cannot listen for game exit: Not in Electron');
    return () => {};
  }
  return api.onGameExited(callback);
}
