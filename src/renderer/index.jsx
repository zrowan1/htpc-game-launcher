import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initMockAPI } from './services/mockApi';

// Initialize mock API when running in browser (not Electron)
if (process.env.VITE_MOCK_MODE || !window.electronAPI) {
  initMockAPI();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
