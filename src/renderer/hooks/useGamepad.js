import { useState, useEffect } from 'react';

export function useGamepad() {
  const [gamepadState, setGamepadState] = useState({
    buttonsPressed: {},
    axes: [0, 0, 0, 0, 0, 0, 0, 0],
  });

  useEffect(() => {
    const handleGamepadInput = () => {
      const gamepads = navigator.getGamepads();
      if (gamepads[0]) {
        const gp = gamepads[0];
        const buttons = {};

        // Map buttons
        buttons.A = gp.buttons[0]?.pressed;
        buttons.B = gp.buttons[1]?.pressed;
        buttons.X = gp.buttons[2]?.pressed;
        buttons.Y = gp.buttons[3]?.pressed;
        buttons.Start = gp.buttons[9]?.pressed;

        setGamepadState({
          buttonsPressed: buttons,
          axes: gp.axes,
        });
      }
    };

    const interval = setInterval(handleGamepadInput, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

  return gamepadState;
}
