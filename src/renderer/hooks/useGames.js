/**
 * useGames Hook
 * 
 * Custom React hook for managing game state.
 * Handles loading from Steam and persistence, adding/removing games.
 * 
 * @module hooks/useGames
 */

import { useState, useEffect, useCallback } from 'react';
import { loadGames, addGame as apiAddGame, removeGame as apiRemoveGame } from '../services/gameApi';
import { getSteamGames } from '../services/steamApi';
import { LAUNCHER_TYPES } from '../../shared/constants';

/**
 * Dummy games for development/testing outside Electron
 */
const DUMMY_GAMES = [
  { id: 'dummy_1', title: 'Portal 2', launcher: 'steam', steamAppId: '620' },
  { id: 'dummy_2', title: 'Half-Life 2', launcher: 'steam', steamAppId: '220' },
  { id: 'dummy_3', title: 'The Witcher 3', launcher: 'steam', steamAppId: '292030' },
  { id: 'dummy_4', title: 'Hollow Knight', launcher: 'steam', steamAppId: '367520' },
  { id: 'dummy_5', title: 'Stardew Valley', launcher: 'steam', steamAppId: '413150' },
  { id: 'dummy_6', title: 'Hades', launcher: 'steam', steamAppId: '1145360' },
  { id: 'dummy_7', title: 'Celeste', launcher: 'steam', steamAppId: '504230' },
  { id: 'dummy_8', title: 'Deep Rock Galactic', launcher: 'steam', steamAppId: '548430' },
  { id: 'dummy_9', title: 'Doom Eternal', launcher: 'steam', steamAppId: '782330' },
  { id: 'dummy_10', title: 'My Custom Game', launcher: 'exe', exePath: 'C:\\Games\\mygame.exe' },
  { id: 'dummy_11', title: 'Rocket League', launcher: 'steam', steamAppId: '252950' },
  { id: 'dummy_12', title: 'Minecraft', launcher: 'exe', exePath: 'C:\\Games\\Minecraft\\minecraft.exe' },
];

/**
 * Check if running in Electron environment
 * @returns {boolean}
 */
function isElectron() {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
}

/**
 * Hook for game management
 * @returns {Object} Game state and operations
 */
export function useGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load all games (Steam + persisted)
   */
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use dummy data when running outside of Electron (browser/dev mode)
      if (!isElectron()) {
        console.log('[useGames] Using dummy data (not in Electron)');
        setGames(DUMMY_GAMES);
        setLoading(false);
        return;
      }

      const [steamGames, savedData] = await Promise.all([
        getSteamGames(),
        loadGames(),
      ]);

      // Keep only manually-added games from persistence; Steam games come from fresh scan
      const manualGames = (savedData.games || []).filter(
        (g) => g.launcher !== LAUNCHER_TYPES.STEAM
      );

      setGames([...steamGames, ...manualGames]);
    } catch (err) {
      console.error('[useGames] Error loading games:', err);
      setError(err.message);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load games on mount
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /**
   * Add a new game
   * @param {Object} game - Game to add
   */
  const addGame = useCallback(async (game) => {
    try {
      const saved = await apiAddGame(game);
      setGames((prev) => [...prev, saved]);
      return saved;
    } catch (err) {
      console.error('[useGames] Error adding game:', err);
      throw err;
    }
  }, []);

  /**
   * Remove a game
   * @param {string} gameId - Game ID to remove
   */
  const removeGame = useCallback(async (gameId) => {
    try {
      await apiRemoveGame(gameId);
      setGames((prev) => prev.filter((g) => g.id !== gameId));
    } catch (err) {
      console.error('[useGames] Error removing game:', err);
      throw err;
    }
  }, []);

  /**
   * Refresh Steam library
   */
  const refreshSteamLibrary = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  return {
    games,
    loading,
    error,
    addGame,
    removeGame,
    refreshSteamLibrary,
    reload: loadAll,
  };
}

export default useGames;
