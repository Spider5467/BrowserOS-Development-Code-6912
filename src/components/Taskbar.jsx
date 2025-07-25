import React from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
const { FiMenu } = FiIcons;

const Taskbar = ({ onStartClick }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-800 bg-opacity-80 border-t border-gray-600 flex items-center px-2">
      <button 
        className="flex items-center justify-center h-10 hover:bg-gray-700 active:bg-gray-600 rounded transition-colors"
        onClick={onStartClick}
      >
        <img 
          src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753460280461-bOS_L.jpg" 
          alt="Start" 
          className="h-10 w-10 object-contain"
        />
      </button>
    </div>
  );
};

export default Taskbar;