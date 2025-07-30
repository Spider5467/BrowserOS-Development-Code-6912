#!/usr/bin/env node

console.log('🚀 Starting BrowserOS Proxy Server...');
console.log('Press Ctrl+C to stop the server\n');

// Import and start the proxy server
require('./proxyServer.js');

// Keep the process running
process.stdin.resume();