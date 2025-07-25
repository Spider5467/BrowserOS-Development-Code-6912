import React from 'react';
import Card from './Card';

const Waste = ({ wasteCards, selectedCard, setSelectedCard }) => {
  return (
    <div className="h-32 rounded-xl border-2 border-dashed border-white border-opacity-30 bg-gradient-to-br from-white to-white bg-opacity-10 backdrop-filter backdrop-blur-sm relative shadow-md">
      {wasteCards.length > 0 ? (
        <Card 
          card={wasteCards[wasteCards.length - 1]} 
          position={{ top: 10, left: 10 }} 
          isSelectable={true}
          isSelected={selectedCard && selectedCard.source === 'waste'}
          onClick={() => {
            if (wasteCards.length > 0) {
              const topCard = wasteCards[wasteCards.length - 1];
              setSelectedCard({
                ...topCard,
                source: 'waste'
              });
            }
          }}
        />
      ) : (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-opacity-50 text-xs">
          Waste
        </div>
      )}
    </div>
  );
};

export default Waste;