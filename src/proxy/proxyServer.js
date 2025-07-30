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

// Simple proxy endpoint that just forwards requests
app.get('/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log(`Proxying request to: ${targetUrl}`);
    
    // Make request to target URL
    const response = await fetch(targetUrl);
    
    // Get content type
    const contentType = response.headers.get('content-type');
    
    // Set content type in response
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    
    // Copy other important headers
    const headersToForward = [
      'cache-control',
      'etag',
      'last-modified',
      'content-length',
      'content-encoding',
      'content-disposition'
    ];
    
    headersToForward.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        res.setHeader(header, value);
      }
    });
    
    // Remove headers that prevent framing
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    
    // Pipe response directly
    response.body.pipe(res);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy request', 
      details: error.message,
      url: req.query.url 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Simple proxy server is running'
  });
});

// Start the server
const server = createServer(app);
server.listen(PORT, () => {
  console.log(`Simple proxy server running on http://localhost:${PORT}`);
  console.log(`Test the proxy: http://localhost:${PORT}/proxy?url=https://example.com`);
});

export default app;