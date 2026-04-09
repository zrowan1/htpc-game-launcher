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
const autoStartService = require('./services/autoStartService');
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

  ipcMain.handle(IPC_CHANNELS.UPDATE_GAME, async (_event, { gameId, updates }) => {
    try {
      const updated = gameService.updateGame(gameId, updates);
      if (!updated) {
        throw new Error(`Game not found: ${gameId}`);
      }
      return updated;
    } catch (error) {
      console.error('[IPC] update-game error:', error);
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
      const games = steamService.getSteamGames();
      return steamService.enhanceGamesWithArtwork(games);
    } catch (error) {
      console.error('[IPC] get-steam-games error:', error);
      return []; // Return empty array on error rather than crash
    }
  });

  ipcMain.handle(IPC_CHANNELS.REFRESH_STEAM, async () => {
    try {
      const games = steamService.getSteamGames();
      const enhancedGames = steamService.enhanceGamesWithArtwork(games);
      return { success: true, count: enhancedGames.length };
    } catch (error) {
      console.error('[IPC] refresh-steam error:', error);
      throw error;
    }
  });

  // Game search & cover download handlers
  ipcMain.handle(IPC_CHANNELS.SEARCH_GAMES, async (_event, query) => {
    try {
      const results = await gameService.searchGamesRAWG(query);
      return results;
    } catch (error) {
      console.error('[IPC] search-games error:', error);
      return [];
    }
  });

  ipcMain.handle(IPC_CHANNELS.DOWNLOAD_COVER, async (_event, { gameId, imageUrl }) => {
    try {
      const result = await gameService.downloadCover(gameId, imageUrl);
      return result;
    } catch (error) {
      console.error('[IPC] download-cover error:', error);
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

  // Auto start handlers
  ipcMain.handle(IPC_CHANNELS.GET_AUTOSTART_STATUS, async () => {
    try {
      const isEnabled = await autoStartService.isAutoStartEnabled();
      return { enabled: isEnabled };
    } catch (error) {
      console.error('[IPC] get-autostart-status error:', error);
      return { enabled: false };
    }
  });

  ipcMain.handle(IPC_CHANNELS.TOGGLE_AUTOSTART, async () => {
    try {
      const result = await autoStartService.toggleAutoStart();
      return result;
    } catch (error) {
      console.error('[IPC] toggle-autostart error:', error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.ENABLE_AUTOSTART, async () => {
    try {
      const success = await autoStartService.enableAutoStart();
      return { enabled: true, success };
    } catch (error) {
      console.error('[IPC] enable-autostart error:', error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.DISABLE_AUTOSTART, async () => {
    try {
      const success = await autoStartService.disableAutoStart();
      return { enabled: false, success };
    } catch (error) {
      console.error('[IPC] disable-autostart error:', error);
      throw error;
    }
  });

  console.log('[IPC] All handlers registered');
}

module.exports = { registerIpcHandlers };
