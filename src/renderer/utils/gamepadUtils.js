/**
 * Gamepad Utilities
 * 
 * Pure utility functions for gamepad input handling.
 * These functions help interpret gamepad state without side effects.
 * 
 * @module utils/gamepadUtils
 */

import { BUTTON_MAP, AXIS_INDICES } from '../../shared/constants';

/**
 * Check if a button is pressed
 * @param {Object} buttonsPressed - Current button state
 * @param {string} buttonName - Button name (A, B, X, Y, etc.)
 * @returns {boolean}
 */
export function isButtonPressed(buttonsPressed, buttonName) {
  return !!buttonsPressed[buttonName];
}

/**
 * Detect button press transition (was not pressed, now is pressed)
 * @param {Object} prevState - Previous button state
 * @param {Object} currentState - Current button state
 * @param {string} buttonName - Button to check
 * @returns {boolean}
 */
export function wasButtonJustPressed(prevState, currentState, buttonName) {
  return !prevState[buttonName] && !!currentState[buttonName];
}

/**
 * Detect button release transition
 * @param {Object} prevState - Previous button state
 * @param {Object} currentState - Current button state
 * @param {string} buttonName - Button to check
 * @returns {boolean}
 */
export function wasButtonJustReleased(prevState, currentState, buttonName) {
  return !!prevState[buttonName] && !currentState[buttonName];
}

/**
 * Get D-pad direction from axes
 * @param {number[]} axes - Gamepad axes array
 * @returns {{x: number, y: number}} Direction (-1, 0, 1)
 */
export function getDpadDirection(axes) {
  const x = axes[AXIS_INDICES.DPAD_X] || 0;
  const y = axes[AXIS_INDICES.DPAD_Y] || 0;
  
  return {
    x: Math.round(x),
    y: Math.round(y),
  };
}

/**
 * Detect D-pad movement
 * @param {number[]} prevAxes - Previous axes state
 * @param {number[]} currentAxes - Current axes state
 * @returns {{direction: string, moved: boolean}} Direction name and movement state
 */
export function detectDpadMovement(prevAxes, currentAxes) {
  const prev = getDpadDirection(prevAxes);
  const current = getDpadDirection(currentAxes);
  
  if (prev.x === current.x && prev.y === current.y) {
    return { direction: null, moved: false };
  }
  
  let direction = null;
  if (current.x === 1) direction = 'right';
  else if (current.x === -1) direction = 'left';
  else if (current.y === 1) direction = 'down';
  else if (current.y === -1) direction = 'up';
  
  return { direction, moved: true };
}

/**
 * Get all currently pressed buttons
 * @param {Object} buttonsPressed - Button state object
 * @returns {string[]} Array of pressed button names
 */
export function getPressedButtons(buttonsPressed) {
  return Object.entries(buttonsPressed)
    .filter(([_, pressed]) => pressed)
    .map(([name, _]) => name);
}

/**
 * Create a clean gamepad state object
 * @returns {Object} Default gamepad state
 */
export function createDefaultGamepadState() {
  return {
    buttonsPressed: {},
    axes: [0, 0, 0, 0, 0, 0, 0, 0],
  };
}
