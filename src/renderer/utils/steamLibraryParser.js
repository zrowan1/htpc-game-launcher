export async function getSteamGames() {
  if (!window.electronAPI) return []; // Graceful fallback in browser/dev
  return window.electronAPI.getSteamGames();
}
