/**
 * useGamepad Hook
 * 
 * Custom React hook for gamepad input handling.
 * Polls gamepad state at 60fps and returns normalized button/axis state.
 * 
 * @module hooks/useGamepad
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { BUTTON_MAP, AXIS_INDICES } from '../../shared/constants';

/**
 * Default gamepad state
 */
const DEFAULT_STATE = {
  buttonsPressed: {},
  axes: [0, 0, 0, 0, 0, 0, 0, 0],
  connected: false,
  timestamp: 0,
};

let debugInterval = null;

/**
 * Hook for gamepad input
 * @returns {Object} Gamepad state
 */
export function useGamepad() {
  const [gamepadState, setGamepadState] = useState(DEFAULT_STATE);
  const [isConnected, setIsConnected] = useState(false);
  const rafRef = useRef(null);
  const lastTimestampRef = useRef(0);

  /**
   * Read current gamepad state
   */
  const readGamepad = useCallback(() => {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0]; // Use first connected gamepad

    if (!gp) {
      if (isConnected) {
        setIsConnected(false);
        setGamepadState(DEFAULT_STATE);
      }
      return;
    }

    if (!isConnected) {
      setIsConnected(true);
      console.log('[useGamepad] Connected:', gp.id);
      console.log('[useGamepad] Buttons:', gp.buttons.length, 'Axes:', gp.axes.length);
      
      // Start debug logging na 2 seconden
      if (debugInterval) clearInterval(debugInterval);
      debugInterval = setInterval(() => {
        const gamepads = navigator.getGamepads();
        const gp = gamepads[0];
        if (gp) {
          const activeAxes = gp.axes
            .map((v, i) => ({ i, v: Math.abs(v) > 0.1 ? v.toFixed(2) : 0 }))
            .filter(a => a.v !== 0);
          if (activeAxes.length > 0) {
            console.log('[useGamepad] Active axes:', activeAxes.map(a => `[${a.i}]=${a.v}`).join(' '));
          }
        }
      }, 1000);
    }

    // Skip if state hasn't changed (optimization)
    if (gp.timestamp === lastTimestampRef.current) {
      return;
    }
    lastTimestampRef.current = gp.timestamp;

    // Map buttons using constants
    const buttons = {
      A: gp.buttons[BUTTON_MAP.A]?.pressed || false,
      B: gp.buttons[BUTTON_MAP.B]?.pressed || false,
      X: gp.buttons[BUTTON_MAP.X]?.pressed || false,
      Y: gp.buttons[BUTTON_MAP.Y]?.pressed || false,
      LB: gp.buttons[BUTTON_MAP.LB]?.pressed || false,
      RB: gp.buttons[BUTTON_MAP.RB]?.pressed || false,
      Back: gp.buttons[BUTTON_MAP.Back]?.pressed || false,
      Start: gp.buttons[BUTTON_MAP.Start]?.pressed || false,
    };

    setGamepadState({
      buttonsPressed: buttons,
      axes: gp.axes.length >= 8 ? gp.axes.slice(0, 8) : [...gp.axes, ...Array(8 - gp.axes.length).fill(0)],
      connected: true,
      timestamp: gp.timestamp,
    });
  }, [isConnected]);

  /**
   * Game loop for polling
   */
  const gameLoop = useCallback(() => {
    readGamepad();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [readGamepad]);

  // Start/stop polling
  useEffect(() => {
    console.log('[useGamepad] Starting polling');
    rafRef.current = requestAnimationFrame(gameLoop);

    return () => {
      console.log('[useGamepad] Stopping polling');
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (debugInterval) {
        clearInterval(debugInterval);
        debugInterval = null;
      }
    };
  }, [gameLoop]);

  // Listen for gamepad connection/disconnection
  useEffect(() => {
    const handleConnect = (e) => {
      console.log('[useGamepad] Gamepad connected:', e.gamepad.id);
      setIsConnected(true);
    };

    const handleDisconnect = (e) => {
      console.log('[useGamepad] Gamepad disconnected:', e.gamepad.id);
      setIsConnected(false);
      setGamepadState(DEFAULT_STATE);
      if (debugInterval) {
        clearInterval(debugInterval);
        debugInterval = null;
      }
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    // Check if already connected
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
      setIsConnected(true);
    }

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
    };
  }, []);

  return {
    ...gamepadState,
    isConnected,
  };
}

export default useGamepad;
