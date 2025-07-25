import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

const Foundation = ({ suit, cards, selectedCard, onCardDrop }) => {
  const suitSymbol = {hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠'}[suit];
  const suitName = suit.charAt(0).toUpperCase() + suit.slice(1);
  
  return (
    <motion.div
      className="h-32 rounded-xl border-2 border-dashed border-white border-opacity-30 bg-gradient-to-br from-white to-white bg-opacity-10 backdrop-filter backdrop-blur-sm relative shadow-md"
      whileHover={{ 
        borderColor: 'rgba(255, 255, 255, 0.5)', 
        backgroundColor: 'rgba(255, 255, 255, 0.12)' 
      }}
      onClick={() => {
        if (selectedCard) {
          onCardDrop(selectedCard);
        }
      }}
    >
      {cards.length > 0 ? (
        <Card card={cards[cards.length - 1]} position={{ top: 10, left: 10 }} />
      ) : (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
          <div>{suitSymbol} A</div>
          <div className="text-xs opacity-70">{suitName}</div>
        </div>
      )}
    </motion.div>
  );
};

export default Foundation;