const api = () => window.electronAPI;

export async function loadGames() {
  if (!api()) return { games: [] };
  return api().loadGames();
}

export async function addGame(game) {
  if (!api()) return game;
  return api().addGame(game);
}

export async function removeGame(gameId) {
  if (!api()) return;
  return api().removeGame(gameId);
}

export async function launchGame(game) {
  if (!api()) return;
  return api().launchGame(game);
}
