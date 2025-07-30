# BrowserOS Network Proxy Server

This enhanced proxy server enables BrowserOS to be accessible from **any device on your network**, including mobile phones, tablets, and other computers. No more localhost-only restrictions!

## 🌐 Network Features

### Multi-Device Access
- **Mobile Support**: Access from smartphones and tablets
- **Cross-Platform**: Works on iOS, Android, Windows, Mac, Linux
- **Network Discovery**: Automatically detects available proxy servers
- **Real-time Status**: Live connection monitoring across devices

### Enhanced Compatibility
- **Complete CORS Support**: Unrestricted cross-origin requests
- **Frame Protection**: Advanced iframe security bypass
- **Mobile Optimization**: Touch-friendly interface support
- **Responsive Design**: Adapts to any screen size

## 🚀 Quick Start

### 1. Start the Network Proxy
```bash
npm run proxy
# or
node src/proxy/startProxy.js
```

### 2. Note the Network URLs
The server will display URLs like:
```
🌐 Network accessible on:
   • Local: http://localhost:3000
   • Network: http://192.168.1.100:3000
   • Network: http://10.0.0.50:3000
```

### 3. Access from Any Device
Open BrowserOS on any device using the network URLs:
- **Same Computer**: `http://localhost:3000`
- **Other Devices**: `http://192.168.1.100:3000` (use your actual IP)

## 📱 Mobile Setup

### iPhone/iPad
1. Open Safari
2. Navigate to `http://[YOUR-IP]:3000`
3. Add to Home Screen for app-like experience
4. Proxy will be auto-detected

### Android
1. Open Chrome or Firefox
2. Navigate to `http://[YOUR-IP]:3000`
3. Add to Home Screen
4. Enable Desktop Site if needed

### Other Devices
- **Smart TVs**: Use built-in browser
- **Tablets**: Any modern browser
- **Other Computers**: Chrome, Firefox, Safari, Edge

## 🔧 Network Configuration

### Firewall Setup
Make sure port 3000 is allowed:

**Windows:**
```cmd
netsh advfirewall firewall add rule name="BrowserOS Proxy" dir=in action=allow protocol=TCP localport=3000
```

**macOS:**
```bash
sudo pfctl -f /etc/pf.conf
# Or use System Preferences > Security & Privacy > Firewall
```

**Linux:**
```bash
sudo ufw allow 3000
# or
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

### Router Configuration
Most home routers don't require changes, but if needed:
1. Access router admin panel
2. Enable port forwarding for port 3000
3. Point to your computer's local IP

## 🌟 Advanced Features

### Automatic Discovery
BrowserOS automatically scans for proxy servers on:
- `localhost:3000`
- Common network ranges (192.168.x.x, 10.0.x.x, etc.)
- Displays all available servers in the proxy settings

### Load Balancing
If multiple proxy servers are running:
- BrowserOS shows all available options
- Users can manually select preferred server
- Automatic failover to working servers

### Security Features
- **Network-safe CORS**: Allows cross-origin requests safely
- **Frame protection**: Bypasses iframe restrictions
- **Content filtering**: Removes frame-busting scripts
- **Header sanitization**: Cleans security headers

## 🔍 Troubleshooting

### Can't Access from Other Devices

1. **Check Firewall**:
   - Ensure port 3000 is open
   - Try temporarily disabling firewall

2. **Verify Network**:
   - Ensure devices are on same WiFi network
   - Check if network allows device-to-device communication

3. **Test Connection**:
   ```bash
   # From another device, test if server is reachable
   curl http://[SERVER-IP]:3000/health
   ```

### Mobile Browser Issues

1. **Enable Desktop Mode**:
   - Some mobile sites work better in desktop mode
   - Toggle in browser settings

2. **Clear Cache**:
   - Clear browser cache and cookies
   - Try incognito/private mode

3. **Network Timeout**:
   - Check WiFi connection strength
   - Try moving closer to router

### Performance Optimization

1. **Server Location**:
   - Run proxy on fastest computer
   - Use wired connection for proxy server

2. **Network Quality**:
   - Use 5GHz WiFi when possible
   - Avoid network congestion times

## 📊 Monitoring & Analytics

### Health Checks
Visit `/health` endpoint for server status:
```json
{
  "status": "ok",
  "networkIPs": ["192.168.1.100", "10.0.0.50"],
  "clientIP": "192.168.1.105",
  "accessUrls": [
    "http://localhost:3000",
    "http://192.168.1.100:3000"
  ]
}
```

### Network Information
Visit `/network-info` for detailed network data:
```json
{
  "networkIPs": ["192.168.1.100"],
  "port": 3000,
  "proxyUrls": ["http://192.168.1.100:3000/proxy"]
}
```

## 🎯 Use Cases

### Family Computing
- **Kids' Devices**: Safe browsing on tablets
- **Smart TVs**: Web browsing on TV
- **Shared Access**: Multiple family members

### Work/Education
- **BYOD Environments**: Personal devices at work
- **Classroom Setup**: Student device access
- **Presentation Mode**: Demo from any device

### Development
- **Cross-Device Testing**: Test on real devices
- **Mobile Development**: Debug mobile sites
- **Network Debugging**: Monitor traffic patterns

## 🔐 Security Considerations

### Network Security
- **Local Network Only**: Server only accessible on local network
- **No Internet Exposure**: Doesn't open to external internet
- **Request Logging**: All requests are logged with client IPs

### Content Filtering
- **Frame Protection**: Safely bypasses iframe restrictions
- **Script Sanitization**: Removes harmful frame-busting code
- **Header Cleaning**: Removes restrictive security headers

### Privacy
- **No Data Storage**: Proxy doesn't store browsed content
- **Session Isolation**: Each device maintains separate sessions
- **Local Processing**: All processing happens on local network

This network-enabled proxy transforms BrowserOS into a truly multi-device, cross-platform browsing solution perfect for modern connected homes and workplaces!