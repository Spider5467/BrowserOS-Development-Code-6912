import React from 'react';
import { motion } from 'framer-motion';

const DesktopIcon = ({ icon, label, onClick }) => {
  return (
    <motion.div 
      className="w-16 text-center cursor-pointer select-none"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className="w-12 h-12 mx-auto mb-1 overflow-hidden">
        <img 
          src={icon} 
          alt={label} 
          className="w-full h-full object-contain"
        />
      </div>
      <div className="text-white text-xs font-medium px-1 py-0.5 bg-black bg-opacity-30 rounded">
        {label}
      </div>
    </motion.div>
  );
};

export default DesktopIcon;