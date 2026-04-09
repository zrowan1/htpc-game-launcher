/**
 * Gamepad Utilities
 * 
 * Pure utility functions for gamepad input handling.
 * These functions help interpret gamepad state without side effects.
 * 
 * @module utils/gamepadUtils
 */

import { BUTTON_MAP, AXIS_INDICES } from '../../shared/constants';

const DEADZONE = 0.5; // Minimum waarde voor analog stick input

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
 * Get direction from analog stick or D-pad
 * Checkt zowel left analog stick als D-pad axes
 * @param {number[]} axes - Gamepad axes array
 * @returns {{x: number, y: number}} Direction (-1, 0, 1)
 */
export function getDpadDirection(axes) {
  // Eerst check D-pad axes (indien aanwezig)
  const dpadX = axes[AXIS_INDICES.DPAD_X] || 0;
  const dpadY = axes[AXIS_INDICES.DPAD_Y] || 0;
  
  // Als D-pad wordt gebruikt (waarde is niet 0), gebruik die
  if (Math.abs(dpadX) > 0.1 || Math.abs(dpadY) > 0.1) {
    return {
      x: Math.round(dpadX),
      y: Math.round(dpadY),
    };
  }
  
  // Anders gebruik left analog stick
  const leftStickX = axes[AXIS_INDICES.LEFT_STICK_X] || 0;
  const leftStickY = axes[AXIS_INDICES.LEFT_STICK_Y] || 0;
  
  // Apply deadzone en converteer naar -1, 0, of 1
  return {
    x: Math.abs(leftStickX) > DEADZONE ? Math.sign(leftStickX) : 0,
    y: Math.abs(leftStickY) > DEADZONE ? Math.sign(leftStickY) : 0,
  };
}

/**
 * Detect D-pad or analog stick movement
 * @param {number[]} prevAxes - Previous axes state
 * @param {number[]} currentAxes - Current axes state
 * @returns {{direction: string, moved: boolean}} Direction name and movement state
 */
export function detectDpadMovement(prevAxes, currentAxes) {
  const prev = getDpadDirection(prevAxes);
  const current = getDpadDirection(currentAxes);
  
  // Alles terug naar 0 (neutral) telt niet als "movement"
  if (current.x === 0 && current.y === 0) {
    return { direction: null, moved: false };
  }
  
  // Check of er een state change is
  if (prev.x === current.x && prev.y === current.y) {
    return { direction: null, moved: false };
  }
  
  let direction = null;
  // Prioriteit: horizontaal, dan verticaal
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

/**
 * Debug functie om gamepad state te loggen
 * @param {Object} gamepadState - Current gamepad state
 */
export function debugGamepadState(gamepadState) {
  const pressed = Object.entries(gamepadState.buttonsPressed)
    .filter(([_, v]) => v)
    .map(([k]) => k);
  
  const axes = gamepadState.axes
    .map((v, i) => Math.abs(v) > 0.1 ? `[${i}:${v.toFixed(2)}]` : '')
    .filter(Boolean);
  
  console.log('[Gamepad Debug] Buttons:', pressed.join(', ') || 'none', '| Axes:', axes.join(' ') || 'none');
}
