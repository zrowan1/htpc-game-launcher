import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getAutoStartStatus, toggleAutoStart } from '../services/appApi';
import { useGamepadNavigation } from '../hooks/useGamepadNavigation';
import { useFocusTrap } from '../hooks/useFocusTrap';

export default function SettingsMenu({ onClose, onRefreshSteam, gamepadState }) {
  const [autoStartEnabled, setAutoStartEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const buttonRefs = useRef([]);
  const containerRef = useFocusTrap({ isActive: true, onClose });

  const menuItems = [
    { id: 'refresh', label: 'Refresh Steam Library', action: onRefreshSteam, primary: true },
    { id: 'autostart', label: 'Auto Start', action: 'toggleAutostart', isToggle: true },
    { id: 'quit', label: 'Exit to Desktop', action: () => window.electronAPI?.quitApp(), danger: true },
    { id: 'back', label: 'Back', action: onClose },
  ];

  const { focusedIndex } = useGamepadNavigation({
    gamepadState,
    itemCount: menuItems.length,
    columns: 1,
    enabled: true,
    onSelect: useCallback((index) => {
      const item = menuItems[index];
      if (!item) return;

      if (item.action === 'toggleAutostart') {
        handleToggleAutoStart();
      } else if (typeof item.action === 'function') {
        item.action();
      }
    }, [menuItems]),
    onCancel: onClose,
  });

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const { enabled } = await getAutoStartStatus();
        setAutoStartEnabled(enabled);
      } catch (error) {
        console.error('[SettingsMenu] Error loading autostart status:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStatus();
  }, []);

  const handleToggleAutoStart = async () => {
    try {
      const result = await toggleAutoStart();
      if (result.success) {
        setAutoStartEnabled(result.enabled);
      }
    } catch (error) {
      console.error('[SettingsMenu] Error toggling autostart:', error);
    }
  };

  // Scroll focused button into view
  useEffect(() => {
    const ref = buttonRefs.current[focusedIndex];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusedIndex]);

  return (
    <div ref={containerRef} className="w-full h-full p-8 flex flex-col">
      <h1 className="text-5xl font-bold mb-8 text-white/95">Settings</h1>
      
      <div className="glass-card rounded-2xl p-6 max-w-md space-y-4">
        {menuItems.map((item, index) => {
          const isFocused = index === focusedIndex;
          let buttonClass = 'w-full button-glass text-left transition-all ';
          
          if (item.primary) {
            buttonClass += 'button-primary ';
          }
          if (item.danger) {
            buttonClass += 'text-orange-300/80 ';
          }
          if (isFocused) {
            buttonClass += 'game-card-selected transform scale-[1.02] ';
          }
          if (item.isToggle && autoStartEnabled) {
            buttonClass += 'bg-green-500/20 border-green-400/40 ';
          }

          return (
            <button
              key={item.id}
              ref={el => buttonRefs.current[index] = el}
              onClick={item.action === 'toggleAutostart' ? handleToggleAutoStart : item.action}
              disabled={item.isToggle && loading}
              className={buttonClass}
            >
              {item.isToggle
                ? (loading ? 'Loading...' : `Auto Start: ${autoStartEnabled ? 'ON' : 'OFF'}`)
                : item.label
              }
            </button>
          );
        })}
      </div>

      <div className="mt-auto">
        <p className="text-white/40 text-sm">
          Navigate: D-pad / Arrow keys &nbsp;|&nbsp; Select: A / Enter &nbsp;|&nbsp; Back: B / Escape
        </p>
      </div>
    </div>
  );
}
