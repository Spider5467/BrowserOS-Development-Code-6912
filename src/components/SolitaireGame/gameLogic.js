// Initialize a standard deck of cards
export const initializeDeck = () => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  let deck = [];

  // Create deck
  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push({
        suit, 
        rank, 
        color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black'
      });
    });
  });

  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

// Deal initial cards to the tableau
export const dealInitialCards = (deck) => {
  const newTableauCards = [[], [], [], [], [], [], []];
  let deckIndex = 0;

  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = {
        ...deck[deckIndex],
        faceUp: row === col, // Only the top card is face up
        source: 'tableau',
        columnIndex: col
      };
      newTableauCards[col].push(card);
      deckIndex++;
    }
  }

  return { newTableauCards, deckIndex };
};

// Check if a move to foundation is valid
export const isValidFoundationMove = (card, foundation) => {
  if (!card) return false;
  
  const { suit, rank } = card;
  const foundationSuit = foundation.length > 0 ? foundation[0].suit : null;
  
  // If foundation is empty, only Ace can be placed
  if (foundation.length === 0) {
    return rank === 'A';
  }
  
  // Card must match the foundation suit
  if (suit !== foundationSuit) {
    return false;
  }
  
  // Card must be one rank higher than the top card
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const topCard = foundation[foundation.length - 1];
  const topRankIndex = ranks.indexOf(topCard.rank);
  const cardRankIndex = ranks.indexOf(rank);
  
  return cardRankIndex === topRankIndex + 1;
};

// Check if a move to tableau is valid
export const isValidTableauMove = (card, tableau) => {
  // If tableau is empty, only King can be placed
  if (tableau.length === 0) {
    return card.rank === 'K';
  }
  
  const topCard = tableau[tableau.length - 1];
  
  // Card must be one rank lower and opposite color
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const topRankIndex = ranks.indexOf(topCard.rank);
  const cardRankIndex = ranks.indexOf(card.rank);
  
  const topColor = topCard.suit === 'hearts' || topCard.suit === 'diamonds' ? 'red' : 'black';
  const cardColor = card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black';
  
  return cardRankIndex === topRankIndex - 1 && cardColor !== topColor;
};