import React, { useState, useRef } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiExternalLink } = FiIcons;

const BrowserWindow = ({ url: initialUrl }) => {
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef(null);
  
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };
  
  const loadUrl = () => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setUrl(`https://${url}`);
    }
    setLoading(true);
    
    // Reset loading state after a delay
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      loadUrl();
    }
  };
  
  const openInNewWindow = () => {
    let urlToOpen = url;
    if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
      urlToOpen = `https://${urlToOpen}`;
    }
    window.open(urlToOpen, '_blank');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 bg-gray-100 border-b border-gray-200 flex items-center gap-2">
        <input
          type="text"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={url}
          onChange={handleUrlChange}
          onKeyDown={handleKeyDown}
        />
        <button
          className="px-4 py-2 bg-indigo-500 text-white rounded-md text-sm font-medium flex items-center gap-1 hover:bg-indigo-600 transition-colors"
          onClick={loadUrl}
        >
          <SafeIcon icon={FiArrowRight} />
          <span>Go</span>
        </button>
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium flex items-center gap-1 hover:bg-gray-300 transition-colors"
          onClick={openInNewWindow}
        >
          <SafeIcon icon={FiExternalLink} />
          <span>New Window</span>
        </button>
      </div>
      
      <div className="relative flex-1 bg-white">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
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