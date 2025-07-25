import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiRefreshCw, FiLayers, FiZap } = FiIcons;

const GameControls = ({ onNewGame, onDealCard, onAutoComplete }) => {
  return (
    <div className="text-center mb-6">
      <motion.button
        className="px-6 py-3 mx-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold text-sm shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNewGame}
      >
        <SafeIcon icon={FiRefreshCw} className="inline-block mr-2" />
        New Game
      </motion.button>
      
      <motion.button
        className="px-6 py-3 mx-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold text-sm shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDealCard}
      >
        <SafeIcon icon={FiLayers} className="inline-block mr-2" />
        Deal Card
      </motion.button>
      
      <motion.button
        className="px-6 py-3 mx-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold text-sm shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAutoComplete}
      >
        <SafeIcon icon={FiZap} className="inline-block mr-2" />
        Auto Complete
      </motion.button>
    </div>
  );
};

export default GameControls;