import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ card, position, isSelectable = false, isSelected = false, onClick }) => {
  const { suit, rank, faceUp = true } = card;
  const color = suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
  const suitSymbol = {hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠'}[suit];
  
  const gradientColor = faceUp 
    ? (color === 'red' ? 'from-red-500 to-red-700' : 'from-indigo-700 to-indigo-900')
    : 'from-purple-800 to-indigo-900';
    
  const borderColor = isSelected 
    ? 'border-yellow-400' 
    : (faceUp ? 'border-white border-opacity-40' : 'border-white border-opacity-50');
  
  const shadowStyle = isSelected 
    ? 'shadow-lg shadow-yellow-400/30' 
    : 'shadow-lg';

  return (
    <motion.div
      className={`w-20 h-28 border-2 ${borderColor} rounded-xl bg-gradient-to-br ${gradientColor} absolute cursor-pointer ${shadowStyle}`}
      style={{ 
        top: position.top,
        left: position.left,
        userSelect: 'none'
      }}
      whileHover={isSelectable ? { y: -2, boxShadow: '0 6px 16px rgba(0, 0, 0, 0.6)' } : {}}
      onClick={isSelectable ? onClick : undefined}
    >
      {faceUp ? (
        <div className="p-2 flex flex-col justify-between h-full">
          <div className="text-white text-sm font-bold">{rank}</div>
          <div 
            className={`text-center text-2xl font-black ${color === 'red' ? 'text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-red-600' : 'text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-500'}`}
          >
            {suitSymbol}
          </div>
          <div className="text-white text-sm font-bold transform rotate-180">{rank}</div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-2xl">🂠</div>
        </div>
      )}
    </motion.div>
  );
};

export default Card;