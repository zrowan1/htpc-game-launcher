import React, { useState } from 'react';

export default function GameCard({ game, isSelected, onClick, onDoubleClick }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getImageUrl = () => {
    if (!game.artwork) return null;
    
    if (game.artwork.source === 'local' && game.artwork.path) {
      return window.electronAPI?.localPathToFileUrl(game.artwork.path) || null;
    }
    
    if (game.artwork.source === 'cdn' && game.artwork.cdnUrl) {
      return game.artwork.cdnUrl;
    }
    
    return null;
  };

  const imageUrl = getImageUrl();
  const showImage = imageUrl && !imageError;

  return (
    <div
      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 glass-card ${
        isSelected ? 'game-card-selected' : 'hover:scale-[1.02] hover:translate-y-[-4px]'
      }`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className="aspect-[3/4] relative bg-gray-900/50">
        {showImage ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
            )}
            <img
              src={imageUrl}
              alt={game.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800/50 to-gray-900/80">
            <svg
              className="w-16 h-16 text-gray-600 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
            <span className="text-gray-500 text-sm text-center px-4 line-clamp-2">
              {game.title}
            </span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-lg truncate drop-shadow-lg">
            {game.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              game.launcher === 'steam' 
                ? 'bg-blue-500/30 text-blue-300' 
                : 'bg-green-500/30 text-green-300'
            }`}>
              {game.launcher === 'steam' ? 'Steam' : 'EXE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
