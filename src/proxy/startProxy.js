#!/usr/bin/env node

// ES Module version of the proxy starter - Network accessible
console.log('🚀 Starting BrowserOS Network Proxy Server...');
console.log('🌐 This server will be accessible from any device on your network');
console.log('📱 Perfect for mobile devices, tablets, and other computers');
console.log('Press Ctrl+C to stop the server\n');

// Import and start the proxy server
import './proxyServer.js';

// Keep the process running
process.stdin.resume();

// Show helpful information
setTimeout(() => {
  console.log('\n💡 Pro Tips:');
  console.log('   • Share the network URLs with other devices');
  console.log('   • Make sure your firewall allows port 3000');
  console.log('   • The proxy will automatically be detected by BrowserOS');
  console.log('   • Check /health endpoint to verify server status');
}, 2000);