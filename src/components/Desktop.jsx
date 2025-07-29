import React, { useState, useRef, useEffect } from 'react';
import DesktopIcon from './DesktopIcon';
import Taskbar from './Taskbar';
import Window from './Window';
import SolitaireGame from './SolitaireGame/SolitaireGame';
import AppStore from './AppStore/AppStore';
import FileExplorer from './FileExplorer/FileExplorer';
import CommandPrompt from './CommandPrompt/CommandPrompt';
import Settings from './Settings/Settings';
import Calendar from './Calendar/Calendar';
import SoundControl from './SoundControl/SoundControl';
import Notepad from './Notepad/Notepad';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';

const Desktop = () => {
  const [windows, setWindows] = useState([]);
  const [zIndexCounter, setZIndexCounter] = useState(1);
  const [openApps, setOpenApps] = useState([]);
  const [installedApps, setInstalledApps] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [iconPositions, setIconPositions] = useState({});
  const desktopRef = useRef(null);
  
  // Default icon positions (grid coordinates)
  const defaultIconPositions = {
    'browser': { x: 0, y: 0 },
    'appstore': { x: 0, y: 1 },
    'explorer': { x: 0, y: 2 },
    'cmd': { x: 0, y: 3 },
    'notepad': { x: 0, y: 4 },
    'eaglercraft': { x: 0, y: 5 },
    'solitaire': { x: 0, y: 6 }
  };

  // Load saved state on mount
  useEffect(() => {
    const loadSavedState = () => {
      try {
        const savedWindows = localStorage.getItem('browserOS_windows');
        const savedOpenApps = localStorage.getItem('browserOS_openApps');
        const savedInstalledApps = localStorage.getItem('browserOS_installedApps');
        const savedDarkMode = localStorage.getItem('browserOS_darkMode');
        const savedIconPositions = localStorage.getItem('browserOS_iconPositions');
        
        if (savedWindows) setWindows(JSON.parse(savedWindows));
        if (savedOpenApps) setOpenApps(JSON.parse(savedOpenApps));
        if (savedInstalledApps) setInstalledApps(JSON.parse(savedInstalledApps));
        if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
        if (savedIconPositions) {
          setIconPositions(JSON.parse(savedIconPositions));
        } else {
          setIconPositions(defaultIconPositions);
        }
        
        // Show continue dialog if there are saved windows
        if (savedWindows && JSON.parse(savedWindows).length > 0) {
          const shouldContinue = window.confirm('Would you like to continue your previous session?');
          if (!shouldContinue) {
            setWindows([]);
            setOpenApps([]);
          }
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        setIconPositions(defaultIconPositions);
      }
    };
    
    loadSavedState();
  }, []);

  // Save state when it changes
  useEffect(() => {
    try {
      localStorage.setItem('browserOS_windows', JSON.stringify(windows));
      localStorage.setItem('browserOS_openApps', JSON.stringify(openApps));
      localStorage.setItem('browserOS_installedApps', JSON.stringify(installedApps));
      localStorage.setItem('browserOS_darkMode', JSON.stringify(darkMode));
      localStorage.setItem('browserOS_iconPositions', JSON.stringify(iconPositions));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }, [windows, openApps, installedApps, darkMode, iconPositions]);

  const createWindow = (type, url = '', title = '', appIcon = '') => {
    const newZIndex = zIndexCounter + 1;
    setZIndexCounter(newZIndex);
    
    const newWindow = {
      id: `window-${Date.now()}`,
      type,
      url,
      title: title || type,
      icon: appIcon,
      zIndex: newZIndex,
      position: {
        x: 50 + Math.random() * 100,
        y: 50 + Math.random() * 100
      }
    };
    
    setWindows([...windows, newWindow]);
    setOpenApps([...openApps, newWindow]);
  };

  const closeWindow = (id) => {
    setWindows(windows.filter(window => window.id !== id));
    setOpenApps(openApps.filter(app => app.id !== id));
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
  
  const reopenApp = (appId) => {
    const existingWindow = windows.find(window => window.id === appId);
    if (existingWindow) {
      bringToFront(existingWindow.id);
      return;
    }
    
    const app = openApps.find(app => app.id === appId);
    if (app) {
      createWindow(app.type, app.url, app.title, app.icon);
    }
  };

  const createWindowPrompt = () => {
    const url = prompt("Enter URL (http:// or https://):");
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      createWindow('browser', url, 'Web Browser', 'browser_icon.png');
    } else if (url) {
      alert("Invalid URL.");
    }
  };

  const handleIconClick = (type, url = '', title = '') => {
    switch (type) {
      case 'browser':
        createWindow('browser', url || 'https://example.com', title || 'Web Browser', 'browser_icon.png');
        break;
      case 'appstore':
        createWindow('appstore', '', 'App Store', 'appstore_icon.png');
        break;
      case 'explorer':
        createWindow('explorer', '', 'File Explorer', 'explorer_icon.png');
        break;
      case 'cmd':
        createWindow('cmd', '', 'Command Prompt', 'cmd_icon.png');
        break;
      case 'settings':
        createWindow('settings', '', 'Settings', 'settings_icon.png');
        break;
      case 'calendar':
        createWindow('calendar', '', 'Calendar', 'calendar_icon.png');
        break;
      case 'sound':
        createWindow('sound', '', 'Sound Control', 'sound_icon.png');
        break;
      case 'notepad':
        createWindow('notepad', '', 'Notepad', 'notepad_icon.png');
        break;
      case 'eaglercraft':
        createWindow('browser', 'https://eaglercraft.com/', 'Eaglercraft', 'eaglercraft_icon.png');
        break;
      case 'solitaire':
        createWindow('solitaire', '', 'Solitaire', 'solitaire_icon.png');
        break;
      default:
        createWindow('browser', url, title, `${type}_icon.png`);
        break;
    }
  };
  
  const handleAppInstall = (appId, appUrl, appTitle) => {
    if (!installedApps.some(app => app.id === appId)) {
      const newApp = {
        id: appId,
        url: appUrl,
        title: appTitle,
        icon: `${appId}_icon.png`
      };
      setInstalledApps([...installedApps, newApp]);
      
      // Find next available position for new app
      const nextPosition = findNextAvailablePosition();
      setIconPositions(prev => ({
        ...prev,
        [appId]: nextPosition
      }));
      
      createWindow('browser', appUrl, appTitle, `${appId}_icon.png`);
    } else {
      handleIconClick(appId, appUrl, appTitle);
    }
  };

  const findNextAvailablePosition = () => {
    const occupiedPositions = new Set(
      Object.values(iconPositions).map(pos => `${pos.x},${pos.y}`)
    );
    
    // Start from column 0, then move to next columns
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 15; y++) {
        const posKey = `${x},${y}`;
        if (!occupiedPositions.has(posKey)) {
          return { x, y };
        }
      }
    }
    
    // Fallback if somehow all positions are taken
    return { x: 1, y: 0 };
  };

  const handleIconPositionChange = (iconId, newPosition) => {
    // Check if position is already occupied
    const isOccupied = Object.entries(iconPositions).some(([id, pos]) => 
      id !== iconId && pos.x === newPosition.x && pos.y === newPosition.y
    );
    
    if (!isOccupied) {
      setIconPositions(prev => ({
        ...prev,
        [iconId]: newPosition
      }));
    }
  };

  const getAllApps = () => {
    const systemApps = [
      { id: 'browser', name: 'Browser', icon: 'browser_icon.png' },
      { id: 'appstore', name: 'App Store', icon: 'appstore_icon.png' },
      { id: 'explorer', name: 'File Explorer', icon: 'explorer_icon.png' },
      { id: 'cmd', name: 'Command Prompt', icon: 'cmd_icon.png' },
      { id: 'settings', name: 'Settings', icon: 'settings_icon.png' },
      { id: 'calendar', name: 'Calendar', icon: 'calendar_icon.png' },
      { id: 'sound', name: 'Sound Control', icon: 'sound_icon.png' },
      { id: 'notepad', name: 'Notepad', icon: 'notepad_icon.png' },
      { id: 'eaglercraft', name: 'Eaglercraft', icon: 'eaglercraft_icon.png' },
      { id: 'solitaire', name: 'Solitaire', icon: 'solitaire_icon.png' }
    ];
    
    return [...systemApps, ...installedApps];
  };

  // System apps to render
  const systemApps = [
    { id: 'browser', icon: 'browser_icon.png', label: 'Browser' },
    { id: 'appstore', icon: 'appstore_icon.png', label: 'App Store' },
    { id: 'explorer', icon: 'explorer_icon.png', label: 'Explorer' },
    { id: 'cmd', icon: 'cmd_icon.png', label: 'CMD' },
    { id: 'notepad', icon: 'notepad_icon.png', label: 'Notepad' },
    { id: 'eaglercraft', icon: 'eaglercraft_icon.png', label: 'Eaglercraft' },
    { id: 'solitaire', icon: 'solitaire_icon.png', label: 'Solitaire' }
  ];

  return (
    <div 
      className={`h-screen w-full relative overflow-hidden ${darkMode ? 'dark' : ''}`}
      style={{
        backgroundImage: darkMode 
          ? `url('https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753584457691-dark_mode.jpg')`
          : `url('https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753459693908-make%20a%20cover%20image%20for%20an%20os%20called%20browserOS_1753429132300.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      ref={desktopRef}
    >
      {/* Grid overlay for development (remove in production) */}
      {/* <div className="absolute inset-0 pointer-events-none opacity-10">
        {Array.from({ length: Math.ceil(window.innerWidth / 80) }).map((_, x) =>
          Array.from({ length: Math.ceil(window.innerHeight / 80) }).map((_, y) => (
            <div
              key={`${x}-${y}`}
              className="absolute border border-white"
              style={{
                left: 8 + x * 80,
                top: 8 + y * 80,
                width: 80,
                height: 80
              }}
            />
          ))
        )}
      </div> */}

      {/* System Apps */}
      {systemApps.map((app) => (
        <DesktopIcon
          key={app.id}
          icon={app.icon}
          label={app.label}
          onClick={() => handleIconClick(app.id)}
          darkMode={darkMode}
          gridPosition={iconPositions[app.id] || { x: 0, y: 0 }}
          onPositionChange={(newPos) => handleIconPositionChange(app.id, newPos)}
        />
      ))}

      {/* Installed Apps */}
      {installedApps.map((app) => (
        <DesktopIcon
          key={app.id}
          icon={`${app.id}_icon.png`}
          label={app.title}
          onClick={() => handleIconClick(app.id, app.url, app.title)}
          darkMode={darkMode}
          gridPosition={iconPositions[app.id] || { x: 1, y: 0 }}
          onPositionChange={(newPos) => handleIconPositionChange(app.id, newPos)}
        />
      ))}
      
      {windows.map((window) => (
        <Window
          key={window.id}
          id={window.id}
          type={window.type}
          url={window.url}
          title={window.title}
          icon={window.icon}
          zIndex={window.zIndex}
          initialPosition={window.position}
          onClose={() => closeWindow(window.id)}
          onFocus={() => bringToFront(window.id)}
          darkMode={darkMode}
        >
          {window.type === 'solitaire' && <SolitaireGame darkMode={darkMode} />}
          {window.type === 'appstore' && <AppStore onAppInstall={handleAppInstall} darkMode={darkMode} />}
          {window.type === 'explorer' && <FileExplorer darkMode={darkMode} />}
          {window.type === 'cmd' && <CommandPrompt darkMode={darkMode} />}
          {window.type === 'settings' && <Settings darkMode={darkMode} setDarkMode={setDarkMode} />}
          {window.type === 'calendar' && <Calendar darkMode={darkMode} />}
          {window.type === 'sound' && <SoundControl darkMode={darkMode} />}
          {window.type === 'notepad' && <Notepad darkMode={darkMode} />}
        </Window>
      ))}
      
      <Taskbar 
        onStartClick={createWindowPrompt} 
        openApps={openApps}
        onAppClick={reopenApp}
        onAppOpen={handleIconClick}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        allApps={getAllApps()}
      />
    </div>
  );
};

export default Desktop;