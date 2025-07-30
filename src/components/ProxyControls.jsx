import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import cloudProxyClient from '../proxy/cloudProxyClient';
import * as FiIcons from 'react-icons/fi';

const { 
  FiGlobe, FiShield, FiCloud, FiToggleLeft, FiToggleRight, 
  FiRefreshCw, FiCheck, FiX, FiAlertTriangle, FiWifi, 
  FiServer, FiZap, FiActivity, FiList, FiBarChart2, FiClock
} = FiIcons;

const ProxyControls = ({ 
  darkMode = false, 
  proxyEnabled, 
  setProxyEnabled, 
  proxyStatus, 
  onReconnect 
}) => {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState({});
  const [testResults, setTestResults] = useState([]);

  // Get connection details periodically
  useEffect(() => {
    const updateConnectionDetails = () => {
      const status = cloudProxyClient.checkStatus();
      setConnectionDetails(status);
    };

    updateConnectionDetails();
    const interval = setInterval(updateConnectionDetails, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleProxy = () => {
    if (!proxyEnabled) {
      // When enabling, try to connect if not already connected
      if (!cloudProxyClient.isConnected) {
        cloudProxyClient.connect();
      }
    }
    setProxyEnabled(!proxyEnabled);
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setTestResults([]);
    
    // First update the UI to show we're testing
    const initialStatus = {
      message: "Starting proxy service test...",
      success: true
    };
    setTestResults([initialStatus]);
    
    // Then test each service
    for (const service of cloudProxyClient.proxyServices) {
      setTestResults(prev => [...prev, {
        service: service.name,
        message: `Testing ${service.name}...`,
        status: 'testing'
      }]);
      
      try {
        const success = await cloudProxyClient.testService(service);
        setTestResults(prev => prev.map(item => 
          item.service === service.name 
            ? { 
                ...item, 
                status: success ? 'success' : 'failed',
                message: success ? `${service.name} is working!` : `${service.name} failed`
              }
            : item
        ));
      } catch (error) {
        setTestResults(prev => prev.map(item => 
          item.service === service.name 
            ? { 
                ...item, 
                status: 'error',
                message: `${service.name} error: ${error.message}`
              }
            : item
        ));
      }
      
      // Short delay to make the UI more readable
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Final update with summary
    await cloudProxyClient.connect();
    setTestResults(prev => [...prev, {
      message: `Test complete. Found ${cloudProxyClient.workingServices.length} working services.`,
      status: 'complete'
    }]);
    
    setTimeout(() => setIsChecking(false), 1000);
  };

  const handleForceReconnect = async () => {
    setIsChecking(true);
    await cloudProxyClient.retry();
    setTimeout(() => setIsChecking(false), 3000);
  };

  const getStatusIcon = () => {
    switch (proxyStatus) {
      case 'connected': return FiCheck;
      case 'connecting': return FiRefreshCw;
      case 'error': return FiAlertTriangle;
      case 'disconnected': return FiX;
      case 'fallback': return FiServer;
      default: return FiCloud;
    }
  };

  const getStatusColor = () => {
    switch (proxyStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'disconnected': return 'text-gray-400';
      case 'fallback': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (proxyStatus) {
      case 'connected': 
        return `Proxy Connected: ${connectionDetails.service || 'Unknown'}`;
      case 'connecting': 
        return 'Finding Working Proxy...';
      case 'error': 
        return 'Connection Error';
      case 'disconnected': 
        return 'Disconnected';
      case 'fallback': 
        return 'Fallback Mode Active';
      default: 
        return 'Unknown Status';
    }
  };

  const getStatusDescription = () => {
    switch (proxyStatus) {
      case 'connected': 
        return `Successfully connected to ${connectionDetails.service || 'proxy'} service. ${connectionDetails.workingServices || 0} total working services available.`;
      case 'connecting': 
        return 'Testing multiple proxy services to find working connections...';
      case 'error': 
        return 'Unable to connect to any proxy services. Check your internet connection and try reconnecting.';
      case 'disconnected': 
        return 'Not connected to any proxy service. Click reconnect to establish connection.';
      case 'fallback': 
        return 'Primary services unavailable. Using backup services with automatic rotation.';
      default: 
        return 'Determining proxy status...';
    }
  };

  return (
    <div className={`p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} rounded-lg border-b border-gray-700`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <SafeIcon icon={FiShield} className="mr-2 text-indigo-400" />
          Proxy Settings
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

      <div className={`flex items-center mb-4 p-3 rounded-lg ${
        proxyStatus === 'connected' ? 'bg-green-900 bg-opacity-20' : 
        proxyStatus === 'error' ? 'bg-red-900 bg-opacity-20' : 
        proxyStatus === 'fallback' ? 'bg-orange-900 bg-opacity-20' : 
        'bg-gray-700'
      }`}>
        <div className="flex-1">
          <div className="flex items-center">
            <SafeIcon 
              icon={getStatusIcon()} 
              className={`mr-2 ${getStatusColor()} ${
                proxyStatus === 'connecting' || isChecking ? 'animate-spin' : ''
              }`} 
            />
            <span className="font-medium">
              {getStatusText()}
            </span>
          </div>
          
          <div className="text-xs text-gray-400 mt-2">
            {getStatusDescription()}
          </div>
          
          {proxyStatus === 'connected' && connectionDetails.workingServiceNames && (
            <div className="text-xs text-green-400 mt-2 flex flex-wrap gap-2">
              {connectionDetails.workingServiceNames.map((name, index) => (
                <span 
                  key={name} 
                  className={`px-2 py-1 bg-green-900 bg-opacity-30 rounded-full ${
                    index === connectionDetails.currentServiceIndex ? 'border border-green-400' : ''
                  }`}
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <motion.button
            className="p-2 rounded-md bg-indigo-600 hover:bg-indigo-700"
            onClick={handleCheckStatus}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isChecking}
            title="Test All Services"
          >
            <SafeIcon icon={isChecking ? FiRefreshCw : FiBarChart2} className={isChecking ? 'animate-spin' : ''} />
          </motion.button>

          <motion.button
            className="p-2 rounded-md bg-orange-600 hover:bg-orange-700"
            onClick={handleForceReconnect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isChecking}
            title="Force Reconnect"
          >
            <SafeIcon icon={FiZap} className={isChecking ? 'animate-spin' : ''} />
          </motion.button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg max-h-48 overflow-y-auto">
          <h3 className="font-medium mb-2 flex items-center">
            <SafeIcon icon={FiList} className="mr-2 text-blue-400" />
            Test Results
          </h3>
          <div className="space-y-1 text-sm">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center">
                {result.status === 'testing' && (
                  <SafeIcon icon={FiRefreshCw} className="mr-2 text-yellow-400 animate-spin" />
                )}
                {result.status === 'success' && (
                  <SafeIcon icon={FiCheck} className="mr-2 text-green-400" />
                )}
                {result.status === 'failed' && (
                  <SafeIcon icon={FiX} className="mr-2 text-red-400" />
                )}
                {result.status === 'error' && (
                  <SafeIcon icon={FiAlertTriangle} className="mr-2 text-orange-400" />
                )}
                {result.status === 'complete' && (
                  <SafeIcon icon={FiCheck} className="mr-2 text-green-400" />
                )}
                {!result.status && (
                  <SafeIcon icon={FiCloud} className="mr-2 text-blue-400" />
                )}
                <span className={
                  result.status === 'success' ? 'text-green-400' :
                  result.status === 'failed' ? 'text-red-400' :
                  result.status === 'error' ? 'text-orange-400' :
                  'text-gray-300'
                }>
                  {result.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Info */}
      {connectionDetails.connected && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <h3 className="font-medium mb-2 flex items-center">
            <SafeIcon icon={FiWifi} className="mr-2 text-blue-400" />
            Connection Details
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">Active Service:</span>
              <p className="font-mono">{connectionDetails.service || 'None'}</p>
            </div>
            <div>
              <span className="text-gray-400">Working Services:</span>
              <p className="font-mono">{connectionDetails.workingServices || 0}</p>
            </div>
            <div>
              <span className="text-gray-400">Last Test:</span>
              <p className="font-mono flex items-center">
                <SafeIcon icon={FiClock} className="mr-1 text-xs" />
                {connectionDetails.testAge < 60 
                  ? `${connectionDetails.testAge} min ago` 
                  : 'Over 1 hour ago'}
              </p>
            </div>
            {connectionDetails.connectionId && (
              <div>
                <span className="text-gray-400">Connection ID:</span>
                <p className="font-mono text-xs truncate">{connectionDetails.connectionId}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3 border-t border-gray-700 pt-3 mt-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <span className="text-sm">CORS Bypass</span>
            <div className={`w-2 h-2 rounded-full ${
              proxyStatus === 'connected' ? 'bg-green-400' : 'bg-gray-400'
            }`}></div>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <span className="text-sm">Auto-Failover</span>
            <div className={`w-2 h-2 rounded-full ${
              (connectionDetails.workingServices || 0) > 1 ? 'bg-green-400' : 'bg-gray-400'
            }`}></div>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <span className="text-sm">Multi-Service</span>
            <div className={`w-2 h-2 rounded-full ${
              (connectionDetails.workingServices || 0) > 1 ? 'bg-green-400' : 'bg-orange-400'
            }`}></div>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <span className="text-sm">Smart Retry</span>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
          </div>
        </div>

        <div className="text-xs text-gray-400 mt-3">
          <p className="font-medium mb-2">About the Proxy:</p>
          <ul className="space-y-1">
            <li>• <strong>Multiple Services:</strong> Uses multiple proxy services for reliability</li>
            <li>• <strong>Auto-Failover:</strong> Switches to working services automatically</li>
            <li>• <strong>Smart Detection:</strong> Tests services to ensure they actually work</li>
            <li>• <strong>Caching:</strong> Remembers working services between sessions</li>
          </ul>
        </div>

        {isAdvancedMode && (
          <div className="text-xs text-gray-400 mt-3 p-2 bg-gray-800 rounded">
            <p className="font-medium mb-1">Available Proxy Services:</p>
            {cloudProxyClient.proxyServices.map(service => (
              <div key={service.name} className="flex items-center justify-between mb-1">
                <span>{service.name}</span>
                <span className={
                  connectionDetails.workingServiceNames?.includes(service.name) 
                    ? 'text-green-400' 
                    : 'text-gray-500'
                }>
                  {connectionDetails.workingServiceNames?.includes(service.name) ? 'Working' : 'Unavailable'}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-2">
          <motion.button
            className="text-xs text-indigo-400 hover:underline flex items-center"
            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isAdvancedMode ? 'Hide Advanced Details' : 'Show Advanced Details'}
          </motion.button>

          <motion.button
            className="text-xs bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-full"
            onClick={handleForceReconnect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isChecking}
          >
            {isChecking ? 'Reconnecting...' : 'Force Reconnect'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ProxyControls;