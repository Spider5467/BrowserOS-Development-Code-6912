import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const CommandPrompt = () => {
  const [commandHistory, setCommandHistory] = useState([
    { type: 'system', text: 'BrowserOS Command Line [Version 1.0.0]' },
    { type: 'system', text: '(c) BrowserOS Corporation. All rights reserved.' },
    { type: 'system', text: '' }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [userCommands, setUserCommands] = useState([]);
  
  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  
  // Scroll to bottom whenever command history updates
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);
  
  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const getCurrentDirectory = () => {
    return "C:\\Users\\Guest>";
  };
  
  const executeCommand = (command) => {
    // Add the command to history
    const newCommandHistory = [
      ...commandHistory,
      { type: 'command', text: `${getCurrentDirectory()} ${command}` }
    ];
    
    // Store user command for history navigation
    const newUserCommands = [...userCommands, command];
    setUserCommands(newUserCommands);
    
    // Process the command
    const commandLower = command.toLowerCase().trim();
    const parts = commandLower.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);
    
    // Command processor
    switch (cmd) {
      case 'help':
        newCommandHistory.push(
          { type: 'output', text: 'Available commands:' },
          { type: 'output', text: 'help     - Display this help message' },
          { type: 'output', text: 'echo     - Display a message' },
          { type: 'output', text: 'cls      - Clear the screen' },
          { type: 'output', text: 'dir      - List directory contents' },
          { type: 'output', text: 'cd       - Change directory' },
          { type: 'output', text: 'date     - Display current date' },
          { type: 'output', text: 'time     - Display current time' },
          { type: 'output', text: 'ver      - Display OS version' },
          { type: 'output', text: 'exit     - Close the command prompt' },
          { type: 'output', text: '' }
        );
        break;
        
      case 'echo':
        const message = command.substring(5);
        newCommandHistory.push(
          { type: 'output', text: message || '' },
          { type: 'output', text: '' }
        );
        break;
        
      case 'cls':
        setCommandHistory([
          { type: 'system', text: 'BrowserOS Command Line [Version 1.0.0]' },
          { type: 'system', text: '(c) BrowserOS Corporation. All rights reserved.' },
          { type: 'system', text: '' }
        ]);
        return; // Skip adding the command to history
        
      case 'dir':
        newCommandHistory.push(
          { type: 'output', text: ' Directory of C:\\Users\\Guest' },
          { type: 'output', text: '' },
          { type: 'output', text: '05/15/2023  10:30 AM    <DIR>          Documents' },
          { type: 'output', text: '05/15/2023  10:30 AM    <DIR>          Downloads' },
          { type: 'output', text: '05/15/2023  10:30 AM    <DIR>          Pictures' },
          { type: 'output', text: '05/15/2023  10:30 AM    <DIR>          Music' },
          { type: 'output', text: '06/20/2023  03:45 PM             8,192 notes.txt' },
          { type: 'output', text: '' },
          { type: 'output', text: '               1 File(s)          8,192 bytes' },
          { type: 'output', text: '               4 Dir(s)   1,055,621,120 bytes free' },
          { type: 'output', text: '' }
        );
        break;
        
      case 'cd':
        if (args.length === 0) {
          newCommandHistory.push(
            { type: 'output', text: 'C:\\Users\\Guest' },
            { type: 'output', text: '' }
          );
        } else {
          newCommandHistory.push(
            { type: 'output', text: `The system cannot find the path specified: ${args.join(' ')}` },
            { type: 'output', text: '' }
          );
        }
        break;
        
      case 'date':
        newCommandHistory.push(
          { type: 'output', text: `The current date is: ${new Date().toLocaleDateString()}` },
          { type: 'output', text: '' }
        );
        break;
        
      case 'time':
        newCommandHistory.push(
          { type: 'output', text: `The current time is: ${new Date().toLocaleTimeString()}` },
          { type: 'output', text: '' }
        );
        break;
        
      case 'ver':
        newCommandHistory.push(
          { type: 'output', text: 'BrowserOS [Version 1.0.0]' },
          { type: 'output', text: '' }
        );
        break;
        
      case 'exit':
        // This would be handled by the parent component
        newCommandHistory.push(
          { type: 'output', text: 'Exiting command prompt...' },
          { type: 'output', text: '' }
        );
        break;
        
      case '':
        // Just add a new line for empty command
        newCommandHistory.push({ type: 'output', text: '' });
        break;
        
      default:
        newCommandHistory.push(
          { type: 'output', text: `'${cmd}' is not recognized as an internal or external command, operable program or batch file.` },
          { type: 'output', text: '' }
        );
        break;
    }
    
    setCommandHistory(newCommandHistory);
    setCurrentCommand('');
    setHistoryIndex(-1);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (userCommands.length > 0) {
        const newIndex = historyIndex < userCommands.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCurrentCommand(userCommands[userCommands.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(userCommands[userCommands.length - 1 - newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    }
  };

  return (
    <div 
      className="h-full flex flex-col bg-black text-white font-mono p-1 overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-2 whitespace-pre-wrap"
      >
        {commandHistory.map((entry, index) => (
          <div key={index} className={entry.type === 'command' ? 'text-green-400' : entry.type === 'system' ? 'text-blue-300' : 'text-white'}>
            {entry.text}
          </div>
        ))}
        <div className="flex">
          <span className="text-green-400">{getCurrentDirectory()}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none border-none text-white ml-1 caret-white"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default CommandPrompt;