import React, { useState, useEffect, useRef } from 'react';
import GameCard from './GameCard';
import { launchGame } from '../services/gameApi';
import { GRID_CONFIG } from '../../shared/constants';
import { detectDpadMovement, wasButtonJustPressed } from '../utils/gamepadUtils';

const COLS = GRID_CONFIG.COLUMNS;

export default function GameGrid({ games, gamepadState, keyboardState, onAddGame, onRemoveGame }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Refs so keyboard/gamepad handlers always see current values without re-registering
  const gamesRef = useRef(games);
  const selectedIndexRef = useRef(selectedIndex);
  useEffect(() => { gamesRef.current = games; }, [games]);
  useEffect(() => { selectedIndexRef.current = selectedIndex; }, [selectedIndex]);

  // Keep selectedIndex in bounds when game list changes
  useEffect(() => {
    if (games.length > 0 && selectedIndex >= games.length) {
      setSelectedIndex(games.length - 1);
    }
  }, [games.length]);

  // --- Keyboard: arrow keys navigate, Enter launches ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      const total = gamesRef.current.length;
      if (total === 0) return;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % total);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + total) % total);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + COLS, total - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - COLS, 0));
          break;
        case 'Enter': {
          const game = gamesRef.current[selectedIndexRef.current];
          if (game) launchGame(game);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // empty — uses refs

  // --- Gamepad D-pad: edge detection via axes ---
  const prevAxesRef = useRef(gamepadState.axes);
  useEffect(() => {
    const axes = gamepadState.axes;
    const prev = prevAxesRef.current;
    const total = gamesRef.current.length;

    if (total > 0) {
      const { direction, moved } = detectDpadMovement(prev, axes);
      
      if (moved) {
        switch (direction) {
          case 'right':
            setSelectedIndex((i) => (i + 1) % total);
            break;
          case 'left':
            setSelectedIndex((i) => (i - 1 + total) % total);
            break;
          case 'down':
            setSelectedIndex((i) => Math.min(i + COLS, total - 1));
            break;
          case 'up':
            setSelectedIndex((i) => Math.max(i - COLS, 0));
            break;
        }
      }
    }

    prevAxesRef.current = axes;
  }, [gamepadState.axes]);

  // --- Gamepad A button: launch selected game ---
  const prevButtonsRef = useRef(gamepadState.buttonsPressed);
  useEffect(() => {
    const pressed = gamepadState.buttonsPressed;
    const prev = prevButtonsRef.current;

    if (wasButtonJustPressed(prev, pressed, 'A')) {
      const game = gamesRef.current[selectedIndexRef.current];
      if (game) launchGame(game);
    }

    prevButtonsRef.current = pressed;
  }, [gamepadState.buttonsPressed]);

  return (
    <div className="p-8 w-full h-full bg-gray-900">
      <h1 className="text-4xl font-bold mb-8">HTPC Game Launcher</h1>
      <div className="grid grid-cols-6 gap-4">
        {games.length === 0 ? (
          <p className="text-gray-400">No games found. Press Y to add one.</p>
        ) : (
          games.map((game, idx) => (
            <GameCard
              key={game.id}
              game={game}
              isSelected={idx === selectedIndex}
              onClick={() => setSelectedIndex(idx)}
              onDoubleClick={() => launchGame(game)}
            />
          ))
        )}
      </div>
      <p className="mt-6 text-xs text-gray-600">
        Navigate: Arrow keys / D-pad &nbsp;|&nbsp; Launch: Enter / A button / Double-click &nbsp;|&nbsp; Settings: Escape / B button
      </p>
    </div>
  );
}
