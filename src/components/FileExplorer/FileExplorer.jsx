import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiFolder, 
  FiFile, 
  FiArrowLeft, 
  FiArrowRight, 
  FiArrowUp, 
  FiRefreshCw,
  FiHome,
  FiGrid,
  FiList,
  FiFileText,
  FiImage,
  FiMusic,
  FiVideo
} = FiIcons;

// Initial file system structure
const initialFileSystem = {
  'C:': {
    type: 'folder',
    children: {
      'Program Files': {
        type: 'folder',
        children: {
          'BrowserOS': {
            type: 'folder',
            children: {
              'system32': {
                type: 'folder',
                children: {
                  'kernel.sys': { type: 'file', size: '2.5 MB', modified: '2023-04-12' },
                  'config.ini': { type: 'file', size: '4 KB', modified: '2023-05-20' }
                }
              },
              'readme.txt': { type: 'file', size: '12 KB', modified: '2023-03-10' }
            }
          },
          'Games': {
            type: 'folder',
            children: {
              'Solitaire': { type: 'folder', children: {} },
              'Minesweeper': { type: 'folder', children: {} }
            }
          }
        }
      },
      'Users': {
        type: 'folder',
        children: {
          'Guest': {
            type: 'folder',
            children: {
              'Documents': {
                type: 'folder',
                children: {
                  'report.docx': { type: 'file', size: '45 KB', modified: '2023-06-15' },
                  'budget.xlsx': { type: 'file', size: '28 KB', modified: '2023-06-18' }
                }
              },
              'Pictures': {
                type: 'folder',
                children: {
                  'vacation.jpg': { type: 'file', size: '2.8 MB', modified: '2023-05-30' },
                  'family.png': { type: 'file', size: '3.2 MB', modified: '2023-02-14' }
                }
              },
              'Music': {
                type: 'folder',
                children: {
                  'playlist.mp3': { type: 'file', size: '4.5 MB', modified: '2023-01-22' }
                }
              },
              'Downloads': {
                type: 'folder',
                children: {
                  'setup.exe': { type: 'file', size: '15.7 MB', modified: '2023-06-02' }
                }
              }
            }
          }
        }
      },
      'Windows': {
        type: 'folder',
        children: {
          'System': { type: 'folder', children: {} },
          'Fonts': { type: 'folder', children: {} },
          'Logs': { type: 'folder', children: {} }
        }
      }
    }
  }
};

const FileExplorer = () => {
  const [fileSystem, setFileSystem] = useState(initialFileSystem);
  const [currentPath, setCurrentPath] = useState(['C:']);
  const [history, setHistory] = useState([['C:']]);
  const [historyPosition, setHistoryPosition] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Get current directory contents based on path
  const getCurrentDirectory = () => {
    let current = fileSystem;
    for (const segment of currentPath) {
      current = current[segment]?.children;
      if (!current) return {};
    }
    return current;
  };
  
  const currentDirectory = getCurrentDirectory();
  
  // Navigation functions
  const navigateTo = (path) => {
    setCurrentPath(path);
    // Add to history if it's a new navigation (not using back/forward)
    if (historyPosition === history.length - 1) {
      setHistory([...history, path]);
      setHistoryPosition(historyPosition + 1);
    } else {
      // If navigating after using back, trim history
      const newHistory = history.slice(0, historyPosition + 1);
      setHistory([...newHistory, path]);
      setHistoryPosition(historyPosition + 1);
    }
  };
  
  const handleItemClick = (name, item) => {
    if (item.type === 'folder') {
      navigateTo([...currentPath, name]);
    } else {
      setSelectedItem({ name, ...item });
    }
  };
  
  const navigateUp = () => {
    if (currentPath.length > 1) {
      navigateTo(currentPath.slice(0, -1));
    }
  };
  
  const navigateBack = () => {
    if (historyPosition > 0) {
      setHistoryPosition(historyPosition - 1);
      setCurrentPath(history[historyPosition - 1]);
    }
  };
  
  const navigateForward = () => {
    if (historyPosition < history.length - 1) {
      setHistoryPosition(historyPosition + 1);
      setCurrentPath(history[historyPosition + 1]);
    }
  };
  
  const navigateHome = () => {
    navigateTo(['C:']);
  };
  
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'jpg':
      case 'png':
      case 'gif':
      case 'bmp':
        return FiImage;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return FiMusic;
      case 'mp4':
      case 'avi':
      case 'mov':
        return FiVideo;
      case 'txt':
      case 'docx':
      case 'pdf':
        return FiFileText;
      default:
        return FiFile;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Toolbar */}
      <div className="p-3 border-b border-gray-700 flex items-center gap-2">
        <button 
          className={`p-2 rounded-md ${historyPosition > 0 ? 'hover:bg-gray-700 text-white' : 'text-gray-600 cursor-not-allowed'}`}
          onClick={navigateBack}
          disabled={historyPosition === 0}
        >
          <SafeIcon icon={FiArrowLeft} />
        </button>
        <button 
          className={`p-2 rounded-md ${historyPosition < history.length - 1 ? 'hover:bg-gray-700 text-white' : 'text-gray-600 cursor-not-allowed'}`}
          onClick={navigateForward}
          disabled={historyPosition === history.length - 1}
        >
          <SafeIcon icon={FiArrowRight} />
        </button>
        <button 
          className="p-2 rounded-md hover:bg-gray-700"
          onClick={navigateUp}
        >
          <SafeIcon icon={FiArrowUp} />
        </button>
        <button 
          className="p-2 rounded-md hover:bg-gray-700"
          onClick={navigateHome}
        >
          <SafeIcon icon={FiHome} />
        </button>
        <div className="flex-1 bg-gray-800 rounded-md px-3 py-2 text-sm">
          {currentPath.join(' > ')}
        </div>
        <button 
          className="p-2 rounded-md hover:bg-gray-700"
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          <SafeIcon icon={viewMode === 'grid' ? FiList : FiGrid} />
        </button>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 border-r border-gray-700 p-3 hidden md:block">
          <div className="mb-4">
            <h3 className="font-medium mb-2 text-gray-400 text-sm">Quick access</h3>
            <div className="space-y-1">
              <SidebarItem icon={FiHome} label="This PC" active={currentPath.length === 1} />
              <SidebarItem icon={FiFileText} label="Documents" />
              <SidebarItem icon={FiImage} label="Pictures" />
              <SidebarItem icon={FiMusic} label="Music" />
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 text-gray-400 text-sm">Drives</h3>
            <div className="space-y-1">
              <SidebarItem icon={FiFolder} label="C: Drive" active={currentPath[0] === 'C:'} />
            </div>
          </div>
        </div>
        
        {/* File list */}
        <div className="flex-1 p-4 overflow-y-auto">
          {Object.keys(currentDirectory).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <SafeIcon icon={FiFolder} className="text-5xl mb-4" />
              <p>This folder is empty</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(currentDirectory).map(([name, item]) => (
                <FileGridItem 
                  key={name}
                  name={name}
                  item={item}
                  onClick={() => handleItemClick(name, item)}
                  isSelected={selectedItem && selectedItem.name === name}
                  getFileIcon={getFileIcon}
                />
              ))}
            </div>
          ) : (
            <table className="w-full">
              <thead className="text-gray-400 text-sm border-b border-gray-700">
                <tr>
                  <th className="text-left pb-2 pl-2">Name</th>
                  <th className="text-left pb-2">Type</th>
                  <th className="text-left pb-2">Size</th>
                  <th className="text-left pb-2">Modified</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(currentDirectory).map(([name, item]) => (
                  <FileListItem 
                    key={name}
                    name={name}
                    item={item}
                    onClick={() => handleItemClick(name, item)}
                    isSelected={selectedItem && selectedItem.name === name}
                    getFileIcon={getFileIcon}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Status bar */}
      <div className="border-t border-gray-700 p-2 text-xs text-gray-400 flex items-center justify-between">
        <div>{Object.keys(currentDirectory).length} items</div>
        <div>{currentPath.join('\\')}</div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false }) => {
  return (
    <motion.div 
      className={`flex items-center p-2 rounded-md cursor-pointer ${active ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <SafeIcon icon={icon} className="mr-3" />
      <span className="truncate">{label}</span>
    </motion.div>
  );
};

const FileGridItem = ({ name, item, onClick, isSelected, getFileIcon }) => {
  return (
    <motion.div
      className={`flex flex-col items-center p-3 rounded-lg cursor-pointer ${isSelected ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className="w-16 h-16 flex items-center justify-center mb-2">
        {item.type === 'folder' ? (
          <SafeIcon icon={FiFolder} className="text-4xl text-yellow-400" />
        ) : (
          <SafeIcon icon={getFileIcon(name)} className="text-4xl text-blue-400" />
        )}
      </div>
      <div className="text-center truncate w-full text-sm">{name}</div>
    </motion.div>
  );
};

const FileListItem = ({ name, item, onClick, isSelected, getFileIcon }) => {
  return (
    <motion.tr
      className={`cursor-pointer ${isSelected ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}
      whileHover={{ backgroundColor: isSelected ? undefined : 'rgba(55, 65, 81, 1)' }}
      onClick={onClick}
    >
      <td className="py-2 pl-2 flex items-center">
        {item.type === 'folder' ? (
          <SafeIcon icon={FiFolder} className="mr-3 text-yellow-400" />
        ) : (
          <SafeIcon icon={getFileIcon(name)} className="mr-3 text-blue-400" />
        )}
        {name}
      </td>
      <td>{item.type === 'folder' ? 'Folder' : name.split('.').pop().toUpperCase() + ' File'}</td>
      <td>{item.type === 'folder' ? '--' : item.size}</td>
      <td>{item.modified || '--'}</td>
    </motion.tr>
  );
};

export default FileExplorer;