import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DndProvider } from './DragAndDrop';
import GameArea from './GameArea';
import GameControls from './GameControls';
import { initializeDeck, dealInitialCards } from './gameLogic';

const SolitaireGame = () => {
  const [deck, setDeck] = useState([]);
  const [stockIndex, setStockIndex] = useState(28);
  const [tableauCards, setTableauCards] = useState([[], [], [], [], [], [], []]);
  const [foundationCards, setFoundationCards] = useState([[], [], [], []]);
  const [wasteCards, setWasteCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  
  useEffect(() => {
    startNewGame();
  }, []);
  
  const startNewGame = () => {
    const newDeck = initializeDeck();
    setDeck(newDeck);
    setStockIndex(28);
    setWasteCards([]);
    setSelectedCard(null);
    
    const { newTableauCards } = dealInitialCards(newDeck);
    setTableauCards(newTableauCards);
    setFoundationCards([[], [], [], []]);
  };
  
  const dealCard = () => {
    if (stockIndex < deck.length) {
      // Deal a card from stock to waste
      const card = deck[stockIndex];
      setWasteCards([...wasteCards, {...card, faceUp: true}]);
      setStockIndex(stockIndex + 1);
    } else if (wasteCards.length > 0) {
      // Reshuffle waste back to stock
      setWasteCards([]);
      setStockIndex(28);
    }
  };
  
  const autoComplete = () => {
    alert('Auto-complete feature coming soon! For now, try to move all cards to the foundation piles.');
  };

  return (
    <div className="h-full bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 p-5 overflow-auto">
      <div className="text-center text-white bg-white bg-opacity-10 p-3 rounded-lg backdrop-filter backdrop-blur-sm mb-4">
        <strong>Klondike Solitaire</strong> - Build foundations from Ace to King by suit. Drag cards to move them!
      </div>
      
      <GameControls 
        onNewGame={startNewGame} 
        onDealCard={dealCard} 
        onAutoComplete={autoComplete}
      />
      
      <DndProvider>
        <GameArea
          deck={deck}
          stockIndex={stockIndex}
          setStockIndex={setStockIndex} // Pass this prop to GameArea
          tableauCards={tableauCards}
          setTableauCards={setTableauCards}
          foundationCards={foundationCards}
          setFoundationCards={setFoundationCards}
          wasteCards={wasteCards}
          setWasteCards={setWasteCards}
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
        />
      </DndProvider>
    </div>
  );
};

export default SolitaireGame;