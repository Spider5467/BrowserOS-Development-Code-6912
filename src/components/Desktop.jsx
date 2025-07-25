import React, { useState, useRef } from 'react';
import DesktopIcon from './DesktopIcon';
import Taskbar from './Taskbar';
import Window from './Window';
import SolitaireGame from './SolitaireGame/SolitaireGame';
import * as FiIcons from 'react-icons/fi';
import { motion } from 'framer-motion';

const Desktop = () => {
  const [windows, setWindows] = useState([]);
  const [zIndexCounter, setZIndexCounter] = useState(1);
  const desktopRef = useRef(null);

  const createWindow = (type, url = '') => {
    const newZIndex = zIndexCounter + 1;
    setZIndexCounter(newZIndex);
    
    const newWindow = {
      id: `window-${Date.now()}`,
      type,
      url,
      zIndex: newZIndex,
      position: {
        x: 50 + Math.random() * 100,
        y: 50 + Math.random() * 100
      }
    };
    
    setWindows([...windows, newWindow]);
  };

  const closeWindow = (id) => {
    setWindows(windows.filter(window => window.id !== id));
  };

  const bringToFront = (id) => {
    const newZIndex = zIndexCounter + 1;
    setZIndexCounter(newZIndex);
    
    setWindows(
      windows.map(window => 
        window.id === id 
          ? { ...window, zIndex: newZIndex } 
          : window
      )
    );
  };

  const createWindowPrompt = () => {
    const url = prompt("Enter URL (http:// or https://):");
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      createWindow('browser', url);
    } else if (url) {
      alert("Invalid URL.");
    }
  };

  const handleIconClick = (type) => {
    switch (type) {
      case 'web':
        createWindow('browser', 'https://example.com');
        break;
      case 'eaglercraft':
        createWindow('browser', 'https://eaglercraft.com/');
        break;
      case 'solitaire':
        createWindow('solitaire');
        break;
      default:
        break;
    }
  };

  return (
    <div 
      className="h-screen w-full relative overflow-hidden" 
      style={{
        backgroundImage: `url('https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753459693908-make%20a%20cover%20image%20for%20an%20os%20called%20browserOS_1753429132300.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      ref={desktopRef}
    >
      <div className="p-4 flex flex-col gap-4">
        <DesktopIcon 
          icon="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753459718379-web.jpg" 
          label="Web" 
          onClick={() => handleIconClick('web')} 
        />
        <DesktopIcon 
          icon="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753459709369-mc.png" 
          label="Eaglercraft" 
          onClick={() => handleIconClick('eaglercraft')} 
        />
        <DesktopIcon 
          icon="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753459704991-make%20an%20app%20image%20for%20a%20solitare%20game%20for%20an%20os%20called%20browserOS_1753429891198.jpg" 
          label="Solitaire" 
          onClick={() => handleIconClick('solitaire')} 
        />
      </div>
      
      {windows.map((window) => (
        <Window
          key={window.id}
          id={window.id}
          type={window.type}
          url={window.url}
          zIndex={window.zIndex}
          initialPosition={window.position}
          onClose={() => closeWindow(window.id)}
          onFocus={() => bringToFront(window.id)}
        >
          {window.type === 'solitaire' && <SolitaireGame />}
        </Window>
      ))}
      
      <Taskbar onStartClick={createWindowPrompt} />
    </div>
  );
};

export default Desktop;