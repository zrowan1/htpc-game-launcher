#!/usr/bin/env node
/**
 * Refresh Steam Library Script
 * 
 * This script can be run from the command line to refresh the Steam library.
 * Useful for testing or forcing a rescan without opening the app.
 * 
 * Usage: node scripts/refresh-steam.js
 */

const path = require('path');

// Set up minimal Electron app environment
process.env.NODE_ENV = 'development';

// Mock electron's app module for the service
const mockApp = {
  getPath: () => path.join(__dirname, '..', 'src', 'data'),
  isReady: () => true,
};

// Mock require('electron') before loading the service
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === 'electron') {
    return { app: mockApp };
  }
  return originalRequire.apply(this, arguments);
};

// Now load the steam service
const { getSteamGames } = require('../src/main/services/steamService');

console.log('Refreshing Steam library...\n');

try {
  const games = getSteamGames();
  
  console.log(`Found ${games.length} Steam games:\n`);
  
  if (games.length > 0) {
    games.slice(0, 10).forEach((game, i) => {
      console.log(`  ${i + 1}. ${game.title} (AppID: ${game.steamAppId})`);
    });
    
    if (games.length > 10) {
      console.log(`  ... and ${games.length - 10} more`);
    }
  } else {
    console.log('  No Steam games found. Is Steam installed?');
  }
  
  console.log('\nRefresh complete!');
} catch (error) {
  console.error('Error refreshing Steam library:', error.message);
  process.exit(1);
}
