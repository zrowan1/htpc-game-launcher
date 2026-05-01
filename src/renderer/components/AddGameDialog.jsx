import React, { useState, useEffect, useCallback, useRef } from 'react';
import { searchGames } from '../services/gameApi';
import VirtualKeyboard from './VirtualKeyboard';
import { useGamepadNavigation } from '../hooks/useGamepadNavigation';
import { useFocusTrap } from '../hooks/useFocusTrap';

export default function AddGameDialog({ onConfirm, onCancel, gamepadState }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCover, setSelectedCover] = useState(null);
  const [exePath, setExePath] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardTarget, setKeyboardTarget] = useState('search');
  
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);
  const resultRefs = useRef([]);
  const dialogRef = useFocusTrap({ isActive: !showKeyboard, onClose: onCancel });
  
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

  const handleGameSelect = useCallback((game) => {
    setSelectedGame(game);
    setSearchQuery(game.title);
    setSearchResults([]);
    
    if (game.background_image) {
      setSelectedCover(game.background_image);
    }
  }, []);

  const handleConfirm = useCallback(() => {
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
  }, [selectedGame, searchQuery, exePath, selectedCover, onConfirm]);

  const openKeyboard = useCallback((target) => {
    setKeyboardTarget(target);
    setShowKeyboard(true);
  }, []);

  const handleKeyboardValueChange = useCallback((value) => {
    if (keyboardTarget === 'search') {
      setSearchQuery(value);
    } else {
      setExePath(value);
    }
  }, [keyboardTarget]);

  // Gamepad navigatie voor zoekresultaten
  const { focusedIndex } = useGamepadNavigation({
    gamepadState,
    itemCount: searchResults.length,
    columns: COLUMNS,
    enabled: !showKeyboard && searchResults.length > 0,
    onSelect: useCallback((index) => {
      if (searchResults[index]) {
        handleGameSelect(searchResults[index]);
      }
    }, [searchResults, handleGameSelect]),
    onCancel: useCallback(() => {
      if (selectedGame) {
        setSelectedGame(null);
        setSelectedCover(null);
      } else {
        onCancel();
      }
    }, [selectedGame, onCancel]),
  });

  // Y knop opent keyboard
  const prevButtonsRef = useRef({});
  useEffect(() => {
    if (showKeyboard) return;
    
    const pressed = gamepadState?.buttonsPressed || {};
    const prev = prevButtonsRef.current;
    
    if (!prev.Y && pressed.Y) {
      openKeyboard('search');
    }
    
    prevButtonsRef.current = pressed;
  }, [gamepadState?.buttonsPressed, showKeyboard, openKeyboard]);

  // Scroll focused result into view
  useEffect(() => {
    const ref = resultRefs.current[focusedIndex];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusedIndex]);

  // Keyboard event handling
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
            // Handled by gamepad navigation hook
          }
          break;
          
        case 'ArrowLeft':
          e.preventDefault();
          if (searchResults.length > 0) {
            // Handled by gamepad navigation hook
          }
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          if (searchResults.length > 0) {
            // Handled by gamepad navigation hook
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          if (searchResults.length > 0) {
            // Handled by gamepad navigation hook
          }
          break;
          
        case 'Enter':
          e.preventDefault();
          if (selectedGame || searchQuery.trim()) {
            handleConfirm();
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
  }, [showKeyboard, searchResults, selectedGame, searchQuery, onCancel, handleConfirm, openKeyboard]);

  const getCoverUrl = (url) => {
    if (!url) return null;
    return url;
  };

  return (
    <div 
      className="modal-overlay flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div 
        ref={dialogRef}
        className="settings-sheet relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl"
      >
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white/95">Add Game</h2>
            <button
              onClick={onCancel}
              className="w-10 h-10 rounded-full flex items-center justify-center glass-card hover:bg-white/10 transition-all"
            >
              <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-base text-white/60 mb-2 block">Game Title *</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a game..."
                    className="w-full rounded-xl px-4 py-3 pr-12 text-white outline-none bg-white/5 border border-white/10"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openKeyboard('search')}
                  className="button-glass px-4"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-white/40 mt-1">
                Start typing to search for game covers (Y for keyboard)
              </p>
            </div>

            {searchResults.length > 0 && (
              <div>
                <label className="text-base text-white/60 mb-2 block">
                  Search Results ({searchResults.length} found)
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
                        ref={el => resultRefs.current[index] = el}
                        onClick={() => handleGameSelect(game)}
                        className={`game-card relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 select-none ${
                          isFocused ? 'game-card-selected' : ''
                        }`}
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
                          <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                            <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                          <p className="text-white text-sm font-medium truncate">
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
                <label className="text-base text-white/60 mb-2 block">Selected Game Preview</label>
                <div 
                  className="relative rounded-xl overflow-hidden glass-card"
                  style={{ width: '180px' }}
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
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-red-500/80"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="text-base text-white/60 mb-2 block">Executable Path (optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={exePath}
                  onChange={(e) => setExePath(e.target.value)}
                  placeholder="C:\Games\mygame.exe"
                  className="flex-1 rounded-xl px-4 py-3 text-white outline-none bg-white/5 border border-white/10"
                />
                <button
                  onClick={() => openKeyboard('exe')}
                  className="button-glass px-4"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-4 border-t border-white/10">
          <button
            onClick={onCancel}
            className="flex-1 button-glass"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!searchQuery.trim() && !selectedGame}
            className="flex-1 button-glass button-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
          gamepadState={gamepadState}
        />
      )}
    </div>
  );
}
