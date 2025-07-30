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

// Basic request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Helper function to determine if content is binary
const isBinaryContent = (contentType) => {
  if (!contentType) return false;
  const binaryTypes = [
    'image/',
    'video/',
    'audio/',
    'application/octet-stream',
    'application/pdf',
    'application/zip',
    'font/',
    'application/font'
  ];
  return binaryTypes.some(type => contentType.toLowerCase().includes(type));
};

// Enhanced proxy endpoint that handles complex sites like YouTube AND images
app.get('/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log(`Proxying request to: ${targetUrl}`);
    
    // Enhanced headers to mimic a real browser more closely
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    };

    // Add referer for better compatibility
    try {
      const urlObj = new URL(targetUrl);
      headers['Referer'] = `${urlObj.protocol}//${urlObj.host}/`;
    } catch (e) {
      // Invalid URL, continue without referer
    }

    const response = await fetch(targetUrl, {
      headers,
      redirect: 'follow'
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Request failed with status ${response.status}`,
        statusText: response.statusText 
      });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Set response headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Copy important headers from the original response
    const headersToKeep = [
      'content-length',
      'content-disposition',
      'content-encoding',
      'cache-control',
      'expires',
      'last-modified',
      'etag'
    ];
    
    headersToKeep.forEach(headerName => {
      const headerValue = response.headers.get(headerName);
      if (headerValue) {
        res.setHeader(headerName, headerValue);
      }
    });
    
    // Remove headers that prevent framing
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Type-Options');
    
    // Check if content is binary (images, videos, etc.)
    if (isBinaryContent(contentType)) {
      // For binary content, pipe the response directly
      const buffer = await response.buffer();
      return res.send(buffer);
    }
    
    // For text content, process as before
    const data = await response.text();
    
    // If it's an HTML response, modify it for iframe compatibility
    if (contentType.includes('text/html')) {
      let modifiedHtml = data
        // Remove all X-Frame-Options meta tags
        .replace(/<meta[^>]*http-equiv=["']?X-Frame-Options["']?[^>]*>/gi, '')
        // Remove all Content-Security-Policy meta tags
        .replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '')
        // Remove frame-busting scripts
        .replace(/if\s*\(\s*top\s*!==?\s*self\s*\)|if\s*\(\s*self\s*!==?\s*top\s*\)/gi, 'if(false)')
        .replace(/if\s*\(\s*parent\s*!==?\s*self\s*\)|if\s*\(\s*self\s*!==?\s*parent\s*\)/gi, 'if(false)')
        .replace(/top\.location\s*!==?\s*self\.location/gi, 'false')
        .replace(/top\.location\s*!==?\s*location/gi, 'false')
        .replace(/parent\.location\s*!==?\s*self\.location/gi, 'false')
        .replace(/window\.top\s*!==?\s*window\.self/gi, 'false')
        .replace(/window\.top\s*!==?\s*window/gi, 'false')
        // Add base tag to handle relative URLs
        .replace(/<head[^>]*>/i, `<head><base href="${targetUrl}">`)
        // Inject script to handle frame-busting
        .replace('</head>', `
          <script>
            // Override frame-busting attempts
            try {
              Object.defineProperty(window, 'top', {
                get: function() { return window.self; }
              });
              
              Object.defineProperty(window, 'parent', {
                get: function() { return window.self; }
              });
              
              // Prevent location changes that would break out of frame
              var originalLocationSetter = Object.getOwnPropertyDescriptor(Location.prototype, 'href').set;
              Object.defineProperty(Location.prototype, 'href', {
                set: function(url) {
                  if (url && !url.includes('/proxy?url=') && (url.startsWith('http://') || url.startsWith('https://'))) {
                    url = '/proxy?url=' + encodeURIComponent(url);
                  }
                  originalLocationSetter.call(this, url);
                }
              });
            } catch(e) {}
          </script>
        </head>`);

      return res.send(modifiedHtml);
    } else if (contentType.includes('text/css')) {
      // Handle CSS files - rewrite URLs in CSS
      let modifiedCSS = data
        .replace(/url\(['"]?(https?:\/\/[^'")\s]+)['"]?\)/gi, (match, url) => {
          if (url.includes('/proxy?url=')) return match;
          return `url("/proxy?url=${encodeURIComponent(url)}")`;
        });
      
      return res.send(modifiedCSS);
    } else {
      // For other text content, just pass through
      return res.send(data);
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

// Handle preflight OPTIONS requests
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).send();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Enhanced proxy server is running'
  });
});

// Create HTTP server
const server = createServer(app);

// Start the server
server.listen(PORT, () => {
  console.log(`Enhanced proxy server running on http://localhost:${PORT}`);
  console.log('Test the proxy:');
  console.log('- Health check: http://localhost:3000/health');
  console.log('- Proxy example: http://localhost:3000/proxy?url=https://example.com');
});

export default app;