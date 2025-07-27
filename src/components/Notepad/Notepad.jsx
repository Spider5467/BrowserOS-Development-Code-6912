import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSave, FiFile, FiTrash2, FiDownload, FiUpload, FiType, FiAlignLeft, FiAlignCenter, FiAlignRight } = FiIcons;

const Notepad = ({ darkMode = false }) => {
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('monospace');
  const [textAlign, setTextAlign] = useState('left');
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [savedNotes, setSavedNotes] = useState([]);
  const [currentFileName, setCurrentFileName] = useState('Untitled');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFileName, setSaveFileName] = useState('');

  // Load saved notes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('browserOS_notepad_notes');
      if (saved) {
        setSavedNotes(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved notes:', error);
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('browserOS_notepad_notes', JSON.stringify(savedNotes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  }, [savedNotes]);

  // Update word and character count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharacterCount(content.length);
  }, [content]);

  const handleSave = () => {
    if (saveFileName.trim() === '') {
      alert('Please enter a filename');
      return;
    }

    const newNote = {
      id: Date.now(),
      name: saveFileName,
      content: content,
      lastModified: new Date().toISOString(),
      fontSize,
      fontFamily,
      textAlign
    };

    const existingIndex = savedNotes.findIndex(note => note.name === saveFileName);
    if (existingIndex !== -1) {
      const updatedNotes = [...savedNotes];
      updatedNotes[existingIndex] = newNote;
      setSavedNotes(updatedNotes);
    } else {
      setSavedNotes([...savedNotes, newNote]);
    }

    setCurrentFileName(saveFileName);
    setShowSaveDialog(false);
    setSaveFileName('');
  };

  const handleLoad = (note) => {
    setContent(note.content);
    setFontSize(note.fontSize || 14);
    setFontFamily(note.fontFamily || 'monospace');
    setTextAlign(note.textAlign || 'left');
    setCurrentFileName(note.name);
  };

  const handleDelete = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setSavedNotes(savedNotes.filter(note => note.id !== noteId));
    }
  };

  const handleNew = () => {
    if (content.trim() !== '' && window.confirm('Are you sure you want to create a new document? Unsaved changes will be lost.')) {
      setContent('');
      setCurrentFileName('Untitled');
      setFontSize(14);
      setFontFamily('monospace');
      setTextAlign('left');
    } else if (content.trim() === '') {
      setContent('');
      setCurrentFileName('Untitled');
    }
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setContent(e.target.result);
        setCurrentFileName(file.name.replace('.txt', ''));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} text-white`}>
      {/* Toolbar */}
      <div className={`p-3 border-b border-gray-700 flex flex-wrap items-center gap-2`}>
        <motion.button
          className={`px-3 py-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-md hover:bg-indigo-600 flex items-center text-sm`}
          onClick={handleNew}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SafeIcon icon={FiFile} className="mr-1" />
          New
        </motion.button>

        <motion.button
          className={`px-3 py-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-md hover:bg-indigo-600 flex items-center text-sm`}
          onClick={() => setShowSaveDialog(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SafeIcon icon={FiSave} className="mr-1" />
          Save
        </motion.button>

        <motion.button
          className={`px-3 py-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-md hover:bg-indigo-600 flex items-center text-sm`}
          onClick={handleExport}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SafeIcon icon={FiDownload} className="mr-1" />
          Export
        </motion.button>

        <label className={`px-3 py-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-md hover:bg-indigo-600 flex items-center text-sm cursor-pointer`}>
          <SafeIcon icon={FiUpload} className="mr-1" />
          Import
          <input
            type="file"
            accept=".txt"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        <div className="flex items-center gap-2 ml-4">
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className={`px-2 py-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-md text-sm`}
          >
            <option value="monospace">Monospace</option>
            <option value="serif">Serif</option>
            <option value="sans-serif">Sans-serif</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>

          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            min="8"
            max="72"
            className={`w-16 px-2 py-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-md text-sm`}
          />

          <div className="flex gap-1">
            <button
              onClick={() => setTextAlign('left')}
              className={`p-1 rounded ${textAlign === 'left' ? 'bg-indigo-600' : `${darkMode ? 'bg-gray-800' : 'bg-gray-700'}`}`}
            >
              <SafeIcon icon={FiAlignLeft} />
            </button>
            <button
              onClick={() => setTextAlign('center')}
              className={`p-1 rounded ${textAlign === 'center' ? 'bg-indigo-600' : `${darkMode ? 'bg-gray-800' : 'bg-gray-700'}`}`}
            >
              <SafeIcon icon={FiAlignCenter} />
            </button>
            <button
              onClick={() => setTextAlign('right')}
              className={`p-1 rounded ${textAlign === 'right' ? 'bg-indigo-600' : `${darkMode ? 'bg-gray-800' : 'bg-gray-700'}`}`}
            >
              <SafeIcon icon={FiAlignRight} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with saved notes */}
        <div className={`w-64 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} border-r border-gray-700 p-3 overflow-y-auto`}>
          <h3 className="text-sm font-medium mb-3 text-gray-300">Saved Notes</h3>
          {savedNotes.length === 0 ? (
            <p className="text-gray-500 text-sm">No saved notes</p>
          ) : (
            <div className="space-y-2">
              {savedNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-600'} rounded-md cursor-pointer hover:bg-indigo-600 group`}
                  onClick={() => handleLoad(note)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{note.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(note.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded"
                    >
                      <SafeIcon icon={FiTrash2} className="text-xs" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing your note here..."
              className={`w-full h-full resize-none outline-none ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} text-white p-4 rounded-md`}
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: fontFamily,
                textAlign: textAlign,
                lineHeight: '1.5'
              }}
            />
          </div>

          {/* Status bar */}
          <div className={`p-2 border-t border-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-xs text-gray-400 flex justify-between`}>
            <span>File: {currentFileName}</span>
            <span>Words: {wordCount} | Characters: {characterCount}</span>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-700'} p-6 rounded-lg shadow-xl w-80`}>
            <h3 className="text-lg font-medium mb-4">Save Note</h3>
            <input
              type="text"
              value={saveFileName}
              onChange={(e) => setSaveFileName(e.target.value)}
              placeholder="Enter filename"
              className={`w-full p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-600'} rounded-md mb-4`}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className={`px-4 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-600'} rounded-md hover:bg-gray-600`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notepad;