import React, { useState } from 'react';

export default function GameCard({ game, isSelected, index = 0, onClick, onDoubleClick }) {
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
      className={`relative rounded-2xl overflow-hidden cursor-pointer game-card glass-card game-card-animate ${
        isSelected ? 'game-card-selected' : ''
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className="aspect-[3/4] relative bg-white/5">
        {showImage ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 loading-shimmer" />
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02]">
            <svg
              className="w-16 h-16 text-white/30 mb-3"
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
            <span className="text-white/50 text-base text-center px-4 line-clamp-2">
              {game.title}
            </span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white/95 font-semibold text-xl truncate drop-shadow-lg">
            {game.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
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
