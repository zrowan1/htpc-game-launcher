import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/error-boundaries/ErrorBoundary';
import GameGrid from './components/GameGrid';
import SettingsMenu from './components/SettingsMenu';
import AddGameDialog from './components/AddGameDialog';
import { useGamepad } from './hooks/useGamepad';
import { useKeyboard } from './hooks/useKeyboard';
import { useGames } from './hooks/useGames';
import { onGameExited } from './services/appApi';
import { TOAST_DURATION } from '../shared/constants';

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [showSettings, setShowSettings] = useState(false);
  const [showAddGame, setShowAddGame] = useState(false);
  const [gameExitedMsg, setGameExitedMsg] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  
  const { games, loading, error, addGame, removeGame, refreshSteamLibrary, reload } = useGames();
  const gamepadState = useGamepad();
  const keyboardState = useKeyboard();

  useEffect(() => {
    if (gamepadState.buttonsPressed.B && !showAddGame) {
      setShowSettings(prev => !prev);
    }
  }, [gamepadState.buttonsPressed.B, showAddGame]);

  useEffect(() => {
    if (keyboardState.buttonsPressed.B && !showAddGame) {
      setShowSettings(prev => !prev);
    }
  }, [keyboardState.buttonsPressed.B, showAddGame]);

  useEffect(() => {
    if (gamepadState.buttonsPressed.Y && !showSettings) {
      setShowAddGame(true);
    }
  }, [gamepadState.buttonsPressed.Y, showSettings]);

  useEffect(() => {
    if (keyboardState.buttonsPressed.Y && !showSettings) {
      setShowAddGame(true);
    }
  }, [keyboardState.buttonsPressed.Y, showSettings]);

  useEffect(() => {
    const cleanup = onGameExited(() => {
      setGameExitedMsg(true);
      setTimeout(() => setGameExitedMsg(false), TOAST_DURATION);
    });
    return cleanup;
  }, []);

  const handleAddGame = async (gameData) => {
    await addGame(gameData);
    await reload();
    setShowAddGame(false);
  };

  const handleRefreshSteam = async () => {
    await refreshSteamLibrary();
    setShowSettings(false);
    setToastMsg('Steam library refreshed');
    setTimeout(() => setToastMsg(null), TOAST_DURATION);
  };

  if (loading) {
    return (
      <div className="relative w-screen h-screen text-white flex items-center justify-center">
        <div className="app-background">
          <div className="ambient-orb ambient-orb-1" />
          <div className="ambient-orb ambient-orb-2" />
          <div className="ambient-orb ambient-orb-3" />
        </div>
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-xl text-white/80">Loading games...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-screen h-screen text-white flex items-center justify-center">
        <div className="app-background">
          <div className="ambient-orb ambient-orb-1" />
          <div className="ambient-orb ambient-orb-2" />
          <div className="ambient-orb ambient-orb-3" />
        </div>
        <div className="relative z-10 text-center max-w-md p-8 glass-card rounded-2xl">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Games</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="button-glass button-primary">
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen text-white overflow-hidden">
      <div className="app-background">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      <div className="relative z-10">
        {showSettings ? (
          <SettingsMenu
            onClose={() => setShowSettings(false)}
            onRefreshSteam={handleRefreshSteam}
          />
        ) : (
          <GameGrid
            games={games}
            gamepadState={gamepadState}
            keyboardState={keyboardState}
            onAddGame={addGame}
            onRemoveGame={removeGame}
          />
        )}
      </div>

      {showAddGame && (
        <AddGameDialog
          onConfirm={handleAddGame}
          onCancel={() => setShowAddGame(false)}
        />
      )}

      {(gameExitedMsg || toastMsg) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 toast px-6 py-3 text-sm z-50">
          {gameExitedMsg ? 'Game exited - returning to menu' : toastMsg}
        </div>
      )}
    </div>
  );
}