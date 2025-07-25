import React, { createContext, useContext, useState } from 'react';

// Create a context for drag and drop functionality
const DndContext = createContext({
  draggingItem: null,
  setDraggingItem: () => {},
});

// Provider component that will wrap the game area
export const DndProvider = ({ children }) => {
  const [draggingItem, setDraggingItem] = useState(null);
  
  return (
    <DndContext.Provider value={{ draggingItem, setDraggingItem }}>
      {children}
    </DndContext.Provider>
  );
};

// Hook to access the context
export const useDnd = () => useContext(DndContext);

export default DndProvider;