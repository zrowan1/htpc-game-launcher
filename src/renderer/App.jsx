import React, { useState, useEffect } from 'react';
import GameGrid from './components/GameGrid';
import SettingsMenu from './components/SettingsMenu';
import { useGamepad } from './hooks/useGamepad';
import { useKeyboard } from './hooks/useKeyboard';
import { useGames } from './hooks/useGames';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { games, addGame, removeGame, refreshSteamLibrary } = useGames();
  const gamepadState = useGamepad();
  const keyboardState = useKeyboard();

  useEffect(() => {
    // Handle B button (controller) for settings toggle
    if (gamepadState.buttonsPressed.B) {
      setShowSettings((prev) => !prev);
    }
  }, [gamepadState.buttonsPressed.B]);

  useEffect(() => {
    // Handle Escape key (keyboard fallback) for settings toggle
    if (keyboardState.buttonsPressed.B) {
      setShowSettings((prev) => !prev);
    }
  }, [keyboardState.buttonsPressed.B]);

  return (
    <div className="w-screen h-screen bg-gray-900 text-white">
      {showSettings ? (
        <SettingsMenu
          onClose={() => setShowSettings(false)}
          onRefreshSteam={refreshSteamLibrary}
        />
      ) : (
        <GameGrid
          games={games}
          gamepadState={gamepadState}
          onAddGame={addGame}
          onRemoveGame={removeGame}
        />
      )}
    </div>
  );
}
