import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

const Tableau = ({ columnIndex, cards, selectedCard, setSelectedCard, onCardDrop }) => {
  return (
    <motion.div
      className="min-h-36 rounded-xl border-2 border-dashed border-white border-opacity-20 bg-gradient-to-br from-white to-white bg-opacity-8 backdrop-filter backdrop-blur-sm relative shadow-md"
      whileHover={{ 
        borderColor: 'rgba(255, 255, 255, 0.4)',
        backgroundColor: 'rgba(255, 255, 255, 0.12)' 
      }}
      onClick={() => {
        if (selectedCard) {
          onCardDrop(selectedCard);
        }
      }}
    >
      {cards.map((card, index) => (
        <Card 
          key={`${card.suit}-${card.rank}-${index}`} 
          card={card}
          position={{ top: index * 20, left: 5 }}
          isSelectable={card.faceUp}
          isSelected={selectedCard && selectedCard.source === 'tableau' && selectedCard.columnIndex === columnIndex && index === cards.length - 1}
          onClick={() => {
            if (card.faceUp && index === cards.length - 1) {
              setSelectedCard({
                ...card,
                source: 'tableau',
                columnIndex
              });
            }
          }}
        />
      ))}
    </motion.div>
  );
};

export default Tableau;