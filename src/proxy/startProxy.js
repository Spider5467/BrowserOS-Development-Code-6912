#!/usr/bin/env node
import app from './proxyServer.js';

console.log('Starting BrowserOS Enhanced Proxy Server...');
console.log('Press Ctrl+C to stop the proxy server');

// Keep the process running
process.stdin.resume();

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\nShutting down proxy server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nProxy server terminated');
  process.exit(0);
});