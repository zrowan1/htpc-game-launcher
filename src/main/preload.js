const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSteamGames: () => ipcRenderer.invoke('get-steam-games'),
  loadGames: () => ipcRenderer.invoke('load-games'),
  saveGames: (data) => ipcRenderer.invoke('save-games', data),
  addGame: (game) => ipcRenderer.invoke('add-game', game),
  removeGame: (gameId) => ipcRenderer.invoke('remove-game', gameId),
  launchGame: (game) => ipcRenderer.invoke('launch-game', game),
});
