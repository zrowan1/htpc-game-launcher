import React, { useState, useEffect } from 'react';
import { getAutoStartStatus, toggleAutoStart } from '../services/appApi';

export default function SettingsMenu({ onClose, onRefreshSteam }) {
  const [autoStartEnabled, setAutoStartEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load autostart status on mount
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

  const handleExit = () => {
    window.electronAPI?.quitApp();
  };

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
    <div className="w-full h-full bg-gray-900 p-8 flex flex-col">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>
      
      <button
        onClick={onRefreshSteam}
        className="px-4 py-2 bg-blue-600 rounded mb-4 hover:bg-blue-700 text-left"
      >
        Refresh Steam Library
      </button>
      
      <button
        onClick={handleToggleAutoStart}
        disabled={loading}
        className={`px-4 py-2 rounded mb-4 text-left transition-colors ${
          autoStartEnabled 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-gray-600 hover:bg-gray-700'
        }`}
      >
        {loading 
          ? 'Loading...' 
          : autoStartEnabled 
            ? 'Auto Start: ON (Click to Disable)' 
            : 'Auto Start: OFF (Click to Enable)'
        }
      </button>
      
      <button
        onClick={handleExit}
        className="px-4 py-2 bg-orange-600 rounded mb-4 hover:bg-orange-700 text-left"
      >
        Exit to Desktop
      </button>
      
      <button
        onClick={onClose}
        className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-left"
      >
        Back (B Button / Esc)
      </button>
    </div>
  );
}
