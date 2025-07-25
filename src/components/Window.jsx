import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import BrowserWindow from './BrowserWindow';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMaximize2, FiX } = FiIcons;

const Window = ({ 
  id, 
  type, 
  url, 
  zIndex, 
  initialPosition, 
  onClose, 
  onFocus,
  children
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const windowRef = useRef(null);
  const titleBarRef = useRef(null);
  
  const getTitle = () => {
    switch (type) {
      case 'browser':
        return 'Internet Explorer';
      case 'solitaire':
        return 'Solitaire';
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

  return (
    <motion.div
      ref={windowRef}
      className="absolute rounded-lg shadow-xl overflow-hidden"
      style={{ 
        width: 800, 
        height: 600,
        left: position.x, 
        top: position.y,
        zIndex 
      }}
      drag={!isFullscreen}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      onDrag={(e, info) => {
        setPosition({ x: info.point.x - 400, y: info.point.y - 20 });
      }}
      onDragStart={() => onFocus()}
      onClick={() => onFocus()}
    >
      <div 
        ref={titleBarRef}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 cursor-move flex justify-between items-center"
        onMouseDown={handleMouseDown}
      >
        <span className="font-medium">{getTitle()}</span>
        <div className="flex gap-2">
          <button 
            className="w-8 h-8 rounded-md bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-colors"
            onClick={toggleFullscreen}
          >
            <SafeIcon icon={FiMaximize2} className="text-white" />
          </button>
          <button 
            className="w-8 h-8 rounded-md bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-colors"
            onClick={onClose}
          >
            <SafeIcon icon={FiX} className="text-white" />
          </button>
        </div>
      </div>
      
      {type === 'browser' ? (
        <BrowserWindow url={url} />
      ) : (
        children
      )}
    </motion.div>
  );
};

export default Window;