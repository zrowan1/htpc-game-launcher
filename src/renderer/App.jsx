import React, { useState, useEffect } from 'react';
import GameGrid from './components/GameGrid';
import SettingsMenu from './components/SettingsMenu';
import AddGameDialog from './components/AddGameDialog';
import { useGamepad } from './hooks/useGamepad';
import { useKeyboard } from './hooks/useKeyboard';
import { useGames } from './hooks/useGames';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showAddGame, setShowAddGame] = useState(false);
  const [gameExitedMsg, setGameExitedMsg] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const { games, addGame, removeGame, refreshSteamLibrary } = useGames();
  const gamepadState = useGamepad();
  const keyboardState = useKeyboard();

  // B button: toggle settings (only when add-game dialog is closed)
  useEffect(() => {
    if (gamepadState.buttonsPressed.B && !showAddGame) {
      setShowSettings((prev) => !prev);
    }
  }, [gamepadState.buttonsPressed.B]);

  useEffect(() => {
    if (keyboardState.buttonsPressed.B && !showAddGame) {
      setShowSettings((prev) => !prev);
    }
  }, [keyboardState.buttonsPressed.B]);

  // Y button: open add-game dialog (only on main grid)
  useEffect(() => {
    if (gamepadState.buttonsPressed.Y && !showSettings) {
      setShowAddGame(true);
    }
  }, [gamepadState.buttonsPressed.Y]);

  useEffect(() => {
    if (keyboardState.buttonsPressed.Y && !showSettings) {
      setShowAddGame(true);
    }
  }, [keyboardState.buttonsPressed.Y]);

  // Listen for game-exited IPC event (exe games only)
  useEffect(() => {
    if (!window.electronAPI?.onGameExited) return;
    const cleanup = window.electronAPI.onGameExited(() => {
      setGameExitedMsg(true);
      setTimeout(() => setGameExitedMsg(false), 3000);
    });
    return cleanup;
  }, []);

  const handleAddGame = async (gameData) => {
    await addGame(gameData);
    setShowAddGame(false);
  };

  const handleRefreshSteam = async () => {
    await refreshSteamLibrary();
    setShowSettings(false);
    setToastMsg('Steam library refreshed');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="w-screen h-screen bg-gray-900 text-white">
      {showSettings ? (
        <SettingsMenu
          onClose={() => setShowSettings(false)}
          onRefreshSteam={handleRefreshSteam}
        />
      ) : (
        <GameGrid
          games={games}
          gamepadState={gamepadState}
          onAddGame={addGame}
          onRemoveGame={removeGame}
        />
      )}

      {showAddGame && (
        <AddGameDialog
          onConfirm={handleAddGame}
          onCancel={() => setShowAddGame(false)}
        />
      )}

      {(gameExitedMsg || toastMsg) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg text-sm">
          {gameExitedMsg ? 'Game exited — returning to menu' : toastMsg}
        </div>
      )}
    </div>
  );
}
