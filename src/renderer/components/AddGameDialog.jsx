import React, { useState, useEffect, useRef } from 'react';

export default function AddGameDialog({ onConfirm, onCancel }) {
  const [title, setTitle] = useState('');
  const [exePath, setExePath] = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleConfirm = () => {
    if (!title.trim()) return;
    onConfirm({ title: title.trim(), exePath: exePath.trim(), launcher: 'exe' });
  };

  // Esc cancels the dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-96 flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Add Game</h2>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Title *</label>
          <input
            ref={titleRef}
            className="w-full bg-gray-700 rounded px-3 py-2 text-white outline-none focus:ring-2 focus:ring-yellow-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
            placeholder="My Game"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Executable Path</label>
          <input
            className="w-full bg-gray-700 rounded px-3 py-2 text-white outline-none focus:ring-2 focus:ring-yellow-400"
            value={exePath}
            onChange={(e) => setExePath(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
            placeholder="C:\Games\mygame.exe"
          />
        </div>

        <div className="flex gap-3 mt-2">
          <button
            onClick={handleConfirm}
            disabled={!title.trim()}
            className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add (Enter)
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded"
          >
            Cancel (Esc / B)
          </button>
        </div>
      </div>
    </div>
  );
}
