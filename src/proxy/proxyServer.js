// ES Module version of the proxy server - Network accessible
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { createServer } from 'http';
import os from 'os';

const app = express();
const PORT = process.env.PORT || 3000;

// Get network IP addresses
const getNetworkIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  Object.keys(interfaces).forEach(interfaceName => {
    interfaces[interfaceName].forEach(interface => {
      if (interface.family === 'IPv4' && !interface.internal) {
        ips.push(interface.address);
      }
    });
  });
  
  return ips;
};

const networkIPs = getNetworkIPs();

// Enable CORS for all routes - Allow all origins for network access
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'User-Agent', 'Referer'],
  credentials: false
}));

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Basic request logger with client IP
app.use((req, res, next) => {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Client: ${clientIP}`);
  next();
});

// Health check endpoint with network info
app.get('/health', (req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'BrowserOS proxy server is running',
    port: PORT,
    networkIPs: networkIPs,
    clientIP: clientIP,
    accessUrls: [
      `http://localhost:${PORT}`,
      ...networkIPs.map(ip => `http://${ip}:${PORT}`)
    ]
  });
});

// Network info endpoint
app.get('/network-info', (req, res) => {
  res.json({
    networkIPs: networkIPs,
    port: PORT,
    proxyUrls: networkIPs.map(ip => `http://${ip}:${PORT}/proxy`),
    healthUrls: networkIPs.map(ip => `http://${ip}:${PORT}/health`)
  });
});

// Main proxy endpoint
app.all('/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).json({ 
        error: 'URL parameter is required',
        usage: 'GET /proxy?url=https://example.com',
        networkAccess: `Available on: ${networkIPs.map(ip => `http://${ip}:${PORT}`).join(', ')}`
      });
    }

    console.log(`Proxying ${req.method} request to: ${targetUrl}`);
    
    // Validate URL
    let validUrl;
    try {
      validUrl = new URL(targetUrl);
    } catch (e) {
      return res.status(400).json({ 
        error: 'Invalid URL provided',
        url: targetUrl 
      });
    }

    // Prepare headers
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': req.method === 'GET' ? 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8' : 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    };

    // Forward some client headers
    if (req.headers.referer) headers.Referer = req.headers.referer;
    if (req.headers.cookie) headers.Cookie = req.headers.cookie;

    // Make request with proper headers
    const fetchOptions = {
      method: req.method,
      headers: headers,
      timeout: 30000
    };

    // Add body for POST/PUT requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body && Object.keys(req.body).length > 0) {
        fetchOptions.body = JSON.stringify(req.body);
        fetchOptions.headers['Content-Type'] = 'application/json';
      }
    }

    const response = await fetch(targetUrl, fetchOptions);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `HTTP ${response.status} ${response.statusText}`,
        url: targetUrl
      });
    }

    // Get content type
    const contentType = response.headers.get('content-type') || 'text/html';
    
    // Set headers to allow iframe embedding and cross-origin access
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.removeHeader('X-Frame-Options');
    
    // Remove CSP headers that might block embedding
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('Content-Security-Policy-Report-Only');
    
    // Add comprehensive CORS headers for network access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'false');

    // Forward some response headers
    if (response.headers.get('content-length')) {
      res.setHeader('Content-Length', response.headers.get('content-length'));
    }
    if (response.headers.get('last-modified')) {
      res.setHeader('Last-Modified', response.headers.get('last-modified'));
    }
    if (response.headers.get('etag')) {
      res.setHeader('ETag', response.headers.get('etag'));
    }

    // Handle different content types
    if (contentType.includes('text/html')) {
      // For HTML content, modify to prevent frame-busting and fix URLs
      let html = await response.text();
      
      // Remove frame-busting scripts
      html = html.replace(/if\s*\(\s*top\s*!=\s*self\s*\)/gi, 'if(false)');
      html = html.replace(/if\s*\(\s*window\s*!=\s*top\s*\)/gi, 'if(false)');
      html = html.replace(/if\s*\(\s*self\s*!=\s*top\s*\)/gi, 'if(false)');
      html = html.replace(/top\.location\s*=/gi, '//top.location=');
      html = html.replace(/parent\.location\s*=/gi, '//parent.location=');
      html = html.replace(/window\.top\.location/gi, '//window.top.location');
      html = html.replace(/window\.parent\.location/gi, '//window.parent.location');
      
      // Add base tag to handle relative URLs
      if (!html.includes('<base')) {
        const baseUrl = `${validUrl.protocol}//${validUrl.host}`;
        html = html.replace(/<head[^>]*>/i, `$&<base href="${baseUrl}">`);
      }
      
      // Inject script to prevent additional frame-busting
      const antiFrameBustScript = `
        <script>
          (function() {
            try {
              // Override window.top and parent references
              Object.defineProperty(window, 'top', { value: window, writable: false });
              Object.defineProperty(window, 'parent', { value: window, writable: false });
              
              // Block common frame-busting techniques
              var originalAlert = window.alert;
              window.alert = function() { return false; };
              
              // Prevent navigation changes
              var originalReplace = window.location.replace;
              window.location.replace = function() { return false; };
              
              console.log('BrowserOS Proxy: Frame protection active');
            } catch(e) {
              console.log('BrowserOS Proxy: Frame protection failed', e);
            }
          })();
        </script>
      `;
      html = html.replace('</head>', antiFrameBustScript + '</head>');
      
      res.send(html);
    } else {
      // For non-HTML content, stream directly
      const buffer = await response.buffer();
      res.end(buffer);
    }
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy request', 
      details: error.message,
      url: req.query.url,
      networkAccess: `Server available on: ${networkIPs.map(ip => `http://${ip}:${PORT}`).join(', ')}`
    });
  }
});

// OPTIONS handler for CORS preflight
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

// Start the server on all network interfaces (0.0.0.0)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 BrowserOS Proxy Server Started!`);
  console.log(`📍 Server running on port: ${PORT}`);
  console.log(`🌐 Network accessible on:`);
  console.log(`   • Local: http://localhost:${PORT}`);
  
  networkIPs.forEach(ip => {
    console.log(`   • Network: http://${ip}:${PORT}`);
  });
  
  console.log(`\n🔍 Health check endpoints:`);
  console.log(`   • http://localhost:${PORT}/health`);
  networkIPs.forEach(ip => {
    console.log(`   • http://${ip}:${PORT}/health`);
  });
  
  console.log(`\n🌐 Proxy usage:`);
  console.log(`   • http://localhost:${PORT}/proxy?url=https://example.com`);
  networkIPs.forEach(ip => {
    console.log(`   • http://${ip}:${PORT}/proxy?url=https://example.com`);
  });
  
  console.log(`\n✅ Ready to handle requests from any device on the network!`);
  console.log(`📱 Mobile devices can now access BrowserOS proxy using the network IPs above.`);
  console.log(`\n💡 Tip: Make sure your firewall allows connections on port ${PORT}`);
});

// Enhanced graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down proxy server gracefully...`);
  server.close(() => {
    console.log('✅ Proxy server closed.');
    console.log('👋 Goodbye!');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.log('⚠️ Force closing proxy server...');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

export default app;