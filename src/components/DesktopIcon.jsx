import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DesktopIcon = ({ icon, label, onClick, darkMode = false, gridPosition, onPositionChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Grid settings
  const GRID_SIZE = 80; // Size of each grid cell
  const ICON_SIZE = 64; // Size of the icon
  const GRID_PADDING = 8; // Padding from edges

  // Calculate position from grid coordinates
  const getPositionFromGrid = (gridX, gridY) => ({
    x: GRID_PADDING + (gridX * GRID_SIZE),
    y: GRID_PADDING + (gridY * GRID_SIZE)
  });

  // Calculate grid coordinates from position
  const getGridFromPosition = (x, y) => ({
    gridX: Math.round((x - GRID_PADDING) / GRID_SIZE),
    gridY: Math.round((y - GRID_PADDING) / GRID_SIZE)
  });

  // Get current position from grid coordinates
  const position = getPositionFromGrid(gridPosition.x, gridPosition.y);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    
    // Calculate new grid position based on final drag position
    const newX = position.x + info.offset.x;
    const newY = position.y + info.offset.y;
    
    // Ensure the icon stays within bounds
    const maxGridX = Math.floor((window.innerWidth - GRID_PADDING - ICON_SIZE) / GRID_SIZE);
    const maxGridY = Math.floor((window.innerHeight - GRID_PADDING - ICON_SIZE - 48) / GRID_SIZE); // 48px for taskbar
    
    const newGridPos = getGridFromPosition(newX, newY);
    
    // Clamp to valid grid positions
    const clampedGridPos = {
      x: Math.max(0, Math.min(maxGridX, newGridPos.gridX)),
      y: Math.max(0, Math.min(maxGridY, newGridPos.gridY))
    };
    
    // Only update if position actually changed
    if (clampedGridPos.x !== gridPosition.x || clampedGridPos.y !== gridPosition.y) {
      onPositionChange(clampedGridPos);
    }
  };

  const handleClick = () => {
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <motion.div 
      className="absolute cursor-pointer select-none z-10"
      style={{
        left: position.x,
        top: position.y,
        width: ICON_SIZE,
        height: ICON_SIZE + 20 // Extra space for label
      }}
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      whileDrag={{ scale: 1.1, zIndex: 1000 }}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 mb-1 overflow-hidden rounded-lg shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5">
          <div className="w-full h-full flex items-center justify-center">
            <img 
              src={`/icons/${icon}`} 
              alt={label} 
              className="w-full h-full object-contain filter brightness-0 invert"
            />
          </div>
        </div>
        <div className={`text-white text-xs font-medium px-1 py-0.5 ${darkMode ? 'bg-gray-900' : 'bg-black'} bg-opacity-50 backdrop-blur-sm rounded max-w-16 truncate`}>
          {label}
        </div>
      </div>
    </motion.div>
  );
};

export default DesktopIcon;