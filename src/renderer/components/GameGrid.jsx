import React, { useState } from 'react';
import GameCard from './GameCard';

export default function GameGrid({ games, gamepadState, onAddGame, onRemoveGame }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

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
            />
          ))
        )}
      </div>
    </div>
  );
}
