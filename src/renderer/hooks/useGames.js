import { useState, useEffect } from 'react';

export function useGames() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    // Load games from games.json
    // TODO: Implement actual loading
    setGames([]);
  }, []);

  const addGame = (game) => {
    // TODO: Implement
    setGames([...games, game]);
  };

  const removeGame = (gameId) => {
    // TODO: Implement
    setGames(games.filter((g) => g.id !== gameId));
  };

  const refreshSteamLibrary = () => {
    // TODO: Implement
  };

  return { games, addGame, removeGame, refreshSteamLibrary };
}
