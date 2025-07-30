import React, { useState, useRef, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import ProxyControls from './ProxyControls';
import cloudProxyClient from '../proxy/cloudProxyClient';
import * as FiIcons from 'react-icons/fi';

const {
  FiArrowRight,
  FiExternalLink,
  FiRefreshCw,
  FiArrowLeft,
  FiArrowRight: FiArrowRightNav,
  FiShield,
  FiLock,
  FiGlobe,
  FiCloud,
  FiAlertTriangle,
  FiLink,
  FiSearch,
  FiSettings
} = FiIcons;

const BrowserWindow = ({ url: initialUrl, darkMode = false }) => {
  const [url, setUrl] = useState(initialUrl);
  const [displayUrl, setDisplayUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [history, setHistory] = useState([initialUrl]);
  const [historyPosition, setHistoryPosition] = useState(0);
  const [proxyEnabled, setProxyEnabled] = useState(true);
  const [showProxyControls, setShowProxyControls] = useState(false);
  const [proxyStatus, setProxyStatus] = useState('connecting');
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries, setMaxRetries] = useState(3);
  const [pageTitle, setPageTitle] = useState('');
  const iframeRef = useRef(null);

  // Connect to cloud proxy on mount
  useEffect(() => {
    cloudProxyClient.onStatusChange((status) => {
      setProxyStatus(status.status);
    });

    if (!cloudProxyClient.isConnected) {
      cloudProxyClient.connect();
    }
  }, []);

  const handleUrlChange = (e) => {
    setDisplayUrl(e.target.value);
  };

  const getProxiedUrl = (targetUrl) => {
    if (!proxyEnabled) return targetUrl;
    
    try {
      return cloudProxyClient.getProxyUrl(targetUrl);
    } catch (error) {
      console.error('Error getting proxied URL:', error);
      return targetUrl;
    }
  };

  const loadUrl = async (newUrl) => {
    // Format the URL
    let formattedUrl = newUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setDisplayUrl(formattedUrl);
    setLoading(true);
    setLoadError(null);
    setRetryCount(0);
    setPageTitle('');

    // Get the actual URL to load (proxied or direct)
    const urlToLoad = proxyEnabled ? getProxiedUrl(formattedUrl) : formattedUrl;
    console.log('Loading URL:', urlToLoad);
    
    setUrl(urlToLoad);

    // Add to history if navigating to a new URL
    if (formattedUrl !== history[historyPosition]) {
      const newHistory = history.slice(0, historyPosition + 1);
      setHistory([...newHistory, formattedUrl]);
      setHistoryPosition(newHistory.length);
    }

    // For safety, set a timeout to stop loading state after a reasonable time
    setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 10000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      loadUrl(displayUrl);
    }
  };

  const handleIframeError = () => {
    console.log('Iframe failed to load, retrying...');
    setLoadError('Failed to load website');
    
    if (proxyEnabled && retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      
      // Try switching to next service if available
      if (cloudProxyClient.switchToNextService()) {
        console.log(`Retry ${retryCount + 1}: Switched to next proxy service`);
        const newProxiedUrl = getProxiedUrl(displayUrl);
        setUrl(newProxiedUrl);
        setLoadError(null);
        setLoading(true);
        
        setTimeout(() => setLoading(false), 5000);
      } else {
        setLoadError('All proxy services failed. Try disabling proxy or check your connection.');
      }
    } else if (!proxyEnabled && retryCount < 1) {
      // If proxy is disabled, try once more directly
      setRetryCount(prev => prev + 1);
      setUrl(displayUrl);
      setLoading(true);
      setTimeout(() => setLoading(false), 5000);
    } else {
      setLoadError('Unable to load website. Try a different URL or toggle proxy settings.');
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setLoadError(null);
    
    // Try to get page title from iframe
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const iframeTitle = iframeRef.current.contentWindow.document.title;
        if (iframeTitle) {
          setPageTitle(iframeTitle);
        }
      }
    } catch (e) {
      // Cross-origin restrictions may prevent reading the title
      console.log('Could not access iframe title due to cross-origin policy');
    }
  };

  const openInNewWindow = () => {
    let urlToOpen = displayUrl;
    if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
      urlToOpen = `https://${urlToOpen}`;
    }

    // For new windows, it's usually better to use the original URL
    window.open(urlToOpen, '_blank');
  };

  const navigateBack = () => {
    if (historyPosition > 0) {
      setHistoryPosition(historyPosition - 1);
      setDisplayUrl(history[historyPosition - 1]);
      const urlToLoad = proxyEnabled ? getProxiedUrl(history[historyPosition - 1]) : history[historyPosition - 1];
      setUrl(urlToLoad);
      setLoading(true);
      setLoadError(null);
      setPageTitle('');
      setTimeout(() => setLoading(false), 5000);
    }
  };

  const navigateForward = () => {
    if (historyPosition < history.length - 1) {
      setHistoryPosition(historyPosition + 1);
      setDisplayUrl(history[historyPosition + 1]);
      const urlToLoad = proxyEnabled ? getProxiedUrl(history[historyPosition + 1]) : history[historyPosition + 1];
      setUrl(urlToLoad);
      setLoading(true);
      setLoadError(null);
      setPageTitle('');
      setTimeout(() => setLoading(false), 5000);
    }
  };

  const refresh = () => {
    setLoading(true);
    setLoadError(null);
    setRetryCount(0);
    setPageTitle('');
    
    // Force iframe reload
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        iframeRef.current.src = currentSrc;
      }, 100);
    }
    
    setTimeout(() => setLoading(false), 5000);
  };

  // Effect for proxy state changes
  useEffect(() => {
    if (displayUrl) {
      const currentUrl = displayUrl;
      const urlToLoad = proxyEnabled ? getProxiedUrl(currentUrl) : currentUrl;
      setUrl(urlToLoad);
      setLoading(true);
      setLoadError(null);
      setPageTitle('');
      setTimeout(() => setLoading(false), 5000);
    }
  }, [proxyEnabled]);

  // Save browsing history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`browserOS_history_${initialUrl}`, JSON.stringify(history));
      localStorage.setItem(`browserOS_historyPosition_${initialUrl}`, historyPosition.toString());
      localStorage.setItem(`browserOS_proxyEnabled`, JSON.stringify(proxyEnabled));
    } catch (error) {
      console.error('Error saving browsing history:', error);
    }
  }, [history, historyPosition, initialUrl, proxyEnabled]);

  // Load browsing history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(`browserOS_history_${initialUrl}`);
      const savedPosition = localStorage.getItem(`browserOS_historyPosition_${initialUrl}`);
      const savedProxyEnabled = localStorage.getItem(`browserOS_proxyEnabled`);

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
      if (savedProxyEnabled !== null) {
        setProxyEnabled(JSON.parse(savedProxyEnabled));
      }
    } catch (error) {
      console.error('Error loading browsing history:', error);
    }
  }, [initialUrl]);

  const isMobile = window.innerWidth <= 768;

  const getProxyStatusColor = () => {
    switch (proxyStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'disconnected': return 'text-gray-500';
      case 'fallback': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getProxyStatusText = () => {
    switch (proxyStatus) {
      case 'connected': return 'Proxy';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Error';
      case 'disconnected': return 'No Proxy';
      case 'fallback': return 'Fallback';
      default: return 'Proxy';
    }
  };

  const getProxyStatusIcon = () => {
    switch (proxyStatus) {
      case 'connected': return FiShield;
      case 'connecting': return FiRefreshCw;
      case 'error': return FiAlertTriangle;
      case 'disconnected': return FiGlobe;
      case 'fallback': return FiCloud;
      default: return FiShield;
    }
  };

  return (
    <div className={`flex flex-col h-full ${darkMode ? 'dark' : ''}`}>
      <div className={`p-2 sm:p-3 ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} border-b border-gray-700 flex flex-wrap sm:flex-nowrap items-center gap-2`}>
        <div className="flex items-center gap-1">
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
        </div>

        <div className="flex-1 flex items-center w-full sm:w-auto mt-2 sm:mt-0">
          <div className={`flex items-center ${proxyEnabled && proxyStatus === 'connected' ? 'text-green-500' : 'text-gray-400'} px-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} border-y border-l border-gray-700 rounded-l-md`}>
            <SafeIcon icon={FiSearch} />
          </div>
          <input
            type="text"
            className={`flex-1 px-3 py-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} border-y border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white`}
            value={displayUrl}
            onChange={handleUrlChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter URL or search term..."
          />
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md text-sm font-medium flex items-center gap-1 hover:bg-indigo-700 transition-colors"
            onClick={() => loadUrl(displayUrl)}
          >
            <SafeIcon icon={FiArrowRight} />
            <span className={isMobile ? "hidden" : ""}>Go</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            className={`px-2 py-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-white rounded-md text-sm font-medium flex items-center gap-1 hover:bg-gray-700 transition-colors ${getProxyStatusColor()}`}
            onClick={() => setShowProxyControls(!showProxyControls)}
            title="Proxy Settings"
          >
            <SafeIcon icon={getProxyStatusIcon()} />
            <span className={isMobile ? "hidden" : ""}>{getProxyStatusText()}</span>
          </button>

          <button
            className={`px-2 py-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-white rounded-md text-sm font-medium flex items-center gap-1 hover:bg-gray-700 transition-colors`}
            onClick={openInNewWindow}
            title="Open in New Window"
          >
            <SafeIcon icon={FiExternalLink} />
          </button>
        </div>
      </div>

      {pageTitle && (
        <div className={`px-3 py-1 text-center text-xs ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-gray-300 flex items-center justify-center`}>
          <SafeIcon icon={FiLink} className="mr-1" />
          {pageTitle}
        </div>
      )}

      {showProxyControls && (
        <ProxyControls
          darkMode={darkMode}
          proxyEnabled={proxyEnabled}
          setProxyEnabled={setProxyEnabled}
          proxyStatus={proxyStatus}
          onReconnect={() => {
            cloudProxyClient.retry();
          }}
        />
      )}

      <div className="relative flex-1 bg-white">
        {loading && (
          <div className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} bg-opacity-80 z-10`}>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <div className="text-white text-sm">Loading...</div>
              {proxyEnabled && proxyStatus === 'connected' && (
                <div className="text-green-400 text-xs mt-1">Using proxy: {cloudProxyClient.checkStatus().service || 'Unknown'}</div>
              )}
              {retryCount > 0 && (
                <div className="text-yellow-400 text-xs mt-1">Retry {retryCount}/{maxRetries}</div>
              )}
            </div>
          </div>
        )}

        {loadError && (
          <div className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} bg-opacity-90 z-10`}>
            <div className="flex flex-col items-center text-center p-6 max-w-md">
              <SafeIcon icon={FiAlertTriangle} className="text-red-500 text-4xl mb-4" />
              <div className="text-white text-lg mb-2">Failed to Load</div>
              <div className="text-gray-300 text-sm mb-4">
                {loadError}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={refresh}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-sm flex items-center"
                >
                  <SafeIcon icon={FiRefreshCw} className="mr-1" />
                  Try Again
                </button>
                <button
                  onClick={() => {
                    setProxyEnabled(!proxyEnabled);
                    setTimeout(() => loadUrl(displayUrl), 1000);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white text-sm flex items-center"
                >
                  <SafeIcon icon={proxyEnabled ? FiGlobe : FiShield} className="mr-1" />
                  {proxyEnabled ? 'Disable Proxy' : 'Enable Proxy'}
                </button>
                <button
                  onClick={() => {
                    cloudProxyClient.retry().then(() => {
                      loadUrl(displayUrl);
                    });
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md text-white text-sm flex items-center"
                >
                  <SafeIcon icon={FiSettings} className="mr-1" />
                  Switch Proxy Server
                </button>
              </div>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-none"
          title="browser-frame"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-downloads allow-modals"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>
    </div>
  );
};

export default BrowserWindow;