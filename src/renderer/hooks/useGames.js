import { useState, useEffect, useCallback } from 'react';
import { getSteamGames } from '../utils/steamLibraryParser';
import { loadGames, addGame as persistAddGame, removeGame as persistRemoveGame } from '../utils/gameManager';

export function useGames() {
  const [games, setGames] = useState([]);

  const loadAll = useCallback(async () => {
    const [steamGames, savedData] = await Promise.all([
      getSteamGames(),
      loadGames(),
    ]);

    // Keep only manually-added games from persistence; Steam games come from fresh scan
    const manualGames = (savedData.games || []).filter((g) => g.launcher !== 'steam');
    setGames([...steamGames, ...manualGames]);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const addGame = useCallback(async (game) => {
    const saved = await persistAddGame(game);
    setGames((prev) => [...prev, saved]);
  }, []);

  const removeGame = useCallback(async (gameId) => {
    await persistRemoveGame(gameId);
    setGames((prev) => prev.filter((g) => g.id !== gameId));
  }, []);

  const refreshSteamLibrary = useCallback(() => {
    loadAll();
  }, [loadAll]);

  return { games, addGame, removeGame, refreshSteamLibrary };
}
