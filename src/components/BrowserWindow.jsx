import React, { useState, useRef, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiExternalLink, FiRefreshCw, FiArrowLeft, FiArrowRight: FiArrowRightNav } = FiIcons;

const BrowserWindow = ({ url: initialUrl, darkMode = false }) => {
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([initialUrl]);
  const [historyPosition, setHistoryPosition] = useState(0);
  const iframeRef = useRef(null);
  
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };
  
  const loadUrl = (newUrl) => {
    // Format the URL
    let formattedUrl = newUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    // Update URL and history
    setUrl(formattedUrl);
    setLoading(true);
    
    // Add to history if navigating to a new URL
    if (formattedUrl !== history[historyPosition]) {
      const newHistory = history.slice(0, historyPosition + 1);
      setHistory([...newHistory, formattedUrl]);
      setHistoryPosition(newHistory.length);
    }
    
    // Reset loading state after a delay
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      loadUrl(url);
    }
  };
  
  const openInNewWindow = () => {
    let urlToOpen = url;
    if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
      urlToOpen = `https://${urlToOpen}`;
    }
    window.open(urlToOpen, '_blank');
  };
  
  const navigateBack = () => {
    if (historyPosition > 0) {
      setHistoryPosition(historyPosition - 1);
      setUrl(history[historyPosition - 1]);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  };
  
  const navigateForward = () => {
    if (historyPosition < history.length - 1) {
      setHistoryPosition(historyPosition + 1);
      setUrl(history[historyPosition + 1]);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1500);
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
  
  // Save browsing history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`browserOS_history_${initialUrl}`, JSON.stringify(history));
      localStorage.setItem(`browserOS_historyPosition_${initialUrl}`, historyPosition.toString());
    } catch (error) {
      console.error('Error saving browsing history:', error);
    }
  }, [history, historyPosition, initialUrl]);
  
  // Load browsing history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(`browserOS_history_${initialUrl}`);
      const savedPosition = localStorage.getItem(`browserOS_historyPosition_${initialUrl}`);
      
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        setHistoryPosition(position);
        if (JSON.parse(savedHistory)[position]) {
          setUrl(JSON.parse(savedHistory)[position]);
        }
      }
    } catch (error) {
      console.error('Error loading browsing history:', error);
    }
  }, [initialUrl]);

  // Responsive design - adjust for mobile
  const isMobile = window.innerWidth <= 768;

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
          <input
            type="text"
            className={`flex-1 px-3 py-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} border border-gray-700 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white`}
            value={url}
            onChange={handleUrlChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md text-sm font-medium flex items-center gap-1 hover:bg-indigo-700 transition-colors"
            onClick={() => loadUrl(url)}
          >
            <SafeIcon icon={FiArrowRight} />
            <span className={isMobile ? "hidden" : ""}>Go</span>
          </button>
        </div>
        
        <button
          className={`px-4 py-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-white rounded-md text-sm font-medium flex items-center gap-1 hover:bg-gray-700 transition-colors`}
          onClick={openInNewWindow}
        >
          <SafeIcon icon={FiExternalLink} />
          <span className={isMobile ? "hidden" : ""}>New Window</span>
        </button>
      </div>
      
      <div className="relative flex-1 bg-white">
        {loading && (
          <div className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} bg-opacity-80 z-10`}>
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url.startsWith('http') ? url : `https://${url}`}
          className="w-full h-full border-none"
          title="browser-frame"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default BrowserWindow;