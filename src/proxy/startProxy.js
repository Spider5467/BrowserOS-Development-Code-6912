#!/usr/bin/env node

import { startProxyServer } from './setupProxy.js';

startProxyServer();

console.log('Press Ctrl+C to stop the proxy server');

// Keep the process running
process.stdin.resume();

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Shutting down proxy server...');
  process.exit();
});