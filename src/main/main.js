const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const steamParser = require('./steamLibraryParser');
const gameManager = require('./gameManager');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../renderer/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handlers
ipcMain.handle('get-steam-games', () => steamParser.getSteamGames());
ipcMain.handle('load-games', () => gameManager.loadGames());
ipcMain.handle('save-games', (_event, data) => gameManager.saveGames(data));
ipcMain.handle('add-game', (_event, game) => gameManager.addGame(game));
ipcMain.handle('remove-game', (_event, gameId) => gameManager.removeGame(gameId));
ipcMain.handle('launch-game', (_event, game) => gameManager.launchGame(game));

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
