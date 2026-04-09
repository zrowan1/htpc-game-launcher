import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/error-boundaries/ErrorBoundary';
import GameGrid from './components/GameGrid';
import SettingsMenu from './components/SettingsMenu';
import AddGameDialog from './components/AddGameDialog';
import { useGamepad } from './hooks/useGamepad';
import { useKeyboard } from './hooks/useKeyboard';
import { useGames } from './hooks/useGames';
import { onGameExited } from './services/appApi';
import { downloadCover, updateGame } from './services/gameApi';
import { TOAST_DURATION } from '../shared/constants';

/**
 * Root Application Component
 * 
 * Wraps the app with ErrorBoundary and manages global state:
 * - Settings menu visibility
 * - Add game dialog visibility
 * - Toast messages
 * - Game exit notifications
 */
export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

/**
 * Main app content component
 * Separated to allow ErrorBoundary to catch errors
 */
function AppContent() {
  const [showSettings, setShowSettings] = useState(false);
  const [showAddGame, setShowAddGame] = useState(false);
  const [gameExitedMsg, setGameExitedMsg] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  
  const { games, loading, error, addGame, removeGame, refreshSteamLibrary } = useGames();
  const gamepadState = useGamepad();
  const keyboardState = useKeyboard();

  // B button: toggle settings (only when add-game dialog is closed)
  useEffect(() => {
    if (gamepadState.buttonsPressed.B && !showAddGame) {
      setShowSettings((prev) => !prev);
    }
  }, [gamepadState.buttonsPressed.B, showAddGame]);

  useEffect(() => {
    if (keyboardState.buttonsPressed.B && !showAddGame) {
      setShowSettings((prev) => !prev);
    }
  }, [keyboardState.buttonsPressed.B, showAddGame]);

  // Y button: open add-game dialog (only on main grid)
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

  // Listen for game-exited IPC event (exe games only)
  useEffect(() => {
    const cleanup = onGameExited(() => {
      setGameExitedMsg(true);
      setTimeout(() => setGameExitedMsg(false), TOAST_DURATION);
    });
    return cleanup;
  }, []);

  const handleAddGame = async (gameData) => {
    const { coverUrl, ...gameWithoutCover } = gameData;
    
    const savedGame = await addGame(gameWithoutCover);
    
    if (coverUrl && savedGame.id) {
      try {
        const artwork = await downloadCover(savedGame.id, coverUrl);
        if (artwork) {
          await updateGame(savedGame.id, { artwork });
        }
      } catch (error) {
        console.warn('[App] Failed to download cover:', error);
      }
    }
    
    setShowAddGame(false);
  };

  const handleRefreshSteam = async () => {
    await refreshSteamLibrary();
    setShowSettings(false);
    setToastMsg('Steam library refreshed');
    setTimeout(() => setToastMsg(null), TOAST_DURATION);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="w-screen h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading games...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-screen h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-gray-800 rounded-lg">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Games</h1>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gray-900 text-white overflow-hidden">
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

      {showAddGame && (
        <AddGameDialog
          onConfirm={handleAddGame}
          onCancel={() => setShowAddGame(false)}
        />
      )}

      {(gameExitedMsg || toastMsg) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg text-sm z-50">
          {gameExitedMsg ? 'Game exited — returning to menu' : toastMsg}
        </div>
      )}
    </div>
  );
}
