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
      redirect: 'follow',
      compress: false // Disable compression to handle binary data properly
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
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
      res.send(buffer);
      return;
    }
    
    // For text content, process as before
    const data = await response.text();
    
    // If it's an HTML response, extensively modify it for iframe compatibility
    if (contentType.includes('text/html')) {
      let modifiedHtml = data
        // Remove all X-Frame-Options meta tags
        .replace(/<meta[^>]*http-equiv=["']?X-Frame-Options["']?[^>]*>/gi, '')
        // Remove all Content-Security-Policy meta tags
        .replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '')
        .replace(/<meta[^>]*name=["']?Content-Security-Policy["']?[^>]*>/gi, '')
        // Remove frame-busting scripts
        .replace(/if\s*\(\s*top\s*[!=]==?\s*self\s*\)|if\s*\(\s*self\s*[!=]==?\s*top\s*\)/gi, 'if(false)')
        .replace(/if\s*\(\s*parent\s*[!=]==?\s*self\s*\)|if\s*\(\s*self\s*[!=]==?\s*parent\s*\)/gi, 'if(false)')
        .replace(/top\.location\s*[!=]==?\s*self\.location/gi, 'false')
        .replace(/top\.location\s*[!=]==?\s*location/gi, 'false')
        .replace(/parent\.location\s*[!=]==?\s*self\.location/gi, 'false')
        .replace(/window\.top\s*[!=]==?\s*window\.self/gi, 'false')
        .replace(/window\.top\s*[!=]==?\s*window/gi, 'false')
        // Remove common frame-busting patterns
        .replace(/top\.location\.href\s*=\s*self\.location\.href/gi, '// frame bust disabled')
        .replace(/top\.location\.href\s*=\s*location\.href/gi, '// frame bust disabled')
        .replace(/top\.location\s*=\s*self\.location/gi, '// frame bust disabled')
        .replace(/top\.location\s*=\s*location/gi, '// frame bust disabled')
        .replace(/window\.top\.location\s*=\s*window\.location/gi, '// frame bust disabled')
        .replace(/parent\.location\s*=\s*self\.location/gi, '// frame bust disabled')
        // YouTube specific fixes
        .replace(/ytInitialData/g, 'ytInitialDataProxy')
        .replace(/ytInitialPlayerResponse/g, 'ytInitialPlayerResponseProxy')
        // Rewrite absolute URLs to use proxy (including images and resources)
        .replace(/(href|src|action|srcset)=["'](https?:\/\/[^"'\s]+)["']/gi, (match, attr, url) => {
          // Skip if it's already proxied
          if (url.includes('/proxy?url=')) return match;
          return `${attr}="/proxy?url=${encodeURIComponent(url)}"`;
        })
        // Handle srcset attributes for responsive images
        .replace(/srcset=["']([^"']+)["']/gi, (match, srcset) => {
          const newSrcset = srcset.replace(/https?:\/\/[^\s,]+/g, (url) => {
            if (url.includes('/proxy?url=')) return url;
            return `/proxy?url=${encodeURIComponent(url)}`;
          });
          return `srcset="${newSrcset}"`;
        })
        // Rewrite protocol-relative URLs
        .replace(/(href|src|action)=["']\/\/([^"'\s]+)["']/gi, (match, attr, url) => {
          const fullUrl = `https://${url}`;
          return `${attr}="/proxy?url=${encodeURIComponent(fullUrl)}"`;
        })
        // Handle CSS background images and other URL() references
        .replace(/url\(['"]?(https?:\/\/[^'")\s]+)['"]?\)/gi, (match, url) => {
          if (url.includes('/proxy?url=')) return match;
          return `url("/proxy?url=${encodeURIComponent(url)}")`;
        })
        // Handle CSS @import statements
        .replace(/@import\s+['"]?(https?:\/\/[^'";\s]+)['"]?/gi, (match, url) => {
          if (url.includes('/proxy?url=')) return match;
          return `@import "/proxy?url=${encodeURIComponent(url)}"`;
        })
        // Add base tag to handle relative URLs
        .replace(/<head[^>]*>/i, `<head><base href="${targetUrl}">`)
        // Inject JavaScript to handle dynamic frame-busting and URL rewriting
        .replace(/<\/head>/i, `
          <script>
            // Override frame-busting attempts
            (function() {
              var originalTop = window.top;
              var originalParent = window.parent;
              var originalSelf = window.self;
              
              Object.defineProperty(window, 'top', {
                get: function() { return window.self; },
                set: function() { return true; }
              });
              
              Object.defineProperty(window, 'parent', {
                get: function() { return window.self; },
                set: function() { return true; }
              });
              
              // Prevent location changes that would break out of frame
              try {
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
              
              // Override window.open to use proxy
              var originalOpen = window.open;
              window.open = function(url, name, features) {
                if (url && !url.includes('/proxy?url=') && (url.startsWith('http://') || url.startsWith('https://'))) {
                  url = '/proxy?url=' + encodeURIComponent(url);
                }
                return originalOpen.call(this, url, name, features);
              };
              
              // Override fetch to use proxy for cross-origin requests
              var originalFetch = window.fetch;
              window.fetch = function(url, options) {
                if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('/proxy?url=')) {
                  url = '/proxy?url=' + encodeURIComponent(url);
                }
                return originalFetch.call(this, url, options);
              };
              
              // Override XMLHttpRequest for AJAX requests
              var originalXHROpen = XMLHttpRequest.prototype.open;
              XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
                if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('/proxy?url=')) {
                  url = '/proxy?url=' + encodeURIComponent(url);
                }
                return originalXHROpen.call(this, method, url, async, user, password);
              };
              
              // Disable common frame-busting functions
              window.frameElement = null;
              
              // Override document.domain to prevent errors
              try {
                Object.defineProperty(document, 'domain', {
                  get: function() { return location.hostname; },
                  set: function() { return true; }
                });
              } catch(e) {}
              
              console.log('Proxy frame protection and URL rewriting enabled');
            })();
          </script>
          </head>`);

      res.send(modifiedHtml);
    } else if (contentType.includes('text/css')) {
      // Handle CSS files - rewrite URLs in CSS
      let modifiedCSS = data
        .replace(/url\(['"]?(https?:\/\/[^'")\s]+)['"]?\)/gi, (match, url) => {
          if (url.includes('/proxy?url=')) return match;
          return `url("/proxy?url=${encodeURIComponent(url)}")`;
        })
        .replace(/@import\s+['"]?(https?:\/\/[^'";\s]+)['"]?/gi, (match, url) => {
          if (url.includes('/proxy?url=')) return match;
          return `@import "/proxy?url=${encodeURIComponent(url)}"`;
        });
      
      res.send(modifiedCSS);
    } else if (contentType.includes('application/javascript') || contentType.includes('text/javascript')) {
      // Handle JavaScript files - be careful not to break functionality
      let modifiedJS = data
        // Only rewrite fetch and XMLHttpRequest URLs, not all strings
        .replace(/fetch\s*\(\s*['"`]([^'"`]+)['"`]/gi, (match, url) => {
          if (url.startsWith('http') && !url.includes('/proxy?url=')) {
            return match.replace(url, `/proxy?url=${encodeURIComponent(url)}`);
          }
          return match;
        });
      
      res.send(modifiedJS);
    } else {
      // For other text content, just pass through
      res.send(data);
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

// Handle POST requests for forms
app.post('/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Content-Type': req.headers['content-type'] || 'application/x-www-form-urlencoded'
    };

    // Add origin and referer if possible
    try {
      const urlObj = new URL(targetUrl);
      headers['Origin'] = urlObj.origin;
      headers['Referer'] = targetUrl;
    } catch (e) {
      // Invalid URL, continue without origin/referer
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: req.body
    });

    const contentType = response.headers.get('content-type') || 'text/plain';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (isBinaryContent(contentType)) {
      const buffer = await response.buffer();
      res.send(buffer);
    } else {
      const data = await response.text();
      res.send(data);
    }
  } catch (error) {
    console.error('POST Proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy POST request', details: error.message });
  }
});

// Advanced proxy for handling API calls and AJAX requests
app.all('/api-proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': req.headers.accept || '*/*',
      'Accept-Language': 'en-US,en;q=0.9'
    };

    // Add origin and referer if possible
    try {
      const urlObj = new URL(targetUrl);
      headers['Origin'] = urlObj.origin;
      headers['Referer'] = urlObj.origin;
    } catch (e) {
      // Invalid URL, continue without origin/referer
    }

    // Copy relevant headers from the original request
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'];
    }
    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'];
    }

    const fetchOptions = {
      method: req.method,
      headers
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    
    // Copy response headers
    response.headers.forEach((value, key) => {
      if (!key.toLowerCase().includes('content-encoding')) {
        res.setHeader(key, value);
      }
    });
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    if (isBinaryContent(contentType)) {
      const buffer = await response.buffer();
      res.status(response.status).send(buffer);
    } else {
      const data = await response.text();
      res.status(response.status).send(data);
    }
  } catch (error) {
    console.error('API Proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy API request', details: error.message });
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
    message: 'Enhanced proxy server with image support is running'
  });
});

// Create HTTP server
const server = createServer(app);

// Start the server
server.listen(PORT, () => {
  console.log(`Enhanced proxy server running on http://localhost:${PORT}`);
  console.log('Features enabled:');
  console.log('- Website iframe support');
  console.log('- Frame-busting protection');
  console.log('- Dynamic content rewriting');
  console.log('- CORS bypass');
  console.log('- POST/API request proxying');
  console.log('- Binary content support (images, videos, etc.)');
  console.log('- CSS and JavaScript URL rewriting');
  console.log('');
  console.log('Test the proxy:');
  console.log('- Health check: http://localhost:3000/health');
  console.log('- Proxy example: http://localhost:3000/proxy?url=https://example.com');
});

export default app;