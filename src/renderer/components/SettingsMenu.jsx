import React from 'react';

export default function SettingsMenu({ onClose, onRefreshSteam }) {
  return (
    <div className="w-full h-full bg-gray-900 p-8 flex flex-col">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>
      <button
        onClick={onRefreshSteam}
        className="px-4 py-2 bg-blue-600 rounded mb-4 hover:bg-blue-700"
      >
        Refresh Steam Library
      </button>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
      >
        Back (B Button)
      </button>
    </div>
  );
}
