/**
 * App API
 * 
 * API layer for application-level operations.
 * 
 * @module services/appApi
 */

import { getApi } from '../utils/electron';

/**
 * Quit the application
 * @returns {Promise<void>}
 */
export async function quitApp() {
  const api = getApi();
  if (!api) {
    console.warn('[AppApi] Cannot quit: Not in Electron');
    return;
  }
  return api.quitApp();
}

/**
 * Listen for game exited events
 * @param {Function} callback - Callback function
 * @returns {Function} Cleanup function
 */
export function onGameExited(callback) {
  const api = getApi();
  if (!api) {
    console.warn('[AppApi] Cannot listen for game exit: Not in Electron');
    return () => {};
  }
  return api.onGameExited(callback);
}

/**
 * Get auto start status
 * @returns {Promise<{enabled: boolean}>}
 */
export async function getAutoStartStatus() {
  const api = getApi();
  if (!api) {
    console.warn('[AppApi] Cannot get autostart status: Not in Electron');
    return { enabled: false };
  }
  return api.getAutoStartStatus();
}

/**
 * Toggle auto start on/off
 * @returns {Promise<{enabled: boolean, success: boolean}>}
 */
export async function toggleAutoStart() {
  const api = getApi();
  if (!api) {
    console.warn('[AppApi] Cannot toggle autostart: Not in Electron');
    return { enabled: false, success: false };
  }
  return api.toggleAutoStart();
}

/**
 * Enable auto start
 * @returns {Promise<{enabled: boolean, success: boolean}>}
 */
export async function enableAutoStart() {
  const api = getApi();
  if (!api) {
    console.warn('[AppApi] Cannot enable autostart: Not in Electron');
    return { enabled: false, success: false };
  }
  return api.enableAutoStart();
}

/**
 * Disable auto start
 * @returns {Promise<{enabled: boolean, success: boolean}>}
 */
export async function disableAutoStart() {
  const api = getApi();
  if (!api) {
    console.warn('[AppApi] Cannot disable autostart: Not in Electron');
    return { enabled: false, success: false };
  }
  return api.disableAutoStart();
}
