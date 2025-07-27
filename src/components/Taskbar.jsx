import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';

const { FiGrid, FiSettings, FiPower, FiCalendar, FiVolume2, FiMoon, FiSun } = FiIcons;

const Taskbar = ({ onStartClick, openApps, onAppClick, onAppOpen, darkMode, setDarkMode, allApps }) => {
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [time, setTime] = useState(new Date());
  const [date, setDate] = useState(new Date());
  
  // Update time every minute and date every hour
  useEffect(() => {
    const timeTimer = setInterval(() => {
      setTime(new Date());
    }, 60000);
    
    const dateTimer = setInterval(() => {
      setDate(new Date());
    }, 3600000);
    
    return () => {
      clearInterval(timeTimer);
      clearInterval(dateTimer);
    };
  }, []);
  
  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  
  const toggleStartMenu = () => {
    setShowStartMenu(!showStartMenu);
  };
  
  const handleAppClick = (id) => {
    onAppClick(id);
    setShowStartMenu(false);
  };
  
  const handleOpenApp = (type) => {
    onAppOpen(type);
    setShowStartMenu(false);
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 flex flex-col">
      <AnimatePresence>
        {showStartMenu && (
          <motion.div 
            className={`absolute bottom-12 left-0 w-80 ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} bg-opacity-95 backdrop-blur-md rounded-tr-lg shadow-xl z-50 border border-gray-700`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="p-4 border-b border-gray-700">
              <div className="text-white text-lg font-semibold flex items-center">
                <img 
                  src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753585336622-bOS_L.jpg" 
                  alt="BrowserOS" 
                  className="h-8 w-8 mr-2 rounded"
                />
                BrowserOS
              </div>
              <div className="text-gray-400 text-xs">v1.1.0</div>
            </div>
            
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-gray-400 text-sm mb-3">All Apps</h3>
              <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                {allApps.map(app => (
                  <motion.div
                    key={app.id}
                    className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleOpenApp(app.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md p-2 flex items-center justify-center mb-1">
                      <img 
                        src={`/icons/${app.icon}`} 
                        alt={app.name} 
                        className="w-6 h-6 filter brightness-0 invert" 
                      />
                    </div>
                    <span className="text-white text-xs text-center truncate w-full">{app.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-1 p-2">
              <StartMenuItem icon={FiGrid} label="All Apps" onClick={() => {
                setShowStartMenu(false);
                onStartClick();
              }} />
              <StartMenuItem icon={FiSettings} label="Settings" onClick={() => handleOpenApp('settings')} />
              <StartMenuItem icon={FiCalendar} label="Calendar" onClick={() => handleOpenApp('calendar')} />
              <StartMenuItem icon={FiVolume2} label="Sound" onClick={() => handleOpenApp('sound')} />
              <StartMenuItem 
                icon={darkMode ? FiSun : FiMoon} 
                label={darkMode ? "Light Mode" : "Dark Mode"} 
                onClick={toggleDarkMode}
              />
              <StartMenuItem icon={FiPower} label="Power" className="text-red-400" />
            </div>
            
            <div className="p-3 border-t border-gray-700">
              <h3 className="text-gray-400 text-xs mb-2">Recently Used</h3>
              <div className="grid grid-cols-4 gap-2">
                {openApps.slice(0, 8).map(app => (
                  <motion.div
                    key={app.id}
                    className="flex flex-col items-center justify-center p-1 rounded hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleAppClick(app.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md p-1 flex items-center justify-center mb-1">
                      <img 
                        src={`/icons/${app.type === 'browser' ? 'browser' : app.type}_icon.png`} 
                        alt={app.title} 
                        className="w-6 h-6 filter brightness-0 invert" 
                      />
                    </div>
                    <span className="text-white text-xs truncate w-full text-center">{app.title.split(' ')[0]}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className={`h-12 ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} bg-opacity-90 backdrop-blur-md border-t border-gray-700 flex items-center justify-between px-2`}>
        <div className="flex items-center">
          <motion.button 
            className="flex items-center justify-center h-10 w-10 hover:bg-gray-700 active:bg-gray-600 rounded-full transition-colors"
            onClick={toggleStartMenu}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img 
              src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753585336622-bOS_L.jpg" 
              alt="Start" 
              className="h-8 w-8 object-contain rounded-full"
            />
          </motion.button>
        </div>
        
        {/* Centered app icons */}
        <div className="flex-1 flex justify-center">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {openApps.map(app => (
              <motion.div
                key={app.id}
                className={`h-10 px-2 flex items-center ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-lg hover:bg-opacity-80 cursor-pointer`}
                onClick={() => handleAppClick(app.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-6 h-6 mr-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded p-1 flex items-center justify-center">
                  <img 
                    src={`/icons/${app.type === 'browser' ? 'browser' : app.type}_icon.png`}
                    alt={app.title} 
                    className="w-full h-full object-contain filter brightness-0 invert" 
                  />
                </div>
                <span className="text-white text-sm truncate max-w-[100px]">{app.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.button
            className="p-2 rounded-full hover:bg-gray-700"
            onClick={() => handleOpenApp('sound')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiVolume2} className="text-white" />
          </motion.button>
          
          <motion.button
            className="p-2 rounded-full hover:bg-gray-700"
            onClick={toggleDarkMode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={darkMode ? FiSun : FiMoon} className="text-white" />
          </motion.button>
          
          <motion.div 
            className={`${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-lg px-3 py-1 text-white cursor-pointer`}
            onClick={() => handleOpenApp('calendar')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-xs font-medium">{formattedTime}</div>
            <div className="text-xs">{formattedDate}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const StartMenuItem = ({ icon, label, onClick, className = "" }) => {
  return (
    <motion.div 
      className={`flex items-center p-2 rounded-md hover:bg-gray-700 cursor-pointer ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <SafeIcon icon={icon} className="mr-3 text-lg" />
      <span>{label}</span>
    </motion.div>
  );
};

export default Taskbar;