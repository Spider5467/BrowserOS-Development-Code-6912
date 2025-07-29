# Enhanced BrowserOS Proxy Server

This enhanced proxy server enables the BrowserOS browser to bypass website restrictions and iframe blocking, with special support for complex sites like YouTube, Facebook, and other platforms that normally prevent iframe embedding.

## 🚀 New Features

### YouTube & Complex Site Support
- **YouTube iframe compatibility**: Automatically handles YouTube's anti-iframe protection
- **Frame-busting prevention**: Blocks JavaScript that tries to break out of iframes  
- **Dynamic content rewriting**: Rewrites URLs and content on-the-fly
- **Enhanced headers**: Mimics real browser behavior more accurately

### Advanced Protection
- **Content Security Policy removal**: Strips CSP headers that prevent embedding
- **X-Frame-Options bypass**: Removes headers that block iframe usage
- **JavaScript injection**: Adds protective scripts to prevent frame-busting
- **Domain spoofing protection**: Handles domain-based restrictions

### Better Compatibility  
- **POST request support**: Handles form submissions through proxy
- **API request proxying**: Supports AJAX and API calls
- **Cookie handling**: Maintains session state across requests
- **Redirect following**: Automatically follows redirects

## 🎯 Supported Sites

The enhanced proxy now works with:
- ✅ **YouTube** - Full video playback and navigation
- ✅ **Google services** - Search, Drive, Docs (limited)
- ✅ **Social media** - Facebook, Twitter, Instagram (basic)
- ✅ **News sites** - Most major news websites
- ✅ **Educational** - Khan Academy, Coursera, edX
- ✅ **Entertainment** - Netflix (login page), Spotify (web player)
- ✅ **Shopping** - Amazon, eBay (browsing)

## 📋 How to Use

1. **Start the enhanced proxy server**:
   ```bash
   node src/proxy/startProxy.js
   ```

2. **The server will start on port 3000** with enhanced features:
   - Health check endpoint: `http://localhost:3000/health`
   - Main proxy: `http://localhost:3000/proxy?url=TARGET_URL`
   - API proxy: `http://localhost:3000/api-proxy?url=TARGET_URL`

3. **In BrowserOS**: 
   - The proxy is enabled by default for better compatibility
   - Click the shield icon in the browser to see status
   - Green shield = connected and working
   - Red shield = proxy server offline

4. **Test with YouTube**:
   - Navigate to `https://youtube.com`
   - Videos should load and play within the iframe
   - Comments, subscriptions, and most features work

## 🔧 Technical Implementation

### Frame-Busting Prevention
```javascript
// Injected into every page to prevent frame-busting
Object.defineProperty(window, 'top', {
  get: function() { return window.self; }
});
```

### Content Rewriting
- Rewrites all URLs to go through proxy
- Handles relative and absolute URLs
- Maintains proper base href for resources
- Preserves functionality while enabling iframe embedding

### Enhanced Headers
- Uses latest Chrome user agent
- Adds proper Accept headers
- Includes security headers that sites expect
- Handles CORS preflight requests

### YouTube Optimization
- Converts watch URLs to embed format when beneficial
- Handles YouTube's dynamic loading
- Preserves video quality settings
- Maintains playback controls

## 🚨 Important Notes

### Limitations
- Some sites may still detect proxy usage
- Login functionality may be limited on some sites
- Heavy JavaScript applications may have reduced functionality
- DRM-protected content will not work

### Performance
- Adds latency due to proxy processing
- Uses more bandwidth due to content rewriting
- May be slower on complex pages with many resources

### Legal & Ethical Use
- Only use for legitimate purposes
- Respect website terms of service
- Do not use to bypass paywalls or access restrictions
- Educational and testing purposes only

## 🔍 Troubleshooting

### Proxy Server Won't Start
- Check if port 3000 is available
- Install dependencies: `npm install`
- Check Node.js version (requires Node 16+)

### Site Not Loading
- Check proxy status (should show "Connected")
- Try refreshing the page
- Some sites may need multiple attempts
- Clear browser cache if issues persist

### YouTube Issues
- Try different video URLs
- Some videos may be region-restricted
- Age-restricted content may not work
- Live streams may have limitations

### Performance Issues
- Close unnecessary browser windows
- Restart the proxy server periodically
- Check network connection
- Some sites are inherently slow through proxy

## 📊 Status Indicators

In the browser interface:
- 🟢 **Green Shield**: Proxy connected and working
- 🟡 **Yellow Shield**: Proxy checking/connecting  
- 🔴 **Red Shield**: Proxy server offline
- 🔘 **Gray Shield**: Proxy disabled

## 🛠️ Advanced Configuration

The proxy server can be customized by modifying `proxyServer.js`:

- Change port number (default: 3000)
- Modify user agent strings
- Add custom header handling
- Implement site-specific optimizations
- Add request/response logging

This enhanced proxy system provides significantly better compatibility with modern websites while maintaining the security and functionality of the BrowserOS environment.