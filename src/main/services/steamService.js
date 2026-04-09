/**
 * Steam Service
 * 
 * Handles all Steam-related operations in the main process.
 * Parses Steam library configuration and extracts game information.
 * 
 * @module services/steamService
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const vdf = require('vdf-parser');
const { FILE_NAMES, STEAM_PATH_CANDIDATES, STEAM_PATH_LINUX, LAUNCHER_TYPES, STEAM_ARTWORK, ARTWORK_SOURCE } = require('../../shared/constants');

let cachedSteamId = null;

/**
 * Get the Steam installation path
 * Checks multiple candidate locations for Windows and Linux
 * @returns {string|null} Steam installation path or null if not found
 */
function getSteamInstallPath() {
  // Combine Windows and Linux candidates
  const candidates = [
    ...STEAM_PATH_CANDIDATES,
    path.join(os.homedir(), '.steam', 'steam'),
    path.join(os.homedir(), '.local', 'share', 'Steam'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      console.log(`[SteamService] Found Steam at: ${candidate}`);
      return candidate;
    }
  }

  console.warn('[SteamService] Steam installation not found');
  return null;
}

/**
 * Get all Steam library folders
 * Parses libraryfolders.vdf and returns paths to all game libraries
 * @param {string} steamPath - Path to Steam installation
 * @returns {string[]} Array of library folder paths
 */
function getLibraryFolders(steamPath) {
  const vdfPath = path.join(steamPath, 'steamapps', FILE_NAMES.STEAM_LIBRARY_VDF);
  const defaultLib = path.join(steamPath, 'steamapps');

  if (!fs.existsSync(vdfPath)) {
    console.log(`[SteamService] No libraryfolders.vdf found, using default: ${defaultLib}`);
    return [defaultLib];
  }

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
        if (libPath !== defaultLib && fs.existsSync(libPath)) {
          folders.push(libPath);
        }
      // Old format: entry is a string path, key is a number
      } else if (typeof entry === 'string' && !isNaN(key)) {
        const libPath = path.join(entry, 'steamapps');
        if (libPath !== defaultLib && fs.existsSync(libPath)) {
          folders.push(libPath);
        }
      }
    }

    console.log(`[SteamService] Found ${folders.length} library folders`);
    return folders;
  } catch (error) {
    console.error('[SteamService] Error parsing libraryfolders.vdf:', error.message);
    return [defaultLib];
  }
}

/**
 * Parse games from a single Steam library folder
 * Reads all appmanifest_*.acf files and extracts game info
 * @param {string} libraryPath - Path to steamapps folder
 * @returns {Object[]} Array of game objects
 */
function parseGamesFromLibrary(libraryPath) {
  const games = [];
  
  if (!fs.existsSync(libraryPath)) {
    return games;
  }

  let files;
  try {
    files = fs.readdirSync(libraryPath);
  } catch (error) {
    console.error(`[SteamService] Error reading library ${libraryPath}:`, error.message);
    return games;
  }

  for (const file of files) {
    if (!file.startsWith(FILE_NAMES.APP_MANIFEST_PREFIX) || !file.endsWith(FILE_NAMES.APP_MANIFEST_SUFFIX)) {
      continue;
    }

    try {
      const content = fs.readFileSync(path.join(libraryPath, file), 'utf-8');
      const parsed = vdf.parse(content);
      const state = parsed.AppState || parsed.appstate;

      if (state?.appid && state?.name) {
        games.push({
          id: `steam_${state.appid}`,
          title: state.name,
          steamAppId: String(state.appid),
          launcher: LAUNCHER_TYPES.STEAM,
          libraryPath: libraryPath,
        });
      }
    } catch (error) {
      // Skip malformed manifests but log for debugging
      console.warn(`[SteamService] Skipped malformed manifest: ${file}`);
    }
  }

  return games;
}

/**
 * Get all Steam games from all library folders
 * Main entry point for Steam game discovery
 * @returns {Object[]} Array of all Steam games found
 */
function getSteamGames() {
  const steamPath = getSteamInstallPath();
  
  if (!steamPath) {
    console.warn('[SteamService] Cannot get games: Steam not found');
    return [];
  }

  const libraries = getLibraryFolders(steamPath);
  const allGames = [];

  for (const lib of libraries) {
    const games = parseGamesFromLibrary(lib);
    allGames.push(...games);
  }

  console.log(`[SteamService] Total games found: ${allGames.length}`);
  return allGames;
}

/**
 * Get the user's SteamID from localconfig.vdf
 * @param {string} steamPath - Path to Steam installation
 * @returns {string|null} SteamID64 or null if not found
 */
function getSteamUserId(steamPath) {
  if (cachedSteamId) {
    return cachedSteamId;
  }

  const localConfigPath = path.join(steamPath, 'userdata', 'localconfig.vdf');
  
  if (!fs.existsSync(localConfigPath)) {
    console.warn('[SteamService] localconfig.vdf not found');
    return null;
  }

  try {
    const content = fs.readFileSync(localConfigPath, 'utf-8');
    const parsed = vdf.parse(content);
    
    // Navigate: Valve > SteamUsers > <some number> > SteamID
    const users = parsed?.Valve?.SteamUsers || parsed?.users || {};
    const userIds = Object.keys(users);
    
    if (userIds.length > 0) {
      const firstUserId = userIds[0];
      cachedSteamId = firstUserId;
      console.log(`[SteamService] Found SteamID: ${cachedSteamId}`);
      return cachedSteamId;
    }
  } catch (error) {
    console.error('[SteamService] Error parsing localconfig.vdf:', error.message);
  }

  return null;
}

/**
 * Get artwork path for a Steam game
 * First checks local grid folder, falls back to CDN
 * @param {string} steamPath - Path to Steam installation
 * @param {string} appId - Steam app ID
 * @returns {Object} Artwork info with source and path
 */
function getGameArtwork(steamPath, appId) {
  // Try local grid first
  const steamId = getSteamUserId(steamPath);
  
  if (steamId) {
    const localGridPath = path.join(
      steamPath, 
      'userdata', 
      steamId, 
      STEAM_ARTWORK.GRID_FOLDER,
      `${appId}${STEAM_ARTWORK.GRID_EXTENSION}`
    );
    
    if (fs.existsSync(localGridPath)) {
      return {
        source: ARTWORK_SOURCE.LOCAL,
        path: localGridPath,
        cdnUrl: `${STEAM_ARTWORK.CDN_HEADER_BASE}/${appId}${STEAM_ARTWORK.HEADER_EXTENSION}`,
      };
    }
  }

  // Fallback to Steam CDN header image
  return {
    source: ARTWORK_SOURCE.CDN,
    path: null,
    cdnUrl: `${STEAM_ARTWORK.CDN_HEADER_BASE}/${appId}${STEAM_ARTWORK.HEADER_EXTENSION}`,
  };
}

/**
 * Enhance Steam games with artwork information
 * @param {Object[]} games - Array of Steam games
 * @returns {Object[]} Games with artwork added
 */
function enhanceGamesWithArtwork(games) {
  const steamPath = getSteamInstallPath();
  
  if (!steamPath) {
    return games.map(game => ({
      ...game,
      artwork: {
        source: ARTWORK_SOURCE.PLACEHOLDER,
        path: null,
        cdnUrl: null,
      }
    }));
  }

  return games.map(game => ({
    ...game,
    artwork: getGameArtwork(steamPath, game.steamAppId),
  }));
}

module.exports = {
  getSteamGames,
  getSteamInstallPath,
  getLibraryFolders,
  getGameArtwork,
  enhanceGamesWithArtwork,
};
