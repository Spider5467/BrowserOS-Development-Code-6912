import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiGlobe, FiShield, FiServer, FiToggleLeft, FiToggleRight, FiRefreshCw, FiCheck, FiX, FiAlertTriangle } = FiIcons;

const ProxyControls = ({ darkMode = false, proxyEnabled, setProxyEnabled, proxyUrl, setProxyUrl, proxyStatus, onCheckStatus }) => {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const toggleProxy = () => {
    setProxyEnabled(!proxyEnabled);
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    await onCheckStatus();
    setTimeout(() => setIsChecking(false), 1000);
  };

  const getStatusIcon = () => {
    switch (proxyStatus) {
      case 'connected': return FiCheck;
      case 'checking': return FiRefreshCw;
      case 'error': return FiAlertTriangle;
      case 'disconnected': return FiX;
      default: return FiServer;
    }
  };

  const getStatusColor = () => {
    switch (proxyStatus) {
      case 'connected': return 'text-green-400';
      case 'checking': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'disconnected': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (proxyStatus) {
      case 'connected': return 'Proxy Server Online';
      case 'checking': return 'Checking Connection...';
      case 'error': return 'Connection Error';
      case 'disconnected': return 'Proxy Server Offline';
      default: return 'Unknown Status';
    }
  };

  return (
    <div className={`p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} rounded-lg border-b border-gray-700`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <SafeIcon icon={FiShield} className="mr-2 text-indigo-400" />
          Enhanced Proxy Settings
        </h2>
        <motion.button
          className={`px-3 py-1 rounded-full flex items-center ${proxyEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
          onClick={toggleProxy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SafeIcon icon={proxyEnabled ? FiToggleRight : FiToggleLeft} className="mr-2" />
          {proxyEnabled ? 'Enabled' : 'Disabled'}
        </motion.button>
      </div>

      <div className={`flex items-center mb-4 p-3 rounded-lg ${proxyStatus === 'connected' ? 'bg-green-900 bg-opacity-20' : proxyStatus === 'error' ? 'bg-red-900 bg-opacity-20' : 'bg-gray-700'}`}>
        <div className="flex-1">
          <div className="flex items-center">
            <SafeIcon 
              icon={getStatusIcon()} 
              className={`mr-2 ${getStatusColor()} ${proxyStatus === 'checking' || isChecking ? 'animate-spin' : ''}`} 
            />
            <span className="font-medium">
              {getStatusText()}
            </span>
          </div>
          {proxyEnabled && proxyStatus === 'connected' && (
            <div className="text-xs text-gray-400 mt-1">
              ✓ YouTube iframe support ✓ Frame-busting protection ✓ CORS bypass
            </div>
          )}
          {proxyStatus === 'disconnected' && (
            <div className="text-xs text-red-400 mt-1">
              Start proxy server: node src/proxy/startProxy.js
            </div>
          )}
        </div>
        <motion.button
          className="p-2 rounded-md bg-indigo-600 hover:bg-indigo-700"
          onClick={handleCheckStatus}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isChecking}
        >
          <SafeIcon icon={FiRefreshCw} className={isChecking ? 'animate-spin' : ''} />
        </motion.button>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-400">Proxy Server URL</label>
          <motion.button
            className="text-xs text-indigo-400 hover:underline flex items-center"
            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isAdvancedMode ? 'Simple Mode' : 'Advanced Mode'}
          </motion.button>
        </div>
        <div className="flex">
          <input
            type="text"
            value={proxyUrl}
            onChange={(e) => setProxyUrl(e.target.value)}
            className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            placeholder="http://localhost:3000/proxy"
          />
          <motion.button
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setProxyUrl("http://localhost:3000/proxy");
              handleCheckStatus();
            }}
          >
            <SafeIcon icon={FiGlobe} />
          </motion.button>
        </div>
      </div>

      {isAdvancedMode && (
        <div className="space-y-3 border-t border-gray-700 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
              <span className="text-sm">YouTube Support</span>
              <div className={`w-2 h-2 rounded-full ${proxyStatus === 'connected' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
              <span className="text-sm">Frame Protection</span>
              <div className={`w-2 h-2 rounded-full ${proxyStatus === 'connected' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
              <span className="text-sm">CORS Bypass</span>
              <div className={`w-2 h-2 rounded-full ${proxyStatus === 'connected' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
              <span className="text-sm">Content Rewriting</span>
              <div className={`w-2 h-2 rounded-full ${proxyStatus === 'connected' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            </div>
          </div>
          
          <div className="text-xs text-gray-400 mt-3">
            <p className="font-medium mb-2">Enhanced Features:</p>
            <ul className="space-y-1">
              <li>• Bypasses X-Frame-Options headers</li>
              <li>• Removes Content-Security-Policy restrictions</li>
              <li>• Prevents frame-busting JavaScript</li>
              <li>• Handles dynamic content rewriting</li>
              <li>• Supports POST requests and forms</li>
              <li>• Special YouTube iframe optimization</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProxyControls;