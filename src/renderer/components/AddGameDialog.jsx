import React, { useState, useEffect, useCallback, useRef } from 'react';
import { searchGames } from '../services/gameApi';
import VirtualKeyboard from './VirtualKeyboard';

export default function AddGameDialog({ onConfirm, onCancel }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCover, setSelectedCover] = useState(null);
  const [exePath, setExePath] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardTarget, setKeyboardTarget] = useState('search');
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);
  const dialogRef = useRef(null);
  
  const COLUMNS = 4;

  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchGames(query);
      setSearchResults(results);
      setFocusedIndex(0);
    } catch (error) {
      console.error('[AddGameDialog] Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (searchQuery.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 500);
    }
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  const handleGameSelect = async (game) => {
    setSelectedGame(game);
    setSearchQuery(game.title);
    setSearchResults([]);
    
    if (game.background_image) {
      setSelectedCover(game.background_image);
    }
  };

  const handleConfirm = () => {
    if (!selectedGame && !searchQuery.trim()) return;
    
    const title = searchQuery.trim() || selectedGame?.title;
    if (!title) return;

    const gameData = {
      title,
      launcher: 'exe',
      exePath: exePath.trim() || null,
      coverUrl: selectedCover,
    };
    
    onConfirm(gameData);
  };

  const openKeyboard = (target) => {
    setKeyboardTarget(target);
    setShowKeyboard(true);
  };

  const handleKeyboardValueChange = (value) => {
    if (keyboardTarget === 'search') {
      setSearchQuery(value);
    } else {
      setExePath(value);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showKeyboard) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setShowKeyboard(false);
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onCancel();
          break;
          
        case 'ArrowRight':
          e.preventDefault();
          if (searchResults.length > 0) {
            setFocusedIndex(prev => 
              prev < searchResults.length - 1 ? prev + 1 : prev
            );
          }
          break;
          
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          if (searchResults.length > 0) {
            setFocusedIndex(prev => {
              const row = Math.floor(prev / COLUMNS);
              const col = prev % COLUMNS;
              const nextRow = row + 1;
              const maxIndex = searchResults.length - 1;
              const nextIndex = Math.min(nextRow * COLUMNS + col, maxIndex);
              return nextIndex;
            });
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => {
            const col = prev % COLUMNS;
            const prevRow = Math.floor(prev / COLUMNS) - 1;
            if (prevRow < 0) return prev;
            return prevRow * COLUMNS + col;
          });
          break;
          
        case 'Enter':
          e.preventDefault();
          if (searchResults.length > 0 && focusedIndex < searchResults.length) {
            handleGameSelect(searchResults[focusedIndex]);
          }
          break;
          
        case ' ':
          e.preventDefault();
          openKeyboard('search');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showKeyboard, searchResults, focusedIndex, onCancel]);

  const getCoverUrl = (url) => {
    if (!url) return null;
    return url;
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div 
        ref={dialogRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(180deg, rgba(25, 25, 40, 0.98) 0%, rgba(15, 15, 25, 1) 100%)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Add Game</h2>
            <button
              onClick={onCancel}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Game Title *</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a game..."
                    className="w-full rounded-xl px-4 py-3 pr-12 text-white outline-none"
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openKeyboard('search')}
                  className="px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Start typing to search for game covers
              </p>
            </div>

            {searchResults.length > 0 && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Search Results (D-pad to navigate, Enter to select)
                </label>
                <div 
                  className="grid gap-4 max-h-[320px] overflow-y-auto p-1"
                  style={{ gridTemplateColumns: `repeat(${COLUMNS}, 1fr)` }}
                >
                  {searchResults.map((game, index) => {
                    const isFocused = index === focusedIndex;
                    const coverUrl = getCoverUrl(game.background_image);
                    
                    return (
                      <div
                        key={game.id}
                        onClick={() => handleGameSelect(game)}
                        className={`
                          relative rounded-xl overflow-hidden cursor-pointer
                          transition-all duration-200 select-none
                          ${isFocused ? 'scale-105 ring-2 ring-accent-primary z-10' : 'hover:scale-102'}
                        `}
                        style={{
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: isFocused 
                            ? '2px solid rgba(120, 180, 255, 0.8)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: isFocused 
                            ? '0 0 25px rgba(120, 180, 255, 0.5)'
                            : '0 4px 12px rgba(0, 0, 0, 0.3)',
                          aspectRatio: '3/4',
                        }}
                      >
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={game.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                          <p className="text-white text-xs font-medium truncate">
                            {game.title}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedCover && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Selected Game Preview</label>
                <div 
                  className="relative rounded-xl overflow-hidden"
                  style={{
                    width: '180px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(120, 180, 255, 0.3)',
                    boxShadow: '0 0 15px rgba(120, 180, 255, 0.2)',
                  }}
                >
                  <div style={{ aspectRatio: '16/9' }}>
                    <img
                      src={selectedCover}
                      alt="Selected cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                    <p className="text-white text-sm font-medium truncate">
                      {selectedGame?.title || searchQuery.trim()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCover(null);
                      setSelectedGame(null);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255, 100, 100, 0.9)' }}
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Executable Path (optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={exePath}
                  onChange={(e) => setExePath(e.target.value)}
                  placeholder="C:\Games\mygame.exe"
                  className="flex-1 rounded-xl px-4 py-3 text-white outline-none"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                />
                <button
                  onClick={() => openKeyboard('exe')}
                  className="px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div 
          className="flex gap-3 p-6 pt-4"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!searchQuery.trim() && !selectedGame}
            className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(180deg, rgba(120, 180, 255, 0.3) 0%, rgba(120, 180, 255, 0.15) 100%)',
              border: '1px solid rgba(120, 180, 255, 0.4)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(120, 180, 255, 0.2)',
            }}
          >
            Add Game
          </button>
        </div>
      </div>

      {showKeyboard && (
        <VirtualKeyboard
          isOpen={showKeyboard}
          onClose={() => setShowKeyboard(false)}
          onKeyPress={(key) => {
            if (key === 'Enter') {
              setShowKeyboard(false);
            }
          }}
          initialValue={keyboardTarget === 'search' ? searchQuery : exePath}
          onValueChange={handleKeyboardValueChange}
        />
      )}
    </div>
  );
}
