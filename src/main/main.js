/**
 * Main Process Entry Point
 * 
 * This is the Electron main process entry point.
 * It creates the application window and registers all IPC handlers.
 * 
 * Architecture:
 * - main.js: Entry point, window management
 * - ipcHandlers.js: All IPC communication registration
 * - services/: Business logic (gameService, steamService)
 * 
 * @module main
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { registerIpcHandlers } = require('./ipcHandlers');

let mainWindow;

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false, // Security: disable remote module
    },
  });

  // Determine start URL based on environment
  // Gebruik localhost voor betere compatibiliteit
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../renderer/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Application lifecycle events

app.on('ready', () => {
  console.log('[Main] App ready, creating window...');
  createWindow();
  registerIpcHandlers(mainWindow);
});

app.on('window-all-closed', () => {
  // On macOS, apps typically stay running until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (mainWindow === null) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (_event, contents) => {
  contents.on('new-window', (event) => {
    event.preventDefault();
    console.warn('[Main] Blocked new window creation');
  });
});
