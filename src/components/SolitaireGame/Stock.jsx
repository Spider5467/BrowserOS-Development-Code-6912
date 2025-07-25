import React from 'react';
import { motion } from 'framer-motion';

const Stock = ({ deck, stockIndex, onDealCard }) => {
  const remaining = deck.length - stockIndex;
  
  return (
    <motion.div
      className="h-32 rounded-xl border-2 border-white border-opacity-40 bg-gradient-to-br from-white to-white bg-opacity-15 backdrop-filter backdrop-blur-sm flex items-center justify-center cursor-pointer shadow-lg"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onDealCard}
    >
      <div className="w-20 h-28 rounded-xl border-2 border-white border-opacity-60 bg-gradient-to-br from-purple-800 to-indigo-900 flex flex-col items-center justify-center text-white shadow-lg">
        <div className="text-2xl mb-1">🂠</div>
        <div className="text-xs font-bold">DECK</div>
        {remaining > 0 ? (
          <div className="text-xs opacity-80">{remaining} left</div>
        ) : (
          <div className="text-xs opacity-80">Reshuffle</div>
        )}
      </div>
    </motion.div>
  );
};

export default Stock;