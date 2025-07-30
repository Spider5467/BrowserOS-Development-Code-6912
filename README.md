# BrowserOS with Cloud Proxy

BrowserOS is a browser-based operating system with a built-in cloud proxy that works on any network, including school networks and Chromebooks.

## Features

- **Cloud-Based Proxy**: Works across any network, including school networks
- **Chromebook Compatible**: Designed to work seamlessly on Chromebooks
- **No Installation Required**: Runs entirely in the browser
- **No Network Restrictions**: The cloud proxy bypasses network restrictions
- **Auto-Connect**: Proxy automatically connects when you open the website
- **Cross-Platform**: Works on any device with a modern web browser
- **Secure and Private**: All traffic is encrypted

## How It Works

The cloud-based proxy works by:

1. Establishing a WebSocket connection to our cloud proxy server
2. Routing all web requests through the secure cloud proxy
3. Bypassing network restrictions and content filters
4. Delivering unblocked content directly to your browser

## Compatibility

- ✅ School networks
- ✅ Work networks
- ✅ Public WiFi with restrictions
- ✅ Chromebooks
- ✅ Tablets and mobile devices
- ✅ Desktop browsers

## Getting Started

Simply visit the BrowserOS website and the cloud proxy will automatically connect. No installation or setup required!

## Development

To run the project locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Building for Production

```bash
npm run build
```

## Technical Details

- **Frontend**: React with Vite
- **Proxy Communication**: Socket.IO WebSockets
- **Cloud Server**: Node.js on Render.com
- **UI Framework**: Tailwind CSS
- **Animation**: Framer Motion

## Security and Privacy

- All web traffic is encrypted using TLS
- No user data is stored on our servers
- Connections are established using secure WebSockets
- Each user gets a unique connection ID

## License

MIT