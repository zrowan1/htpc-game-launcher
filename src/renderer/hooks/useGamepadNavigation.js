/**
 * useGamepadNavigation Hook
 *
 * Herbruikbare hook voor gamepad navigatie in UI componenten.
 * Managed focus index, D-pad navigatie, en A/B knop acties.
 *
 * @module hooks/useGamepadNavigation
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { detectDpadMovement, wasButtonJustPressed } from '../utils/gamepadUtils';

/**
 * Hook voor gamepad navigatie
 *
 * @param {Object} options
 * @param {Object} options.gamepadState - Huidige gamepad state van useGamepad
 * @param {number} options.itemCount - Totaal aantal navigeerbare items
 * @param {number} [options.columns=1] - Aantal kolommen voor grid layout
 * @param {Function} [options.onSelect] - Callback wanneer A wordt ingedrukt
 * @param {Function} [options.onCancel] - Callback wanneer B wordt ingedrukt
 * @param {boolean} [options.enabled=true] - Of navigatie actief is
 * @param {number} [options.focusedIndex=0] - Initiele focus index
 * @returns {Object} Navigatie state en controls
 */
export function useGamepadNavigation({
  gamepadState,
  itemCount,
  columns = 1,
  onSelect,
  onCancel,
  enabled = true,
  focusedIndex: initialFocusedIndex = 0,
}) {
  const [focusedIndex, setFocusedIndex] = useState(initialFocusedIndex);
  const prevAxesRef = useRef([0, 0, 0, 0, 0, 0, 0, 0]);
  const prevButtonsRef = useRef({});

  // Houd focusedIndex in bounds
  useEffect(() => {
    if (itemCount > 0 && focusedIndex >= itemCount) {
      setFocusedIndex(Math.max(0, itemCount - 1));
    }
  }, [itemCount, focusedIndex]);

  // D-pad / analog stick navigatie
  useEffect(() => {
    if (!enabled || itemCount === 0 || !gamepadState?.connected) return;

    const axes = gamepadState?.axes || [0, 0, 0, 0, 0, 0, 0, 0];
    const prev = prevAxesRef.current;

    const { direction, moved } = detectDpadMovement(prev, axes);

    if (moved) {
      setFocusedIndex((current) => {
        const row = Math.floor(current / columns);
        const col = current % columns;

        switch (direction) {
          case 'right':
            if (columns === 1) {
              return (current + 1) % itemCount;
            }
            return Math.min(current + 1, (row + 1) * columns - 1, itemCount - 1);

          case 'left':
            if (columns === 1) {
              return (current - 1 + itemCount) % itemCount;
            }
            return Math.max(current - 1, row * columns);

          case 'down':
            if (columns === 1) {
              return Math.min(current + 1, itemCount - 1);
            }
            return Math.min(current + columns, itemCount - 1);

          case 'up':
            if (columns === 1) {
              return Math.max(current - 1, 0);
            }
            return Math.max(current - columns, 0);

          default:
            return current;
        }
      });
    }

    prevAxesRef.current = axes;
  }, [gamepadState?.axes, gamepadState?.connected, enabled, itemCount, columns]);

  // A/B knoppen
  useEffect(() => {
    if (!enabled || !gamepadState?.connected) return;

    const pressed = gamepadState?.buttonsPressed || {};
    const prev = prevButtonsRef.current;

    if (wasButtonJustPressed(prev, pressed, 'A') && onSelect) {
      onSelect(focusedIndex);
    }

    if (wasButtonJustPressed(prev, pressed, 'B') && onCancel) {
      onCancel();
    }

    prevButtonsRef.current = pressed;
  }, [gamepadState?.buttonsPressed, gamepadState?.connected, enabled, focusedIndex, onSelect, onCancel]);

  const navigateTo = useCallback((index) => {
    if (index >= 0 && index < itemCount) {
      setFocusedIndex(index);
    }
  }, [itemCount]);

  return {
    focusedIndex,
    navigateTo,
  };
}

export default useGamepadNavigation;
