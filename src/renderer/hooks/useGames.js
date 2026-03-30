import { useState, useEffect, useCallback } from 'react';
import { getSteamGames } from '../utils/steamLibraryParser';
import { loadGames, addGame as persistAddGame, removeGame as persistRemoveGame } from '../utils/gameManager';

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

export function useGames() {
  const [games, setGames] = useState([]);

  const loadAll = useCallback(async () => {
    // Use dummy data when running outside of Electron (browser/dev mode)
    if (!window.electronAPI) {
      setGames(DUMMY_GAMES);
      return;
    }

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
