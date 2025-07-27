import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSearch, FiDownload, FiStar, FiGrid, FiTrendingUp, FiPackage, FiGamepad } = FiIcons;

const categories = [
  { id: 'all', name: 'All Apps', icon: FiGrid },
  { id: 'games', name: 'Games', icon: FiGamepad },
  { id: 'trending', name: 'Trending', icon: FiTrendingUp },
  { id: 'utilities', name: 'Utilities', icon: FiPackage }
];

const appsList = [
  {
    id: 'minecraft',
    name: 'Minecraft Classic',
    icon: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753790690682-minecraft_icon.png',
    description: 'Play the classic version of Minecraft right in your browser',
    category: 'games',
    rating: 4.8,
    downloads: '10M+',
    screenshots: [
      'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753790695587-minecraft_screen1.jpg',
      'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753790700091-minecraft_screen2.jpg'
    ],
    url: 'https://classic.minecraft.net/'
  },
  {
    id: '2048',
    name: '2048',
    icon: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753790704233-2048_icon.png',
    description: 'Join the tiles and reach 2048!',
    category: 'games',
    rating: 4.5,
    downloads: '50M+',
    screenshots: [
      'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753790708496-2048_screen1.png'
    ],
    url: 'https://play2048.co/'
  },
  {
    id: 'tetris',
    name: 'Tetris',
    icon: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753790712772-tetris_icon.png',
    description: 'The classic tile-matching puzzle game',
    category: 'games',
    rating: 4.7,
    downloads: '100M+',
    screenshots: [
      'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753790717171-tetris_screen1.jpg'
    ],
    url: 'https://tetris.com/play-tetris'
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753790721327-calculator_icon.png',
    description: 'A simple calculator for basic math operations',
    category: 'utilities',
    rating: 4.2,
    downloads: '5M+',
    screenshots: [
      'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753790725575-calculator_screen1.png'
    ],
    url: 'https://www.desmos.com/scientific'
  },
  {
    id: 'chess',
    name: 'Chess',
    icon: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753790738372-chess_icon.png',
    description: 'Play chess online against the computer or other players',
    category: 'games',
    rating: 4.6,
    downloads: '20M+',
    screenshots: [
      'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753790743091-chess_screen1.jpg'
    ],
    url: 'https://www.chess.com/play/computer'
  },
  {
    id: 'snake',
    name: 'Snake Game',
    icon: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753790747350-snake_icon.png',
    description: 'Classic snake game - eat, grow, and don\'t hit the walls!',
    category: 'games',
    rating: 4.3,
    downloads: '30M+',
    screenshots: [
      'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753790751534-snake_screen1.jpg'
    ],
    url: 'https://playsnake.org/'
  },
  {
    id: 'pacman',
    name: 'Pac-Man',
    icon: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753790755874-pacman_icon.png',
    description: 'The classic arcade game where you navigate a maze eating dots',
    category: 'games',
    rating: 4.9,
    downloads: '80M+',
    screenshots: [
      'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753790760082-pacman_screen1.jpg'
    ],
    url: 'https://www.google.com/logos/2010/pacman10-i.html'
  }
];

const AppStore = ({ onAppInstall, darkMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [filteredApps, setFilteredApps] = useState(appsList);
  const [installedApps, setInstalledApps] = useState([]);

  // Load installed apps from localStorage
  useEffect(() => {
    try {
      const savedInstalledApps = localStorage.getItem('browserOS_installedApps');
      if (savedInstalledApps) {
        setInstalledApps(JSON.parse(savedInstalledApps));
      }
    } catch (error) {
      console.error('Error loading installed apps:', error);
    }
  }, []);

  useEffect(() => {
    const filtered = appsList.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           app.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredApps(filtered);
  }, [searchTerm, selectedCategory]);

  const handleAppClick = (app) => {
    setSelectedApp(app);
  };

  const handleInstall = (app) => {
    // Save to installed apps in localStorage
    const newInstalledApps = [...installedApps, app.id];
    setInstalledApps(newInstalledApps);
    try {
      localStorage.setItem('browserOS_installedApps', JSON.stringify(newInstalledApps));
    } catch (error) {
      console.error('Error saving installed apps:', error);
    }

    if (onAppInstall) {
      onAppInstall(app.id, app.url, app.name);
    }

    // Show installation success message
    const appElement = document.getElementById(`app-${app.id}`);
    if (appElement) {
      const successEl = document.createElement('div');
      successEl.className = 'absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-80 text-white font-bold rounded-lg';
      successEl.textContent = 'Installing...';
      appElement.appendChild(successEl);
      setTimeout(() => {
        appElement.removeChild(successEl);
      }, 1500);
    }
  };

  const handleBackToList = () => {
    setSelectedApp(null);
  };

  const isAppInstalled = (appId) => {
    return installedApps.includes(appId);
  };

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} text-white`}>
      <div className="p-4 border-b border-gray-700 flex items-center gap-4">
        <div className="relative flex-1">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            placeholder="Search apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {!selectedApp ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-48 border-r border-gray-700 p-4 space-y-2 hidden md:block">
            {categories.map(category => (
              <motion.div
                key={category.id}
                className={`flex items-center p-2 rounded-lg cursor-pointer ${
                  selectedCategory === category.id ? 'bg-indigo-600' : 'hover:bg-gray-700'
                }`}
                onClick={() => setSelectedCategory(category.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SafeIcon icon={category.icon} className="mr-3" />
                <span>{category.name}</span>
              </motion.div>
            ))}
          </div>

          {/* Mobile Categories */}
          <div className="md:hidden p-2 overflow-x-auto whitespace-nowrap border-b border-gray-700">
            {categories.map(category => (
              <motion.button
                key={category.id}
                className={`inline-flex items-center p-2 mr-2 rounded-lg ${
                  selectedCategory === category.id ? 'bg-indigo-600' : `${darkMode ? 'bg-gray-800' : 'bg-gray-700'}`
                }`}
                onClick={() => setSelectedCategory(category.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SafeIcon icon={category.icon} className="mr-2" />
                <span>{category.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Apps Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {categories.find(c => c.id === selectedCategory).name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApps.map(app => (
                <motion.div
                  key={app.id}
                  id={`app-${app.id}`}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-lg overflow-hidden relative border border-gray-700`}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-4 flex items-start cursor-pointer" onClick={() => handleAppClick(app)}>
                    <div className="w-16 h-16 rounded-lg mr-4 bg-gradient-to-br from-indigo-500 to-purple-600 p-2 flex items-center justify-center">
                      <img src={app.icon} alt={app.name} className="w-12 h-12 filter invert" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{app.name}</h3>
                      <div className="flex items-center text-gray-400 text-sm">
                        <SafeIcon icon={FiStar} className="text-yellow-400 mr-1" />
                        <span>{app.rating}</span>
                        <span className="mx-2">•</span>
                        <SafeIcon icon={FiDownload} className="mr-1" />
                        <span>{app.downloads}</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{app.description}</p>
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-1 flex justify-end">
                    <motion.button
                      className={`${
                        isAppInstalled(app.id) 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      } text-white px-4 py-2 rounded-lg flex items-center`}
                      onClick={() => handleInstall(app)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isAppInstalled(app.id)}
                    >
                      <SafeIcon icon={FiDownload} className="mr-2" />
                      {isAppInstalled(app.id) ? 'Installed' : 'Install'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
              {filteredApps.length === 0 && (
                <div className="col-span-full text-center p-10 text-gray-400">
                  No apps found matching your search criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <AppDetails
          app={selectedApp}
          onBack={handleBackToList}
          onInstall={() => handleInstall(selectedApp)}
          isInstalled={isAppInstalled(selectedApp.id)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

const AppDetails = ({ app, onBack, onInstall, isInstalled, darkMode = false }) => {
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <button
        className="flex items-center text-indigo-400 mb-4 hover:underline"
        onClick={onBack}
      >
        ← Back to apps
      </button>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 flex flex-col items-center">
          <div className="w-32 h-32 rounded-xl mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 p-3 flex items-center justify-center">
            <img src={app.icon} alt={app.name} className="w-24 h-24 filter invert" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">{app.name}</h1>
          <div className="flex items-center mb-4">
            <SafeIcon icon={FiStar} className="text-yellow-400 mr-1" />
            <span className="mr-2">{app.rating}</span>
            <span className="text-gray-400 text-sm">({app.downloads} downloads)</span>
          </div>
          <motion.button
            className={`${
              isInstalled 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white px-6 py-3 rounded-lg flex items-center w-full justify-center`}
            onClick={onInstall}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isInstalled}
          >
            <SafeIcon icon={FiDownload} className="mr-2" />
            {isInstalled ? 'Installed' : 'Install App'}
          </motion.button>
        </div>
        <div className="flex-1">
          <div className="mb-6 relative">
            {app.screenshots && app.screenshots.length > 0 && (
              <img
                src={app.screenshots[activeScreenshot]}
                alt={`${app.name} screenshot`}
                className="w-full rounded-lg shadow-lg h-64 object-cover"
              />
            )}
            {app.screenshots && app.screenshots.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {app.screenshots.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      activeScreenshot === index ? 'bg-indigo-500' : 'bg-gray-600'
                    }`}
                    onClick={() => setActiveScreenshot(index)}
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-300">{app.description}</p>
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-700'} p-4 rounded-lg`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Category</span>
                  <p className="capitalize">{app.category}</p>
                </div>
                <div>
                  <span className="text-gray-400">Rating</span>
                  <p>{app.rating} / 5.0</p>
                </div>
                <div>
                  <span className="text-gray-400">Downloads</span>
                  <p>{app.downloads}</p>
                </div>
                <div>
                  <span className="text-gray-400">Platform</span>
                  <p>BrowserOS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppStore;