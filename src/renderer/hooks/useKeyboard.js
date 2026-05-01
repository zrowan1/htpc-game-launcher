/**
 * useKeyboard Hook
 * 
 * Custom React hook for keyboard input as fallback.
 * Maps keyboard keys to gamepad button names for consistent handling.
 * 
 * Key Mappings:
 * - Enter  → A (launch / confirm)
 * - Escape → B (back / settings)
 * - X      → X (refresh Steam)
 * - Y      → Y (add game)
 * 
 * @module hooks/useKeyboard
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Default button state
 */
const DEFAULT_BUTTONS = {};

/**
 * Map keyboard keys to gamepad buttons
 */
const KEY_TO_BUTTON = {
  Enter: 'A',
  Escape: 'B',
  Backspace: 'B',
  KeyX: 'X',
  KeyY: 'Y',
};

/**
 * Check if an input element is focused
 * Prevents triggering game actions while typing
 * @returns {boolean}
 */
function isInputFocused() {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tag = activeElement.tagName;
  const isContentEditable = activeElement.isContentEditable;

  return tag === 'INPUT' || tag === 'TEXTAREA' || isContentEditable;
}

/**
 * Hook for keyboard input
 * @returns {Object} Button state matching gamepad format
 */
export function useKeyboard() {
  const [buttonsPressed, setButtonsPressed] = useState(DEFAULT_BUTTONS);
  const keysHeldRef = useRef(new Set());

  const handleKeyDown = useCallback((e) => {
    // Ignore when typing in inputs
    if (isInputFocused()) return;

    // Prevent repeat while key is held
    if (keysHeldRef.current.has(e.code)) return;

    keysHeldRef.current.add(e.code);

    const button = KEY_TO_BUTTON[e.code];
    if (button) {
      setButtonsPressed((prev) => ({ ...prev, [button]: true }));
    }
  }, []);

  const handleKeyUp = useCallback((e) => {
    keysHeldRef.current.delete(e.code);

    const button = KEY_TO_BUTTON[e.code];
    if (button) {
      setButtonsPressed((prev) => ({ ...prev, [button]: false }));
    }
  }, []);

  useEffect(() => {
    console.log('[useKeyboard] Initializing keyboard fallback');
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      console.log('[useKeyboard] Cleaning up');
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return { buttonsPressed };
}

export default useKeyboard;
