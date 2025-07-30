#!/usr/bin/env node

// ES Module version of the proxy starter
console.log('🚀 Starting BrowserOS Proxy Server...');
console.log('Press Ctrl+C to stop the server\n');

// Import and start the proxy server
import './proxyServer.js';

// Keep the process running
process.stdin.resume();