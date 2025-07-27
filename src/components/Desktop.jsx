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
  const desktopRef = useRef(null);
  
  // Load saved state on mount
  useEffect(() => {
    const loadSavedState = () => {
      try {
        const savedWindows = localStorage.getItem('browserOS_windows');
        const savedOpenApps = localStorage.getItem('browserOS_openApps');
        const savedInstalledApps = localStorage.getItem('browserOS_installedApps');
        const savedDarkMode = localStorage.getItem('browserOS_darkMode');
        
        if (savedWindows) setWindows(JSON.parse(savedWindows));
        if (savedOpenApps) setOpenApps(JSON.parse(savedOpenApps));
        if (savedInstalledApps) setInstalledApps(JSON.parse(savedInstalledApps));
        if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
        
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
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }, [windows, openApps, installedApps, darkMode]);

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
    // Check if this app is already open
    const existingWindow = windows.find(window => window.id === appId);
    if (existingWindow) {
      bringToFront(existingWindow.id);
      return;
    }
    
    // Find the app in openApps to get its details
    const app = openApps.find(app => app.id === appId);
    if (app) {
      // Create a new window for this app
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
        // For custom apps from app store
        createWindow('browser', url, title, `${type}_icon.png`);
        break;
    }
  };
  
  const handleAppInstall = (appId, appUrl, appTitle) => {
    // Check if the app is already installed
    if (!installedApps.some(app => app.id === appId)) {
      const newApp = {
        id: appId,
        url: appUrl,
        title: appTitle,
        icon: `${appId}_icon.png`
      };
      setInstalledApps([...installedApps, newApp]);
      
      // Also create a window for the newly installed app
      createWindow('browser', appUrl, appTitle, `${appId}_icon.png`);
    } else {
      // If already installed, just open it
      handleIconClick(appId, appUrl, appTitle);
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
      <div className="p-4 grid grid-cols-1 gap-4 w-20">
        <DesktopIcon 
          icon="browser_icon.png" 
          label="Browser" 
          onClick={() => handleIconClick('browser')} 
          darkMode={darkMode}
        />
        <DesktopIcon 
          icon="appstore_icon.png" 
          label="App Store" 
          onClick={() => handleIconClick('appstore')} 
          darkMode={darkMode}
        />
        <DesktopIcon 
          icon="explorer_icon.png" 
          label="Explorer" 
          onClick={() => handleIconClick('explorer')} 
          darkMode={darkMode}
        />
        <DesktopIcon 
          icon="cmd_icon.png" 
          label="CMD" 
          onClick={() => handleIconClick('cmd')} 
          darkMode={darkMode}
        />
        <DesktopIcon 
          icon="notepad_icon.png" 
          label="Notepad" 
          onClick={() => handleIconClick('notepad')} 
          darkMode={darkMode}
        />
        <DesktopIcon 
          icon="eaglercraft_icon.png" 
          label="Eaglercraft" 
          onClick={() => handleIconClick('eaglercraft')} 
          darkMode={darkMode}
        />
        <DesktopIcon 
          icon="solitaire_icon.png" 
          label="Solitaire" 
          onClick={() => handleIconClick('solitaire')} 
          darkMode={darkMode}
        />
        
        {/* Render installed apps from app store */}
        {installedApps.map((app) => (
          <DesktopIcon 
            key={app.id}
            icon={`${app.id}_icon.png`}
            label={app.title} 
            onClick={() => handleIconClick(app.id, app.url, app.title)} 
            darkMode={darkMode}
          />
        ))}
      </div>
      
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