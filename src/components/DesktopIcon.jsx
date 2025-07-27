import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DesktopIcon = ({ icon, label, onClick, darkMode = false }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
  };

  const handleClick = () => {
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <motion.div 
      className="w-16 text-center cursor-pointer select-none"
      drag
      dragMomentum={false}
      dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
      dragElastic={0.1}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-12 h-12 mx-auto mb-1 overflow-hidden rounded-lg shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src={`/icons/${icon}`} 
            alt={label} 
            className="w-full h-full object-contain filter brightness-0 invert"
          />
        </div>
      </div>
      <div className={`text-white text-xs font-medium px-1 py-0.5 ${darkMode ? 'bg-gray-900' : 'bg-black'} bg-opacity-50 backdrop-blur-sm rounded`}>
        {label}
      </div>
    </motion.div>
  );
};

export default DesktopIcon;