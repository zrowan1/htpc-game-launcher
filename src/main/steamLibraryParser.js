const fs = require('fs');
const path = require('path');
const os = require('os');
const vdf = require('vdf-parser');

function getSteamInstallPath() {
  const candidates = [
    'C:\\Program Files (x86)\\Steam',
    'C:\\Program Files\\Steam',
    path.join(os.homedir(), '.steam', 'steam'), // Linux fallback for dev
    path.join(os.homedir(), '.local', 'share', 'Steam'), // Linux alternate
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function getLibraryFolders(steamPath) {
  const vdfPath = path.join(steamPath, 'steamapps', 'libraryfolders.vdf');
  const defaultLib = path.join(steamPath, 'steamapps');

  if (!fs.existsSync(vdfPath)) return [defaultLib];

  try {
    const content = fs.readFileSync(vdfPath, 'utf-8');
    const parsed = vdf.parse(content);
    const folders = [defaultLib];

    // vdf-parser lowercases keys
    const root = parsed.libraryfolders || parsed.LibraryFolders || {};

    for (const key of Object.keys(root)) {
      const entry = root[key];
      // New format (Steam 2021+): entry is an object with a "path" key
      if (typeof entry === 'object' && entry.path) {
        const libPath = path.join(entry.path, 'steamapps');
        if (libPath !== defaultLib) folders.push(libPath);
      // Old format: entry is a string path, key is a number
      } else if (typeof entry === 'string' && !isNaN(key)) {
        const libPath = path.join(entry, 'steamapps');
        if (libPath !== defaultLib) folders.push(libPath);
      }
    }

    return folders;
  } catch {
    return [defaultLib];
  }
}

function parseGamesFromLibrary(libraryPath) {
  const games = [];
  if (!fs.existsSync(libraryPath)) return games;

  let files;
  try {
    files = fs.readdirSync(libraryPath);
  } catch {
    return games;
  }

  for (const file of files) {
    if (!file.startsWith('appmanifest_') || !file.endsWith('.acf')) continue;

    try {
      const content = fs.readFileSync(path.join(libraryPath, file), 'utf-8');
      const parsed = vdf.parse(content);
      const state = parsed.AppState || parsed.appstate;

      if (state?.appid && state?.name) {
        games.push({
          id: `steam_${state.appid}`,
          title: state.name,
          steamAppId: String(state.appid),
          launcher: 'steam',
        });
      }
    } catch {
      // Skip malformed manifests
    }
  }

  return games;
}

function getSteamGames() {
  const steamPath = getSteamInstallPath();
  if (!steamPath) return [];

  const libraries = getLibraryFolders(steamPath);
  const allGames = [];

  for (const lib of libraries) {
    allGames.push(...parseGamesFromLibrary(lib));
  }

  return allGames;
}

module.exports = { getSteamGames };
