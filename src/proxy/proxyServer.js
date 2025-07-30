// ES Module version of the proxy server
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { createServer } from 'http';

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'User-Agent', 'Referer']
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'BrowserOS proxy server is running',
    port: PORT
  });
});

// Main proxy endpoint
app.get('/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).json({ 
        error: 'URL parameter is required',
        usage: 'GET /proxy?url=https://example.com'
      });
    }

    console.log(`Proxying request to: ${targetUrl}`);
    
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

    // Make request with proper headers
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive'
      },
      timeout: 30000
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `HTTP ${response.status} ${response.statusText}`,
        url: targetUrl
      });
    }

    // Get content type
    const contentType = response.headers.get('content-type') || 'text/html';
    
    // Set headers to allow iframe embedding
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.removeHeader('X-Frame-Options');
    
    // Remove CSP headers that might block embedding
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('Content-Security-Policy-Report-Only');
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle different content types
    if (contentType.includes('text/html')) {
      // For HTML content, modify to prevent frame-busting
      let html = await response.text();
      
      // Remove frame-busting scripts
      html = html.replace(/if\s*\(\s*top\s*!=\s*self\s*\)/gi, 'if(false)');
      html = html.replace(/if\s*\(\s*window\s*!=\s*top\s*\)/gi, 'if(false)');
      html = html.replace(/if\s*\(\s*self\s*!=\s*top\s*\)/gi, 'if(false)');
      html = html.replace(/top\.location\s*=/gi, '//top.location=');
      html = html.replace(/parent\.location\s*=/gi, '//parent.location=');
      html = html.replace(/window\.top\.location/gi, '//window.top.location');
      
      // Add base tag to handle relative URLs
      if (!html.includes('<base')) {
        const baseUrl = `${validUrl.protocol}//${validUrl.host}`;
        html = html.replace('<head>', `<head><base href="${baseUrl}">`);
      }
      
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
      url: req.query.url 
    });
  }
});

// POST proxy endpoint for form submissions
app.post('/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log(`Proxying POST request to: ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify(req.body),
      timeout: 30000
    });

    const contentType = response.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', contentType);
    
    const data = await response.text();
    res.send(data);
    
  } catch (error) {
    console.error('POST proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy POST request', 
      details: error.message 
    });
  }
});

// Start the server
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 BrowserOS Proxy Server Started!`);
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Proxy usage: http://localhost:${PORT}/proxy?url=https://example.com`);
  console.log(`\n✅ Ready to handle requests!\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down proxy server...');
  server.close(() => {
    console.log('✅ Proxy server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Proxy server terminated');
  server.close(() => {
    process.exit(0);
  });
});

export default app;