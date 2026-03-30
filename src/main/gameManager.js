const fs = require('fs');
const path = require('path');
const { shell } = require('electron');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

// Lazy-init so app.getPath() is safe to call after app.ready
let gamesFilePath = null;

function getGamesFilePath() {
  if (!gamesFilePath) {
    const { app } = require('electron');
    gamesFilePath = path.join(app.getPath('userData'), 'games.json');
  }
  return gamesFilePath;
}

const DEFAULT_DATA = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  games: [],
};

function loadGames() {
  const filePath = getGamesFilePath();

  try {
    if (!fs.existsSync(filePath)) {
      writeGamesFile(DEFAULT_DATA);
      return DEFAULT_DATA;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    // Back up corrupted file and start fresh
    try {
      fs.renameSync(filePath, filePath + '.bak');
    } catch {
      // Ignore if rename also fails
    }
    writeGamesFile(DEFAULT_DATA);
    return DEFAULT_DATA;
  }
}

function writeGamesFile(data) {
  const filePath = getGamesFilePath();
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const toWrite = { ...data, lastUpdated: new Date().toISOString() };
  fs.writeFileSync(filePath, JSON.stringify(toWrite, null, 2), 'utf-8');
}

function saveGames(data) {
  writeGamesFile(data);
}

function addGame(game) {
  const data = loadGames();
  const newGame = { ...game, id: game.id || uuidv4() };
  data.games.push(newGame);
  writeGamesFile(data);
  return newGame;
}

function removeGame(gameId) {
  const data = loadGames();
  data.games = data.games.filter((g) => g.id !== gameId);
  writeGamesFile(data);
}

function launchGame(game) {
  if (game.launcher === 'steam') {
    shell.openExternal(`steam://rungameid/${game.steamAppId}`);
  } else if (game.exePath) {
    // Quote path to handle spaces; exec on Windows uses cmd.exe
    exec(`"${game.exePath}"`, (err) => {
      if (err) console.error(`Failed to launch ${game.title}:`, err.message);
    });
  }
}

module.exports = { loadGames, saveGames, addGame, removeGame, launchGame };
