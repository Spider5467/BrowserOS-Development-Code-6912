import React, { useState, useRef, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import ProxyControls from './ProxyControls';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiExternalLink, FiRefreshCw, FiArrowLeft, FiArrowRight: FiArrowRightNav, FiShield, FiLock, FiGlobe } = FiIcons;

const BrowserWindow = ({ url: initialUrl, darkMode = false }) => {
  const [url, setUrl] = useState(initialUrl);
  const [displayUrl, setDisplayUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([initialUrl]);
  const [historyPosition, setHistoryPosition] = useState(0);
  const [proxyEnabled, setProxyEnabled] = useState(true); // Enable by default for better compatibility
  const [proxyUrl, setProxyUrl] = useState('http://localhost:3000/proxy');
  const [showProxyControls, setShowProxyControls] = useState(false);
  const [proxyStatus, setProxyStatus] = useState('checking');
  const iframeRef = useRef(null);

  // Check proxy server status on mount
  useEffect(() => {
    checkProxyStatus();
    const interval = setInterval(checkProxyStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkProxyStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/health');
      if (response.ok) {
        setProxyStatus('connected');
      } else {
        setProxyStatus('error');
      }
    } catch (error) {
      setProxyStatus('disconnected');
    }
  };

  const handleUrlChange = (e) => {
    setDisplayUrl(e.target.value);
  };

  const getProxiedUrl = (targetUrl) => {
    if (!proxyEnabled || proxyStatus !== 'connected') return targetUrl;
    
    // Format the target URL
    let formattedUrl = targetUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    // Special handling for YouTube
    if (formattedUrl.includes('youtube.com') || formattedUrl.includes('youtu.be')) {
      // Convert YouTube URLs to embedded format for better compatibility
      if (formattedUrl.includes('watch?v=')) {
        const videoId = formattedUrl.split('watch?v=')[1].split('&')[0];
        formattedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&showinfo=1&rel=0`;
      }
    }
    
    // Return the proxied URL
    return `${proxyUrl}?url=${encodeURIComponent(formattedUrl)}`;
  };

  const loadUrl = (newUrl) => {
    // Format the URL
    let formattedUrl = newUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    // Update display URL
    setDisplayUrl(formattedUrl);
    setLoading(true);
    
    // Get the actual URL to load (proxied or direct)
    const urlToLoad = getProxiedUrl(formattedUrl);
    setUrl(urlToLoad);
    
    // Add to history if navigating to a new URL
    if (formattedUrl !== history[historyPosition]) {
      const newHistory = history.slice(0, historyPosition + 1);
      setHistory([...newHistory, formattedUrl]);
      setHistoryPosition(newHistory.length);
    }
    
    // Reset loading state after a delay
    setTimeout(() => {
      setLoading(false);
    }, 3000); // Increased timeout for complex sites
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      loadUrl(displayUrl);
    }
  };

  const openInNewWindow = () => {
    let urlToOpen = displayUrl;
    if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
      urlToOpen = `https://${urlToOpen}`;
    }
    
    // Open through proxy if enabled for better compatibility
    if (proxyEnabled && proxyStatus === 'connected') {
      urlToOpen = getProxiedUrl(urlToOpen);
    }
    
    window.open(urlToOpen, '_blank');
  };

  const navigateBack = () => {
    if (historyPosition > 0) {
      setHistoryPosition(historyPosition - 1);
      setDisplayUrl(history[historyPosition - 1]);
      
      const urlToLoad = getProxiedUrl(history[historyPosition - 1]);
      setUrl(urlToLoad);
      
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const navigateForward = () => {
    if (historyPosition < history.length - 1) {
      setHistoryPosition(historyPosition + 1);
      setDisplayUrl(history[historyPosition + 1]);
      
      const urlToLoad = getProxiedUrl(history[historyPosition + 1]);
      setUrl(urlToLoad);
      
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
    }, 1000);
  };

  // Effect for proxy state changes
  useEffect(() => {
    if (displayUrl) {
      // When proxy state changes, reload the current URL with or without proxy
      const currentUrl = displayUrl;
      const urlToLoad = getProxiedUrl(currentUrl);
      
      setUrl(urlToLoad);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, [proxyEnabled, proxyUrl, proxyStatus]);

  // Save browsing history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`browserOS_history_${initialUrl}`, JSON.stringify(history));
      localStorage.setItem(`browserOS_historyPosition_${initialUrl}`, historyPosition.toString());
      localStorage.setItem(`browserOS_proxyEnabled`, JSON.stringify(proxyEnabled));
      localStorage.setItem(`browserOS_proxyUrl`, proxyUrl);
    } catch (error) {
      console.error('Error saving browsing history:', error);
    }
  }, [history, historyPosition, initialUrl, proxyEnabled, proxyUrl]);

  // Load browsing history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(`browserOS_history_${initialUrl}`);
      const savedPosition = localStorage.getItem(`browserOS_historyPosition_${initialUrl}`);
      const savedProxyEnabled = localStorage.getItem(`browserOS_proxyEnabled`);
      const savedProxyUrl = localStorage.getItem(`browserOS_proxyUrl`);
      
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        setHistoryPosition(position);
        if (JSON.parse(savedHistory)[position]) {
          setDisplayUrl(JSON.parse(savedHistory)[position]);
        }
      }
      if (savedProxyEnabled) {
        setProxyEnabled(JSON.parse(savedProxyEnabled));
      }
      if (savedProxyUrl) {
        setProxyUrl(savedProxyUrl);
      }
    } catch (error) {
      console.error('Error loading browsing history:', error);
    }
  }, [initialUrl]);

  // Responsive design - adjust for mobile
  const isMobile = window.innerWidth <= 768;

  const getProxyStatusColor = () => {
    switch (proxyStatus) {
      case 'connected': return 'text-green-500';
      case 'checking': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'disconnected': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getProxyStatusText = () => {
    switch (proxyStatus) {
      case 'connected': return 'Connected';
      case 'checking': return 'Checking...';
      case 'error': return 'Error';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`flex flex-col h-full ${darkMode ? 'dark' : ''}`}>
      <div className={`p-2 sm:p-3 ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} border-b border-gray-700 flex flex-wrap sm:flex-nowrap items-center gap-2`}>
        <button
          className={`p-2 rounded-md ${historyPosition > 0 ? `${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-white hover:bg-gray-700` : `${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-gray-500 cursor-not-allowed`}`}
          onClick={navigateBack}
          disabled={historyPosition === 0}
        >
          <SafeIcon icon={FiArrowLeft} />
        </button>
        <button
          className={`p-2 rounded-md ${historyPosition < history.length - 1 ? `${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-white hover:bg-gray-700` : `${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-gray-500 cursor-not-allowed`}`}
          onClick={navigateForward}
          disabled={historyPosition === history.length - 1}
        >
          <SafeIcon icon={FiArrowRightNav} />
        </button>
        <button
          className={`p-2 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-white hover:bg-gray-700`}
          onClick={refresh}
        >
          <SafeIcon icon={FiRefreshCw} />
        </button>
        <div className="flex-1 flex items-center w-full sm:w-auto mt-2 sm:mt-0">
          <div className={`flex items-center ${proxyEnabled && proxyStatus === 'connected' ? 'text-green-500' : 'text-gray-400'} px-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} border-y border-l border-gray-700 rounded-l-md`}>
            <SafeIcon icon={proxyEnabled && proxyStatus === 'connected' ? FiShield : FiGlobe} />
          </div>
          <input
            type="text"
            className={`flex-1 px-3 py-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} border-y border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white`}
            value={displayUrl}
            onChange={handleUrlChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md text-sm font-medium flex items-center gap-1 hover:bg-indigo-700 transition-colors"
            onClick={() => loadUrl(displayUrl)}
          >
            <SafeIcon icon={FiArrowRight} />
            <span className={isMobile ? "hidden" : ""}>Go</span>
          </button>
        </div>
        <button
          className={`px-2 py-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-white rounded-md text-sm font-medium flex items-center gap-1 hover:bg-gray-700 transition-colors ${getProxyStatusColor()}`}
          onClick={() => setShowProxyControls(!showProxyControls)}
        >
          <SafeIcon icon={FiShield} />
          <span className={isMobile ? "hidden" : ""}>{getProxyStatusText()}</span>
        </button>
        <button
          className={`px-2 py-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-white rounded-md text-sm font-medium flex items-center gap-1 hover:bg-gray-700 transition-colors`}
          onClick={openInNewWindow}
        >
          <SafeIcon icon={FiExternalLink} />
          <span className={isMobile ? "hidden" : ""}>New Window</span>
        </button>
      </div>
      
      {showProxyControls && (
        <ProxyControls 
          darkMode={darkMode} 
          proxyEnabled={proxyEnabled} 
          setProxyEnabled={setProxyEnabled}
          proxyUrl={proxyUrl}
          setProxyUrl={setProxyUrl}
          proxyStatus={proxyStatus}
          onCheckStatus={checkProxyStatus}
        />
      )}
      
      <div className="relative flex-1 bg-white">
        {loading && (
          <div className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} bg-opacity-80 z-10`}>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <div className="text-white text-sm">Loading...</div>
              {proxyEnabled && proxyStatus === 'connected' && (
                <div className="text-green-400 text-xs mt-1">Using enhanced proxy</div>
              )}
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url.startsWith('http') ? url : `https://${url}`}
          className="w-full h-full border-none"
          title="browser-frame"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-downloads"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default BrowserWindow;