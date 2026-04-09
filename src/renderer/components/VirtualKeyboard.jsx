import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KEYBOARD_LAYOUT } from '../../shared/constants';

export default function VirtualKeyboard({ 
  onKeyPress, 
  onClose,
  isOpen = true,
  initialValue = '',
  onValueChange
}) {
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [displayValue, setDisplayValue] = useState(initialValue);
  const keysRef = useRef([]);
  
  const rows = [
    KEYBOARD_LAYOUT.ROW1,
    KEYBOARD_LAYOUT.ROW2,
    KEYBOARD_LAYOUT.ROW3,
    KEYBOARD_LAYOUT.ROW4,
  ];
  
  const specialKeys = KEYBOARD_LAYOUT.SPECIAL;
  
  const totalRows = rows.length;

  const getKeyDisplay = (key) => {
    if (key === '⌫') return '⌫';
    if (key === 'Space') return '____';
    if (key === 'Enter') return '✓';
    return key;
  };

  const handleKeyPress = useCallback((key) => {
    if (key === '⌫') {
      setDisplayValue(prev => {
        const newValue = prev.slice(0, -1);
        if (onValueChange) onValueChange(newValue);
        return newValue;
      });
    } else if (key === 'Space') {
      setDisplayValue(prev => {
        const newValue = prev + ' ';
        if (onValueChange) onValueChange(newValue);
        return newValue;
      });
    } else if (key === 'Enter') {
      if (onClose) onClose();
    } else {
      setDisplayValue(prev => {
        const newValue = prev + key.toLowerCase();
        if (onValueChange) onValueChange(newValue);
        return newValue;
      });
    }
    if (onKeyPress) onKeyPress(key);
  }, [onKeyPress, onClose, onValueChange]);

  const isSpecialFocused = currentRow === totalRows;
  const currentKey = isSpecialFocused 
    ? specialKeys[currentCol]
    : rows[currentRow]?.[currentCol];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          if (isSpecialFocused) {
            setCurrentCol(prev => Math.max(0, prev - 1));
          } else {
            setCurrentCol(prev => {
              const maxCol = rows[currentRow].length - 1;
              return prev > 0 ? prev - 1 : maxCol;
            });
          }
          break;
          
        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          if (isSpecialFocused) {
            setCurrentCol(prev => Math.min(specialKeys.length - 1, prev + 1));
          } else {
            setCurrentCol(prev => {
              const maxCol = rows[currentRow].length - 1;
              return prev < maxCol ? prev + 1 : 0;
            });
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          if (isRowFocused()) {
            if (currentRow === 0 && !isSpecialFocused) {
              setCurrentRow(totalRows);
              setCurrentCol(0);
            } else if (currentRow > 0) {
              setCurrentRow(currentRow - 1);
              setCurrentCol(0);
            }
          }
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          if (isSpecialFocused) {
            setCurrentRow(0);
          } else if (currentRow < totalRows - 1) {
            setCurrentRow(currentRow + 1);
          } else {
            setCurrentRow(totalRows);
            setCurrentCol(0);
          }
          break;
          
        case 'Enter':
        case ' ':
          if (e.key === ' ') e.preventDefault();
          e.stopPropagation();
          handleKeyPress(currentKey);
          break;
          
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          e.stopPropagation();
          handleKeyPress('⌫');
          break;
          
        case 'Tab':
          e.preventDefault();
          e.stopPropagation();
          handleKeyPress('Enter');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, currentRow, currentCol, currentKey, isSpecialFocused, handleKeyPress, rows, specialKeys, totalRows]);

  const isRowFocused = () => currentRow < totalRows;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-white/10"
      style={{ 
        background: 'linear-gradient(180deg, rgba(25, 25, 35, 0.98) 0%, rgba(15, 15, 25, 0.99) 100%)',
        backdropFilter: 'blur(40px)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 mr-4">
            <div className="bg-black/40 rounded-lg px-4 py-3 text-white text-xl font-mono min-h-[48px] flex items-center border border-white/10">
              {displayValue || <span className="text-gray-500">Typ hier...</span>}
              <span className="w-0.5 h-6 bg-accent-primary ml-1 animate-pulse" />
            </div>
          </div>
          <button
            onClick={() => handleKeyPress('Enter')}
            className="px-6 py-3 rounded-xl font-semibold transition-all duration-200"
            style={{
              background: 'linear-gradient(180deg, rgba(120, 180, 255, 0.3) 0%, rgba(120, 180, 255, 0.15) 100%)',
              border: '1px solid rgba(120, 180, 255, 0.4)',
              boxShadow: '0 4px 20px rgba(120, 180, 255, 0.2)',
            }}
          >
            Sluiten
          </button>
        </div>

        <div className="space-y-2">
          {rows.map((row, rowIndex) => (
            <div 
              key={rowIndex}
              className="flex justify-center gap-1.5"
              style={{ paddingLeft: rowIndex === 1 ? '20px' : rowIndex === 2 ? '40px' : '0' }}
            >
              {row.map((key, colIndex) => {
                const isFocused = currentRow === rowIndex && currentCol === colIndex && !isSpecialFocused;
                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    ref={el => {
                      if (!keysRef.current[rowIndex]) keysRef.current[rowIndex] = [];
                      keysRef.current[rowIndex][colIndex] = el;
                    }}
                    onClick={() => handleKeyPress(key)}
                    className={`
                      min-w-[48px] h-12 px-3 rounded-lg font-semibold text-lg
                      transition-all duration-150 select-none
                      ${isFocused 
                        ? 'scale-110 z-10' 
                        : 'hover:scale-105'
                      }
                    `}
                    style={isFocused ? {
                      background: 'linear-gradient(180deg, rgba(120, 180, 255, 0.5) 0%, rgba(120, 180, 255, 0.3) 100%)',
                      border: '2px solid rgba(120, 180, 255, 0.8)',
                      boxShadow: '0 0 20px rgba(120, 180, 255, 0.5), 0 0 40px rgba(120, 180, 255, 0.3)',
                      transform: 'scale(1.1)',
                      color: 'white',
                    } : {
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    {getKeyDisplay(key)}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-1.5 mt-2">
          {specialKeys.map((key, index) => {
            const isFocused = isSpecialFocused && currentCol === index;
            const isBackspace = key === '⌫';
            const isSpace = key === 'Space';
            const isEnter = key === 'Enter';
            
            return (
              <button
                key={key}
                ref={el => {
                  if (!keysRef.current[totalRows]) keysRef.current[totalRows] = [];
                  keysRef.current[totalRows][index] = el;
                }}
                onClick={() => handleKeyPress(key)}
                className={`
                  rounded-lg font-semibold transition-all duration-150 select-none
                  ${isFocused ? 'scale-110 z-10' : 'hover:scale-105'}
                  ${isSpace ? 'min-w-[240px]' : ''}
                `}
                style={isFocused ? {
                  background: 'linear-gradient(180deg, rgba(120, 180, 255, 0.5) 0%, rgba(120, 180, 255, 0.3) 100%)',
                  border: '2px solid rgba(120, 180, 255, 0.8)',
                  boxShadow: '0 0 20px rgba(120, 180, 255, 0.5), 0 0 40px rgba(120, 180, 255, 0.3)',
                  transform: 'scale(1.1)',
                  color: 'white',
                  height: '48px',
                  padding: isSpace ? '0 32px' : '0 24px',
                } : {
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  height: '48px',
                  padding: isSpace ? '0 32px' : '0 24px',
                }}
              >
                {isBackspace ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414a2 2 0 011.414-.586H19a2 2 0 012 2v10a2 2 0 01-2 2h-8.172a2 2 0 01-1.414-.586L3 12z" />
                  </svg>
                ) : isEnter ? (
                  <span className="text-sm">Done</span>
                ) : (
                  <span className="tracking-widest">____</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
