/**
 * Shared Constants
 * 
 * These constants are used across both main and renderer processes.
 * This file should only contain pure data with no side effects.
 */

/**
 * Button mapping for 8BitDo 2C controller
 * @readonly
 */
export const BUTTON_MAP = {
  A: 0,      // Launch game (green button)
  B: 1,      // Settings/back (red button)
  X: 2,      // Refresh Steam (blue button)
  Y: 3,      // Add manual game (yellow button)
  LB: 4,     // Left bumper
  RB: 5,     // Right bumper
  Back: 8,   // Select/Back button
  Start: 9,  // Start/Menu button (full restart)
};

/**
 * Gamepad axis indices
 * @readonly
 */
export const AXIS_INDICES = {
  LEFT_STICK_X: 0,
  LEFT_STICK_Y: 1,
  RIGHT_STICK_X: 2,
  RIGHT_STICK_Y: 3,
  LEFT_TRIGGER: 4,
  RIGHT_TRIGGER: 5,
  DPAD_X: 6,  // D-pad horizontal (-1 left, 1 right)
  DPAD_Y: 7,  // D-pad vertical (-1 up, 1 down)
};

/**
 * IPC Channel names
 * Used for communication between main and renderer processes
 * @readonly
 */
export const IPC_CHANNELS = {
  // Game management
  LOAD_GAMES: 'load-games',
  SAVE_GAMES: 'save-games',
  ADD_GAME: 'add-game',
  REMOVE_GAME: 'remove-game',
  LAUNCH_GAME: 'launch-game',
  
  // Steam integration
  GET_STEAM_GAMES: 'get-steam-games',
  REFRESH_STEAM: 'refresh-steam',
  
  // App lifecycle
  QUIT_APP: 'quit-app',
  GAME_EXITED: 'game-exited',
};

/**
 * Grid layout configuration
 * @readonly
 */
export const GRID_CONFIG = {
  COLUMNS: 6,
  CARD_WIDTH: 200,
  CARD_HEIGHT: 300,
  GAP: 16,
};

/**
 * File paths and names
 * @readonly
 */
export const FILE_NAMES = {
  GAMES_JSON: 'games.json',
  STEAM_LIBRARY_VDF: 'libraryfolders.vdf',
  APP_MANIFEST_PREFIX: 'appmanifest_',
  APP_MANIFEST_SUFFIX: '.acf',
};

/**
 * Default game data structure
 * @readonly
 */
export const DEFAULT_GAMES_DATA = {
  version: 1,
  lastUpdated: null,
  games: [],
};

/**
 * Steam installation paths to check (Windows + Linux for dev)
 * @readonly
 */
export const STEAM_PATH_CANDIDATES = [
  'C:\\Program Files (x86)\\Steam',
  'C:\\Program Files\\Steam',
];

/**
 * Linux Steam paths (for development on Linux)
 * @readonly
 */
export const STEAM_PATH_LINUX = [
  '~/.steam/steam',
  '~/.local/share/Steam',
];

/**
 * Game launcher types
 * @readonly
 */
export const LAUNCHER_TYPES = {
  STEAM: 'steam',
  EXE: 'exe',
  EPIC: 'epic',      // Reserved for Phase 2
  XBOX: 'xbox',      // Reserved for Phase 2
};

/**
 * Toast message durations (ms)
 * @readonly
 */
export const TOAST_DURATION = 3000;

/**
 * Game launch delays (ms)
 * @readonly
 */
export const LAUNCH_DELAYS = {
  FOCUS_RETURN: 2000,    // Delay before returning focus after game exit
  STEAM_LAUNCH: 1000,    // Steam URL handling delay
  EXE_LAUNCH: 500,       // Direct exe launch delay
};
