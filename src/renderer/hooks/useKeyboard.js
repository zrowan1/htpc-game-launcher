import { useState, useEffect } from 'react';

// Keyboard fallback for when no controller is connected.
// Maps keys to the same button names used by useGamepad:
//   Enter  → A  (launch / confirm)
//   Escape → B  (back / settings)
//   x      → X  (refresh Steam)
//   y      → Y  (add game)
export function useKeyboard() {
  const [buttonsPressed, setButtonsPressed] = useState({});

  useEffect(() => {
    const keysHeld = new Set();

    const KEY_TO_BUTTON = {
      Enter: 'A',
      Escape: 'B',
      KeyX: 'X',
      KeyY: 'Y',
    };

    const isInputFocused = () => {
      const tag = document.activeElement?.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA';
    };

    const handleKeyDown = (e) => {
      if (isInputFocused()) return;
      if (keysHeld.has(e.code)) return;
      keysHeld.add(e.code);
      const button = KEY_TO_BUTTON[e.code];
      if (button) {
        setButtonsPressed((prev) => ({ ...prev, [button]: true }));
      }
    };

    const handleKeyUp = (e) => {
      keysHeld.delete(e.code);
      const button = KEY_TO_BUTTON[e.code];
      if (button) {
        setButtonsPressed((prev) => ({ ...prev, [button]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return { buttonsPressed };
}
