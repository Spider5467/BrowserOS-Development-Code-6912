import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let proxyServer = null;

export const startProxyServer = () => {
  if (proxyServer) {
    console.log('Proxy server is already running');
    return;
  }

  console.log('Starting proxy server...');
  proxyServer = spawn('node', [path.join(__dirname, 'proxyServer.js')], {
    stdio: 'inherit',
    shell: true
  });

  proxyServer.on('error', (error) => {
    console.error('Failed to start proxy server:', error);
  });

  proxyServer.on('close', (code) => {
    console.log(`Proxy server process exited with code ${code}`);
    proxyServer = null;
  });

  return proxyServer;
};

export const stopProxyServer = () => {
  if (proxyServer) {
    console.log('Stopping proxy server...');
    proxyServer.kill();
    proxyServer = null;
  } else {
    console.log('No proxy server running');
  }
};