import React from 'react';

export default function GameCard({ game, isSelected }) {
  return (
    <div
      className={`p-4 bg-gray-800 rounded-lg cursor-pointer transition-all ${
        isSelected ? 'game-card-selected' : 'hover:bg-gray-700'
      }`}
    >
      <div className="w-full h-32 bg-gray-700 rounded mb-2"></div>
      <h3 className="text-sm font-semibold truncate">{game.title}</h3>
      <p className="text-xs text-gray-400">{game.launcher}</p>
    </div>
  );
}
