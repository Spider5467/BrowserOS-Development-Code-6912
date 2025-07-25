import React from 'react';
import Stock from './Stock';
import Waste from './Waste';
import Foundation from './Foundation';
import Tableau from './Tableau';

const GameArea = ({
  deck,
  stockIndex,
  setStockIndex, // Add this prop
  tableauCards,
  setTableauCards,
  foundationCards,
  setFoundationCards,
  wasteCards,
  setWasteCards,
  selectedCard,
  setSelectedCard
}) => {
  return (
    <div className="grid grid-cols-7 gap-4 max-w-4xl mx-auto">
      <Stock 
        deck={deck} 
        stockIndex={stockIndex} 
        onDealCard={() => {
          if (stockIndex < deck.length) {
            const card = deck[stockIndex];
            setWasteCards([...wasteCards, {...card, faceUp: true}]);
            setStockIndex(stockIndex + 1);
          } else {
            setWasteCards([]);
            setStockIndex(28);
          }
        }}
      />
      
      <Waste 
        wasteCards={wasteCards} 
        selectedCard={selectedCard}
        setSelectedCard={setSelectedCard}
      />
      
      {['hearts', 'diamonds', 'clubs', 'spades'].map((suit, index) => (
        <Foundation
          key={suit}
          suit={suit}
          cards={foundationCards[index]}
          selectedCard={selectedCard}
          onCardDrop={(card) => {
            // Logic for dropping a card on foundation
            const newFoundationCards = [...foundationCards];
            
            if (selectedCard) {
              // Check if it's a valid move (card is Ace or next in sequence)
              const foundationLength = newFoundationCards[index].length;
              const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
              
              if ((foundationLength === 0 && selectedCard.rank === 'A') || 
                  (foundationLength > 0 && 
                   ranks.indexOf(selectedCard.rank) === ranks.indexOf(newFoundationCards[index][foundationLength - 1].rank) + 1)) {
                
                newFoundationCards[index] = [...newFoundationCards[index], selectedCard];
                setFoundationCards(newFoundationCards);
                
                // Remove card from its original location
                if (selectedCard.source === 'waste') {
                  setWasteCards(wasteCards.filter((_, i) => i !== wasteCards.length - 1));
                } else if (selectedCard.source === 'tableau') {
                  const newTableauCards = [...tableauCards];
                  const colIndex = selectedCard.columnIndex;
                  newTableauCards[colIndex].pop();
                  
                  // If there are cards left in the column, flip the last one
                  if (newTableauCards[colIndex].length > 0 && !newTableauCards[colIndex][newTableauCards[colIndex].length - 1].faceUp) {
                    newTableauCards[colIndex][newTableauCards[colIndex].length - 1].faceUp = true;
                  }
                  
                  setTableauCards(newTableauCards);
                }
                
                setSelectedCard(null);
              }
            }
          }}
        />
      ))}
      
      <div className="col-span-1"></div>
      
      {tableauCards.map((column, colIndex) => (
        <Tableau
          key={colIndex}
          columnIndex={colIndex}
          cards={column}
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          onCardDrop={(cardData) => {
            // Logic for dropping cards on tableau
            if (selectedCard) {
              const newTableauCards = [...tableauCards];
              
              // Check if it's a valid move (King on empty pile or correct descending sequence and alternating colors)
              const isValidMove = () => {
                if (column.length === 0) {
                  return selectedCard.rank === 'K';
                } else {
                  const topCard = column[column.length - 1];
                  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
                  const topRankIndex = ranks.indexOf(topCard.rank);
                  const selectedRankIndex = ranks.indexOf(selectedCard.rank);
                  
                  const topColor = topCard.suit === 'hearts' || topCard.suit === 'diamonds' ? 'red' : 'black';
                  const selectedColor = selectedCard.suit === 'hearts' || selectedCard.suit === 'diamonds' ? 'red' : 'black';
                  
                  return selectedRankIndex === topRankIndex - 1 && selectedColor !== topColor;
                }
              };
              
              if (isValidMove()) {
                // Add card to this tableau
                newTableauCards[colIndex] = [...newTableauCards[colIndex], 
                  {...selectedCard, faceUp: true, source: 'tableau', columnIndex: colIndex}];
                
                // Remove card from its original location
                if (selectedCard.source === 'waste') {
                  setWasteCards(wasteCards.filter((_, i) => i !== wasteCards.length - 1));
                } else if (selectedCard.source === 'tableau') {
                  const sourceColIndex = selectedCard.columnIndex;
                  if (sourceColIndex !== colIndex) {
                    newTableauCards[sourceColIndex].pop();
                    
                    // If there are cards left in the column, flip the last one if it's face down
                    if (newTableauCards[sourceColIndex].length > 0 && 
                        !newTableauCards[sourceColIndex][newTableauCards[sourceColIndex].length - 1].faceUp) {
                      newTableauCards[sourceColIndex][newTableauCards[sourceColIndex].length - 1].faceUp = true;
                    }
                  }
                }
                
                setTableauCards(newTableauCards);
                setSelectedCard(null);
              }
            }
          }}
        />
      ))}
    </div>
  );
};

export default GameArea;