/**
 * Game Utilities
 * 
 * Pure utility functions for game-related operations.
 * These functions have no side effects and work with plain data.
 * 
 * @module utils/gameUtils
 */

import { LAUNCHER_TYPES } from '../../shared/constants';

/**
 * Get the display name for a launcher type
 * @param {string} launcher - Launcher type
 * @returns {string} Human-readable launcher name
 */
export function getLauncherDisplayName(launcher) {
  const names = {
    [LAUNCHER_TYPES.STEAM]: 'Steam',
    [LAUNCHER_TYPES.EXE]: 'Executable',
    [LAUNCHER_TYPES.EPIC]: 'Epic Games',
    [LAUNCHER_TYPES.XBOX]: 'Xbox',
  };
  return names[launcher] || 'Unknown';
}

/**
 * Sort games alphabetically by title
 * @param {Object[]} games - Array of game objects
 * @returns {Object[]} Sorted array
 */
export function sortGamesByTitle(games) {
  return [...games].sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Filter games by launcher type
 * @param {Object[]} games - Array of game objects
 * @param {string} launcher - Launcher type to filter by
 * @returns {Object[]} Filtered array
 */
export function filterGamesByLauncher(games, launcher) {
  return games.filter((game) => game.launcher === launcher);
}

/**
 * Search games by title
 * @param {Object[]} games - Array of game objects
 * @param {string} query - Search query
 * @returns {Object[]} Matching games
 */
export function searchGames(games, query) {
  const lowerQuery = query.toLowerCase();
  return games.filter((game) =>
    game.title.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Group games by launcher
 * @param {Object[]} games - Array of game objects
 * @returns {Object} Games grouped by launcher type
 */
export function groupGamesByLauncher(games) {
  return games.reduce((groups, game) => {
    const launcher = game.launcher || 'unknown';
    if (!groups[launcher]) {
      groups[launcher] = [];
    }
    groups[launcher].push(game);
    return groups;
  }, {});
}

/**
 * Validate a game object
 * @param {Object} game - Game to validate
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
export function validateGame(game) {
  const errors = [];

  if (!game.title || typeof game.title !== 'string') {
    errors.push('Game must have a title');
  }

  if (!game.launcher) {
    errors.push('Game must have a launcher type');
  }

  if (game.launcher === LAUNCHER_TYPES.STEAM && !game.steamAppId) {
    errors.push('Steam games must have a steamAppId');
  }

  if (game.launcher === LAUNCHER_TYPES.EXE && !game.exePath) {
    errors.push('Executable games must have an exePath');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format game title for display (truncate if too long)
 * @param {string} title - Game title
 * @param {number} maxLength - Maximum length
 * @returns {string} Formatted title
 */
export function formatGameTitle(title, maxLength = 30) {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength - 3) + '...';
}
