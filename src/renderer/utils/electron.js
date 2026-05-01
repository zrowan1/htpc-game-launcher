/**
 * Electron Environment Utilities
 *
 * Shared utilities for detecting and accessing the Electron API.
 * These functions are used across all renderer API services.
 *
 * @module utils/electron
 */

/**
 * Check if running in Electron environment
 * @returns {boolean}
 */
export function isElectron() {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
}

/**
 * Get the electron API instance
 * @returns {Object|null}
 */
export function getApi() {
  return isElectron() ? window.electronAPI : null;
}
