import React, { useState, useEffect } from 'react';
import { getAutoStartStatus, toggleAutoStart } from '../services/appApi';

export default function SettingsMenu({ onClose, onRefreshSteam }) {
  const [autoStartEnabled, setAutoStartEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="w-full h-full p-8 flex flex-col">
      <h1 className="text-5xl font-bold mb-8 text-white/95">Settings</h1>
      
      <div className="glass-card rounded-2xl p-6 max-w-md">
        <button
          onClick={onRefreshSteam}
          className="w-full button-glass button-primary mb-4 text-left"
        >
          Refresh Steam Library
        </button>
        
        <button
          onClick={handleToggleAutoStart}
          disabled={loading}
          className={`w-full button-glass mb-4 text-left transition-colors ${
            autoStartEnabled 
              ? 'bg-green-500/20 border-green-400/40' 
              : 'bg-white/5 border-white/10'
          }`}
        >
          {loading 
            ? 'Loading...' 
            : autoStartEnabled 
              ? 'Auto Start: ON' 
              : 'Auto Start: OFF'
          }
        </button>
      </div>

      <div className="mt-auto">
        <p className="text-white/40 text-sm mb-4">
          Power Options
        </p>
        <div className="glass-card rounded-2xl p-6 max-w-md">
          <button
            onClick={() => window.electronAPI?.quitApp()}
            className="w-full button-glass mb-3 text-left text-orange-300/80"
          >
            Exit to Desktop
          </button>
          <button
            onClick={onClose}
            className="w-full button-glass text-left"
          >
            Back (B Button / Esc)
          </button>
        </div>
      </div>
    </div>
  );
}