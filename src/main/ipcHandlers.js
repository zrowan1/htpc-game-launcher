/**
 * IPC Handlers
 * 
 * Registers all IPC handlers for communication between main and renderer processes.
 * Each handler wraps a service method and provides consistent error handling.
 * 
 * @module ipcHandlers
 */

const { ipcMain } = require('electron');
const gameService = require('./services/gameService');
const steamService = require('./services/steamService');
const { IPC_CHANNELS } = require('../shared/constants');

/**
 * Register all IPC handlers
 * @param {BrowserWindow} mainWindow - The main application window
 */
function registerIpcHandlers(mainWindow) {
  console.log('[IPC] Registering handlers...');

  // Game management handlers
  ipcMain.handle(IPC_CHANNELS.LOAD_GAMES, async () => {
    try {
      return gameService.loadGames();
    } catch (error) {
      console.error('[IPC] load-games error:', error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.SAVE_GAMES, async (_event, data) => {
    try {
      gameService.saveGames(data);
      return { success: true };
    } catch (error) {
      console.error('[IPC] save-games error:', error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.ADD_GAME, async (_event, game) => {
    try {
      return gameService.addGame(game);
    } catch (error) {
      console.error('[IPC] add-game error:', error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.REMOVE_GAME, async (_event, gameId) => {
    try {
      gameService.removeGame(gameId);
      return { success: true };
    } catch (error) {
      console.error('[IPC] remove-game error:', error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.LAUNCH_GAME, async (_event, game) => {
    try {
      gameService.launchGame(game, () => {
        // Notify renderer and refocus window after game exits
        setTimeout(() => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send(IPC_CHANNELS.GAME_EXITED);
            mainWindow.focus();
          }
        }, 2000);
      });
      return { success: true };
    } catch (error) {
      console.error('[IPC] launch-game error:', error);
      throw error;
    }
  });

  // Steam handlers
  ipcMain.handle(IPC_CHANNELS.GET_STEAM_GAMES, async () => {
    try {
      return steamService.getSteamGames();
    } catch (error) {
      console.error('[IPC] get-steam-games error:', error);
      return []; // Return empty array on error rather than crash
    }
  });

  ipcMain.handle(IPC_CHANNELS.REFRESH_STEAM, async () => {
    try {
      const games = steamService.getSteamGames();
      return { success: true, count: games.length };
    } catch (error) {
      console.error('[IPC] refresh-steam error:', error);
      throw error;
    }
  });

  // App lifecycle handlers
  ipcMain.handle(IPC_CHANNELS.QUIT_APP, async () => {
    try {
      const { app } = require('electron');
      app.quit();
      return { success: true };
    } catch (error) {
      console.error('[IPC] quit-app error:', error);
      throw error;
    }
  });

  console.log('[IPC] All handlers registered');
}

module.exports = { registerIpcHandlers };
