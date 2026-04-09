/**
 * Auto Start Service
 * 
 * Handles Windows autostart functionality using auto-launch.
 * This allows the app to automatically launch on Windows boot.
 * 
 * @module services/autoStartService
 */

const AutoLaunch = require('auto-launch');

// Create auto-launcher instance with app details
const autoLauncher = new AutoLaunch({
  name: 'HTPC Game Launcher',
  path: process.execPath,
});

/**
 * Check if autostart is currently enabled
 * @returns {Promise<boolean>} True if autostart is enabled
 */
async function isAutoStartEnabled() {
  try {
    return await autoLauncher.isEnabled();
  } catch (error) {
    console.error('[AutoStartService] Error checking autostart status:', error.message);
    return false;
  }
}

/**
 * Enable autostart on Windows boot
 * @returns {Promise<boolean>} True if successfully enabled
 */
async function enableAutoStart() {
  try {
    await autoLauncher.enable();
    console.log('[AutoStartService] Autostart enabled');
    return true;
  } catch (error) {
    console.error('[AutoStartService] Error enabling autostart:', error.message);
    return false;
  }
}

/**
 * Disable autostart on Windows boot
 * @returns {Promise<boolean>} True if successfully disabled
 */
async function disableAutoStart() {
  try {
    await autoLauncher.disable();
    console.log('[AutoStartService] Autostart disabled');
    return true;
  } catch (error) {
    console.error('[AutoStartService] Error disabling autostart:', error.message);
    return false;
  }
}

/**
 * Toggle autostart status
 * @returns {Promise<{enabled: boolean, success: boolean}>} New status and success flag
 */
async function toggleAutoStart() {
  try {
    const isEnabled = await isAutoStartEnabled();
    
    if (isEnabled) {
      const success = await disableAutoStart();
      return { enabled: false, success };
    } else {
      const success = await enableAutoStart();
      return { enabled: true, success };
    }
  } catch (error) {
    console.error('[AutoStartService] Error toggling autostart:', error.message);
    return { enabled: false, success: false };
  }
}

module.exports = {
  isAutoStartEnabled,
  enableAutoStart,
  disableAutoStart,
  toggleAutoStart,
};
