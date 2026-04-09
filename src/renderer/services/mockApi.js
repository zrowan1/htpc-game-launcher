/**
 * Mock Electron API for Browser Testing
 * 
 * This module provides mock implementations of Electron APIs
 * when running in browser mode (without Electron).
 * 
 * @module services/mockApi
 */

// RAWG API configuration
const RAWG_API = {
  BASE_URL: 'https://api.rawg.io/api',
  PAGE_SIZE: 8,
  API_KEY: 'c2e155559f234b119fb81f8315bf8e89',
};

// Mock games database (in memory)
const mockGames = {
  games: [
    {
      id: 'mock-1',
      title: 'Test Game 1',
      platform: 'steam',
      coverUrl: 'https://via.placeholder.com/300x400/3b82f6/ffffff?text=Game+1',
      lastPlayed: null,
      playCount: 0
    },
    {
      id: 'mock-2',
      title: 'Test Game 2',
      platform: 'exe',
      coverUrl: 'https://via.placeholder.com/300x400/10b981/ffffff?text=Game+2',
      lastPlayed: null,
      playCount: 0
    }
  ],
  lastUpdated: Date.now()
};

/**
 * Mock Electron API for browser testing
 */
export const mockElectronAPI = {
  /**
   * Load games from localStorage
   */
  async loadGames() {
    console.log('[MockAPI] Loading games from localStorage');
    const stored = localStorage.getItem('mock-games');
    if (stored) {
      return JSON.parse(stored);
    }
    return mockGames;
  },

  /**
   * Get Steam games (mock - returns empty array)
   */
  async getSteamGames() {
    console.log('[MockAPI] Getting Steam games (mock - returns empty)');
    return [];
  },

  /**
   * Refresh Steam library (mock)
   */
  async refreshSteam() {
    console.log('[MockAPI] Refreshing Steam library (mock)');
    return { success: true, count: 0 };
  },

  /**
   * Add a new game
   */
  async addGame(game) {
    console.log('[MockAPI] Adding game:', game.title);
    const games = await this.loadGames();
    const { coverUrl, ...rest } = game;
    const newGame = {
      ...rest,
      id: `mock-${Date.now()}`,
      addedAt: Date.now()
    };
    games.games.push(newGame);
    await this.saveGames(games);
    return newGame;
  },

  /**
   * Remove a game
   */
  async removeGame(gameId) {
    console.log('[MockAPI] Removing game:', gameId);
    const games = await this.loadGames();
    games.games = games.games.filter(g => g.id !== gameId);
    await this.saveGames(games);
  },

  /**
   * Update a game (mock)
   */
  async updateGame(gameId, updates) {
    console.log('[MockAPI] Updating game:', gameId, JSON.stringify(updates));
    const games = await this.loadGames();
    const index = games.games.findIndex(g => g.id === gameId);
    if (index !== -1) {
      games.games[index] = { ...games.games[index], ...updates };
      await this.saveGames(games);
      console.log('[MockAPI] Game updated, artwork:', games.games[index].artwork);
      return games.games[index];
    }
    return null;
  },

  /**
   * Search games via RAWG API
   */
  async searchGames(query) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    console.log('[MockAPI] Searching RAWG:', query);

    try {
      const params = new URLSearchParams({
        key: RAWG_API.API_KEY,
        search: query.trim(),
        page_size: RAWG_API.PAGE_SIZE.toString(),
      });

      const response = await fetch(`${RAWG_API.BASE_URL}/games?${params.toString()}`);
      
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
      console.error('[MockAPI] RAWG search failed:', error.message);
      return [];
    }
  },

  /**
   * Download cover (mock - returns RAWG URL as CDN)
   */
  async downloadCover(gameId, imageUrl) {
    console.log('[MockAPI] Downloading cover for:', gameId);
    if (!imageUrl) return null;
    
    return {
      source: 'cdn',
      cdnUrl: imageUrl,
      originalUrl: imageUrl,
    };
  },

  /**
   * Launch a game (mock - just logs)
   */
  async launchGame(game) {
    console.log('[MockAPI] Launching game:', game.title);
    alert(`[MOCK] Would launch: ${game.title}\nPlatform: ${game.platform}\nPath: ${game.path || 'N/A'}`);
    
    // Update play stats
    const games = await this.loadGames();
    const gameIndex = games.games.findIndex(g => g.id === game.id);
    if (gameIndex !== -1) {
      games.games[gameIndex].lastPlayed = Date.now();
      games.games[gameIndex].playCount = (games.games[gameIndex].playCount || 0) + 1;
      await this.saveGames(games);
    }
  },

  /**
   * Save games to localStorage
   */
  async saveGames(data) {
    console.log('[MockAPI] Saving games');
    localStorage.setItem('mock-games', JSON.stringify({
      ...data,
      lastUpdated: Date.now()
    }));
  },

  /**
   * Close app (mock) - also available as quitApp
   */
  async closeApp() {
    console.log('[MockAPI] Close app requested');
    window.close();
  },

  /**
   * Quit app (alias for closeApp)
   */
  async quitApp() {
    console.log('[MockAPI] Quit app requested');
    window.close();
  },

  /**
   * Listen for game exited events (mock - no-op)
   */
  onGameExited(callback) {
    console.log('[MockAPI] onGameExited listener registered (mock - no events will fire)');
    // In mock mode, games don't really exit, so this is a no-op
    return () => {
      console.log('[MockAPI] onGameExited listener removed');
    };
  },

  /**
   * Get auto start status (mock)
   */
  async getAutoStartStatus() {
    console.log('[MockAPI] Getting autostart status (mock)');
    return { enabled: false };
  },

  /**
   * Toggle auto start (mock)
   */
  async toggleAutoStart() {
    console.log('[MockAPI] Toggling autostart (mock)');
    return { enabled: false, success: false };
  },

  /**
   * Enable auto start (mock)
   */
  async enableAutoStart() {
    console.log('[MockAPI] Enabling autostart (mock)');
    return { enabled: false, success: false };
  },

  /**
   * Disable auto start (mock)
   */
  async disableAutoStart() {
    console.log('[MockAPI] Disabling autostart (mock)');
    return { enabled: false, success: false };
  },

  /**
   * Toggle fullscreen (mock)
   */
  async toggleFullscreen() {
    console.log('[MockAPI] Toggle fullscreen');
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  },

  /**
   * Minimize window (mock)
   */
  async minimizeWindow() {
    console.log('[MockAPI] Minimize window (not available in browser)');
  },

  /**
   * Check if in fullscreen (mock)
   */
  isFullscreen() {
    return !!document.fullscreenElement;
  },

  /**
   * On fullscreen change (mock)
   */
  onFullscreenChange(callback) {
    document.addEventListener('fullscreenchange', () => {
      callback(document.fullscreenElement !== null);
    });
  },

  /**
   * Get app version
   */
  getAppVersion() {
    return 'browser-mock';
  },

  /**
   * Convert local path to file URL (mock)
   */
  localPathToFileUrl(filePath) {
    if (!filePath) return null;
    return `file:///${filePath.replace(/\\/g, '/')}`;
  }
};

/**
 * Initialize mock API in browser environment
 */
export function initMockAPI() {
  if (typeof window !== 'undefined' && !window.electronAPI) {
    console.log('[MockAPI] Initializing browser mock API');
    window.electronAPI = mockElectronAPI;
    
    // Add a visual indicator
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #f59e0b;
      color: #000;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      pointer-events: none;
    `;
    indicator.textContent = '🔧 BROWSER MOCK MODE';
    document.body.appendChild(indicator);
  }
}
