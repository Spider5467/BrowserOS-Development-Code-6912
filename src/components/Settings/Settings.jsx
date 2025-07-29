import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMonitor, FiVolume2, FiMoon, FiSun, FiInfo, FiDownload, FiTrash2, FiLock, FiWifi, FiShield, FiServer } = FiIcons;

const Settings = ({ darkMode = false, setDarkMode }) => {
  const [activeSection, setActiveSection] = useState('display');
  const [volume, setVolume] = useState(50);
  const [brightness, setBrightness] = useState(100);
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('http://localhost:3000/proxy');
  const [proxyStatus, setProxyStatus] = useState('stopped');
  const [installDate] = useState(() => {
    const savedDate = localStorage.getItem('browserOS_installDate');
    if (savedDate) return new Date(savedDate).toLocaleDateString();
    
    // If not found, set current date as install date
    const currentDate = new Date().toISOString();
    localStorage.setItem('browserOS_installDate', currentDate);
    return new Date(currentDate).toLocaleDateString();
  });
  const [usedStorage, setUsedStorage] = useState('0 KB');

  // Calculate storage usage
  useEffect(() => {
    try {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('browserOS_')) {
          totalSize += localStorage.getItem(key).length;
        }
      }
      
      // Convert bytes to appropriate unit
      let sizeStr = '';
      if (totalSize < 1024) {
        sizeStr = `${totalSize} B`;
      } else if (totalSize < 1024 * 1024) {
        sizeStr = `${(totalSize / 1024).toFixed(2)} KB`;
      } else {
        sizeStr = `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
      }
      
      setUsedStorage(sizeStr);
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      setUsedStorage('Error');
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('browserOS_volume', volume.toString());
      localStorage.setItem('browserOS_brightness', brightness.toString());
      localStorage.setItem('browserOS_autoSave', autoSave.toString());
      localStorage.setItem('browserOS_notifications', notifications.toString());
      localStorage.setItem('browserOS_darkMode', darkMode.toString());
      localStorage.setItem('browserOS_proxyEnabled', proxyEnabled.toString());
      localStorage.setItem('browserOS_proxyUrl', proxyUrl);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [volume, brightness, autoSave, notifications, darkMode, proxyEnabled, proxyUrl]);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedVolume = localStorage.getItem('browserOS_volume');
      const savedBrightness = localStorage.getItem('browserOS_brightness');
      const savedAutoSave = localStorage.getItem('browserOS_autoSave');
      const savedNotifications = localStorage.getItem('browserOS_notifications');
      const savedProxyEnabled = localStorage.getItem('browserOS_proxyEnabled');
      const savedProxyUrl = localStorage.getItem('browserOS_proxyUrl');
      
      if (savedVolume) setVolume(parseInt(savedVolume, 10));
      if (savedBrightness) setBrightness(parseInt(savedBrightness, 10));
      if (savedAutoSave) setAutoSave(savedAutoSave === 'true');
      if (savedNotifications) setNotifications(savedNotifications === 'true');
      if (savedProxyEnabled) setProxyEnabled(savedProxyEnabled === 'true');
      if (savedProxyUrl) setProxyUrl(savedProxyUrl);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all BrowserOS data? This will reset all settings and delete all saved data.')) {
      // Clear only browserOS-related localStorage items
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key.startsWith('browserOS_')) {
          localStorage.removeItem(key);
        }
      }
      
      alert('All data has been cleared. BrowserOS will reload.');
      window.location.reload();
    }
  };

  const toggleProxy = () => {
    setProxyEnabled(!proxyEnabled);
    setProxyStatus(!proxyEnabled ? 'starting' : 'stopping');
    
    // Simulate proxy start/stop
    setTimeout(() => {
      setProxyStatus(!proxyEnabled ? 'running' : 'stopped');
    }, 1500);
  };

  return (
    <div className={`h-full flex flex-col md:flex-row ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} text-white`}>
      {/* Sidebar */}
      <div className="md:w-64 border-b md:border-b-0 md:border-r border-gray-700 overflow-y-auto">
        <div className="p-4 flex items-center justify-center md:justify-start">
          <img src="/icons/bOS_L.jpg" alt="BrowserOS" className="w-8 h-8 mr-2 rounded" />
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
        <nav className="p-2">
          {[
            { id: 'display', name: 'Display', icon: FiMonitor },
            { id: 'sound', name: 'Sound', icon: FiVolume2 },
            { id: 'appearance', name: 'Appearance', icon: darkMode ? FiSun : FiMoon },
            { id: 'privacy', name: 'Privacy', icon: FiLock },
            { id: 'proxy', name: 'Proxy', icon: FiShield },
            { id: 'system', name: 'System', icon: FiInfo },
            { id: 'storage', name: 'Storage', icon: FiDownload },
            { id: 'network', name: 'Network', icon: FiWifi }
          ].map(section => (
            <motion.div
              key={section.id}
              className={`flex items-center p-2 rounded-lg cursor-pointer ${activeSection === section.id ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
              onClick={() => setActiveSection(section.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={section.icon} className="mr-3" />
              <span>{section.name}</span>
            </motion.div>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeSection === 'display' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Display Settings</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Brightness</label>
              <div className="flex items-center">
                <SafeIcon icon={FiSun} className="mr-2 text-yellow-400" />
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                  className="flex-1 h-2 rounded-lg appearance-none bg-gray-700 cursor-pointer"
                />
                <span className="ml-2 text-sm">{brightness}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 mb-4 bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium">Auto-brightness</h3>
                <p className="text-sm text-gray-400">Adjust brightness based on ambient light</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={false} readOnly />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        )}

        {activeSection === 'sound' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Sound Settings</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Master Volume</label>
              <div className="flex items-center">
                <SafeIcon icon={FiVolume2} className="mr-2 text-indigo-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                  className="flex-1 h-2 rounded-lg appearance-none bg-gray-700 cursor-pointer"
                />
                <span className="ml-2 text-sm">{volume}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 mb-4 bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium">System Sounds</h3>
                <p className="text-sm text-gray-400">Play sound on notifications and actions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={true} readOnly />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        )}

        {activeSection === 'appearance' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Appearance Settings</h2>
            <div className="flex items-center justify-between p-3 mb-4 bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium">Dark Mode</h3>
                <p className="text-sm text-gray-400">Switch between light and dark theme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <div className="mb-4">
              <h3 className="font-medium mb-2">Dark Mode Wallpaper</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="aspect-video rounded-lg overflow-hidden border-2 border-indigo-500">
                  <img
                    src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753584457691-dark_mode.jpg"
                    alt="Current Dark Mode"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Additional wallpaper options could go here */}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'privacy' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Privacy Settings</h2>
            <div className="flex items-center justify-between p-3 mb-4 bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium">Save Session Data</h3>
                <p className="text-sm text-gray-400">Remember open windows and settings</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={autoSave}
                  onChange={() => setAutoSave(!autoSave)}
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 mb-4 bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium">Notifications</h3>
                <p className="text-sm text-gray-400">Show system notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        )}

        {activeSection === 'proxy' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Proxy Settings</h2>
            
            <div className="flex items-center justify-between p-3 mb-4 bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium">Enable Web Proxy</h3>
                <p className="text-sm text-gray-400">Bypass website restrictions and iframe blocking</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={proxyEnabled}
                  onChange={toggleProxy}
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-lg mb-4`}>
              <div className="flex items-center mb-3">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  proxyStatus === 'stopped' ? 'bg-gray-400' :
                  proxyStatus === 'starting' || proxyStatus === 'stopping' ? 'bg-yellow-400 animate-pulse' :
                  'bg-green-400'
                }`}></div>
                <span className="font-medium">
                  {proxyStatus === 'stopped' ? 'Proxy Server: Stopped' :
                   proxyStatus === 'starting' ? 'Proxy Server: Starting...' :
                   proxyStatus === 'stopping' ? 'Proxy Server: Stopping...' :
                   'Proxy Server: Running'}
                </span>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-400 mb-1">Proxy Server URL</label>
                <input 
                  type="text" 
                  value={proxyUrl}
                  onChange={(e) => setProxyUrl(e.target.value)}
                  className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} rounded-md border border-gray-600`}
                  placeholder="http://localhost:3000/proxy"
                />
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm">Default port: 3000</span>
                <motion.button 
                  className="px-3 py-1 bg-indigo-600 rounded-md text-sm"
                  onClick={() => {
                    setProxyUrl("http://localhost:3000/proxy");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reset to Default
                </motion.button>
              </div>
              
              <div className="text-xs text-gray-400 mt-2">
                <p>The proxy server allows you to:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Access websites that block iframe embedding</li>
                  <li>Bypass CORS restrictions</li>
                  <li>Access some blocked websites</li>
                  <li>Remove Content Security Policy restrictions</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 mb-4 bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium">Start Proxy on Launch</h3>
                <p className="text-sm text-gray-400">Automatically start proxy server when BrowserOS launches</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        )}

        {activeSection === 'system' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">System Information</h2>
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">OS Version</p>
                  <p className="font-medium">BrowserOS 1.1.0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Build Number</p>
                  <p className="font-medium">2023.05.12</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Installed Date</p>
                  <p className="font-medium">{installDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Browser</p>
                  <p className="font-medium">{navigator.userAgent.split(' ').slice(-1)[0].split('/')[0]}</p>
                </div>
              </div>
            </div>
            
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center mt-8"
              onClick={clearAllData}
            >
              <SafeIcon icon={FiTrash2} className="mr-2" />
              Reset BrowserOS
            </button>
          </div>
        )}

        {activeSection === 'storage' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Storage</h2>
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <div className="mb-4">
                <p className="text-sm text-gray-400">Used Storage</p>
                <p className="font-medium">{usedStorage}</p>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-4 mb-4">
                <div className="bg-indigo-600 h-4 rounded-full" style={{ width: '12%' }}></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">System Data</p>
                  <p className="font-medium">~4 KB</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">User Data</p>
                  <p className="font-medium">~{usedStorage}</p>
                </div>
              </div>
            </div>
            
            <button
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center mt-4"
              onClick={() => alert('Storage optimized!')}
            >
              <SafeIcon icon={FiDownload} className="mr-2" />
              Optimize Storage
            </button>
          </div>
        )}

        {activeSection === 'network' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Network</h2>
            <div className="bg-gray-700 rounded-lg p-4 mb-4 flex items-center">
              <div className="bg-green-500 rounded-full w-3 h-3 mr-3"></div>
              <div>
                <p className="font-medium">Connected</p>
                <p className="text-sm text-gray-400">Browser connection is active</p>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-3">Proxy Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="font-medium flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${proxyEnabled ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    {proxyEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Server</p>
                  <p className="font-medium">localhost:3000</p>
                </div>
              </div>
            </div>
            
            <button
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center mt-4"
              onClick={() => alert('Network settings reset!')}
            >
              <SafeIcon icon={FiWifi} className="mr-2" />
              Reset Network Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;