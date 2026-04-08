/**
 * Preload Script
 * 
 * This script runs in the renderer process before the web page loads.
 * It safely exposes selected Electron APIs to the renderer via contextBridge.
 * 
 * Security:
 * - contextIsolation is enabled (renderer cannot access Node.js directly)
 * - Only whitelisted IPC channels are exposed
 * - No direct access to fs, path, or other Node.js modules
 * 
 * @module preload
 */

const { contextBridge, ipcRenderer } = require('electron');
const { IPC_CHANNELS } = require('../shared/constants');

/**
 * Valid IPC channels that can be invoked from renderer
 * This whitelist ensures only intended operations are possible
 */
const VALID_CHANNELS = [
  IPC_CHANNELS.GET_STEAM_GAMES,
  IPC_CHANNELS.LOAD_GAMES,
  IPC_CHANNELS.SAVE_GAMES,
  IPC_CHANNELS.ADD_GAME,
  IPC_CHANNELS.REMOVE_GAME,
  IPC_CHANNELS.LAUNCH_GAME,
  IPC_CHANNELS.REFRESH_STEAM,
  IPC_CHANNELS.QUIT_APP,
];

/**
 * Exposed API for the renderer process
 * All methods return Promises (ipcRenderer.invoke)
 */
const electronAPI = {
  /**
   * Get all Steam games from the library
   * @returns {Promise<Object[]>} Array of game objects
   */
  getSteamGames: () => ipcRenderer.invoke(IPC_CHANNELS.GET_STEAM_GAMES),

  /**
   * Load saved games from persistence
   * @returns {Promise<Object>} Games data object
   */
  loadGames: () => ipcRenderer.invoke(IPC_CHANNELS.LOAD_GAMES),

  /**
   * Save games data to persistence
   * @param {Object} data - Games data to save
   * @returns {Promise<{success: boolean}>}
   */
  saveGames: (data) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_GAMES, data),

  /**
   * Add a new game
   * @param {Object} game - Game object to add
   * @returns {Promise<Object>} Added game with generated ID
   */
  addGame: (game) => ipcRenderer.invoke(IPC_CHANNELS.ADD_GAME, game),

  /**
   * Remove a game
   * @param {string} gameId - ID of game to remove
   * @returns {Promise<{success: boolean}>}
   */
  removeGame: (gameId) => ipcRenderer.invoke(IPC_CHANNELS.REMOVE_GAME, gameId),

  /**
   * Launch a game
   * @param {Object} game - Game to launch
   * @returns {Promise<{success: boolean}>}
   */
  launchGame: (game) => ipcRenderer.invoke(IPC_CHANNELS.LAUNCH_GAME, game),

  /**
   * Refresh Steam library
   * @returns {Promise<{success: boolean, count: number}>}
   */
  refreshSteam: () => ipcRenderer.invoke(IPC_CHANNELS.REFRESH_STEAM),

  /**
   * Quit the application
   * @returns {Promise<{success: boolean}>}
   */
  quitApp: () => ipcRenderer.invoke(IPC_CHANNELS.QUIT_APP),

  /**
   * Listen for game exited events
   * @param {Function} callback - Function to call when game exits
   * @returns {Function} Cleanup function to remove listener
   */
  onGameExited: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.GAME_EXITED, callback);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.GAME_EXITED, callback);
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

console.log('[Preload] electronAPI exposed to window');
