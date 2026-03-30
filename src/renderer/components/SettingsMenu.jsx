import React from 'react';

export default function SettingsMenu({ onClose, onRefreshSteam }) {
  const handleExit = () => {
    window.electronAPI?.quitApp();
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
