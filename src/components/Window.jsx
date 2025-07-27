import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import BrowserWindow from './BrowserWindow';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMaximize2, FiMinus, FiX } = FiIcons;

const Window = ({ 
  id, 
  type, 
  url, 
  title,
  icon,
  zIndex, 
  initialPosition, 
  onClose, 
  onFocus,
  darkMode,
  children
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const windowRef = useRef(null);
  const titleBarRef = useRef(null);
  
  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'browser':
        return 'Web Browser';
      case 'solitaire':
        return 'Solitaire';
      case 'appstore':
        return 'App Store';
      case 'explorer':
        return 'File Explorer';
      case 'cmd':
        return 'Command Prompt';
      case 'settings':
        return 'Settings';
      case 'calendar':
        return 'Calendar';
      case 'sound':
        return 'Sound Control';
      case 'notepad':
        return 'Notepad';
      default:
        return 'Window';
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && windowRef.current) {
      windowRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      // Minimize window
      setPosition({ x: window.innerWidth, y: window.innerHeight });
    } else {
      // Restore window
      onFocus();
      setPosition(initialPosition);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const handleMouseDown = (e) => {
    if (titleBarRef.current && titleBarRef.current.contains(e.target)) {
      onFocus();
      setIsDragging(true);
    }
  };
  
  const handleTouchStart = (e) => {
    if (titleBarRef.current && titleBarRef.current.contains(e.target)) {
      onFocus();
    }
  };

  // Determine responsive size based on device
  const isMobile = window.innerWidth <= 768;
  const windowWidth = isMobile ? window.innerWidth * 0.95 : 800;
  const windowHeight = isMobile ? window.innerHeight * 0.8 : 600;

  return (
    <motion.div
      ref={windowRef}
      className={`absolute rounded-lg shadow-xl overflow-hidden ${darkMode ? 'dark' : ''}`}
      style={{ 
        width: isFullscreen ? '100%' : windowWidth, 
        height: isFullscreen ? '100%' : windowHeight,
        left: isFullscreen ? 0 : position.x, 
        top: isFullscreen ? 0 : position.y,
        zIndex,
        visibility: isMinimized ? 'hidden' : 'visible'
      }}
      drag={!isFullscreen}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      onDrag={(e, info) => {
        if (!isFullscreen) {
          setPosition({ 
            x: info.point.x - (windowWidth / 2), 
            y: info.point.y - 20 
          });
        }
      }}
      onDragStart={() => onFocus()}
      onClick={() => onFocus()}
    >
      <div 
        ref={titleBarRef}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 cursor-move flex justify-between items-center"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center">
          <div className="w-6 h-6 mr-2 rounded bg-white bg-opacity-20 p-1 flex items-center justify-center">
            <img 
              src={`/icons/${type}_icon.png`}
              alt={getTitle()}
              className="w-full h-full object-contain filter brightness-0 invert"
            />
          </div>
          <span className="font-medium truncate">{getTitle()}</span>
        </div>
        <div className="flex gap-2">
          <button 
            className="w-8 h-8 rounded-md bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-colors"
            onClick={toggleMinimize}
          >
            <SafeIcon icon={FiMinus} className="text-white" />
          </button>
          <button 
            className="w-8 h-8 rounded-md bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-colors"
            onClick={toggleFullscreen}
          >
            <SafeIcon icon={FiMaximize2} className="text-white" />
          </button>
          <button 
            className="w-8 h-8 rounded-md bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-colors"
            onClick={handleClose}
          >
            <SafeIcon icon={FiX} className="text-white" />
          </button>
        </div>
      </div>
      
      {type === 'browser' ? (
        <BrowserWindow url={url} darkMode={darkMode} />
      ) : (
        <div className={`h-full overflow-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-800'}`}>
          {children}
        </div>
      )}
    </motion.div>
  );
};

export default Window;