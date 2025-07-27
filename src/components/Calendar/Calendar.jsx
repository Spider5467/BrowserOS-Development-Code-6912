import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiChevronLeft, FiChevronRight, FiPlus, FiTrash2, FiClock } = FiIcons;

const Calendar = ({ darkMode = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [newEvent, setNewEvent] = useState('');
  const [showAddEvent, setShowAddEvent] = useState(false);
  
  // Load events from localStorage
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem('browserOS_calendar_events');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
    } catch (error) {
      console.error('Error loading calendar events:', error);
    }
  }, []);
  
  // Save events to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('browserOS_calendar_events', JSON.stringify(events));
    } catch (error) {
      console.error('Error saving calendar events:', error);
    }
  }, [events]);
  
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };
  
  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };
  
  const addEvent = () => {
    if (newEvent.trim() === '') return;
    
    const dateKey = formatDateKey(selectedDate);
    const updatedEvents = { ...events };
    
    if (!updatedEvents[dateKey]) {
      updatedEvents[dateKey] = [];
    }
    
    updatedEvents[dateKey].push({
      id: Date.now(),
      title: newEvent,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    
    setEvents(updatedEvents);
    setNewEvent('');
    setShowAddEvent(false);
  };
  
  const removeEvent = (dateKey, eventId) => {
    const updatedEvents = { ...events };
    updatedEvents[dateKey] = updatedEvents[dateKey].filter(event => event.id !== eventId);
    
    if (updatedEvents[dateKey].length === 0) {
      delete updatedEvents[dateKey];
    }
    
    setEvents(updatedEvents);
  };
  
  // Calendar grid generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const selectedDateKey = formatDateKey(selectedDate);
  const todayKey = formatDateKey(new Date());
  
  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-10 sm:h-14"></div>);
  }
  
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = formatDateKey(date);
    const isSelected = dateKey === selectedDateKey;
    const isToday = dateKey === todayKey;
    const hasEvents = events[dateKey] && events[dateKey].length > 0;
    
    calendarDays.push(
      <motion.div
        key={day}
        className={`h-10 sm:h-14 flex flex-col items-center justify-center rounded-lg cursor-pointer relative
          ${isSelected ? 'bg-indigo-600' : isToday ? `${darkMode ? 'bg-gray-700' : 'bg-gray-700'}` : 'hover:bg-gray-700'}`}
        onClick={() => handleDateClick(day)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className={`text-sm sm:text-base ${isSelected ? 'font-bold' : ''}`}>{day}</span>
        {hasEvents && (
          <div className="absolute bottom-1 w-1 h-1 rounded-full bg-green-500"></div>
        )}
      </motion.div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} text-white p-4`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{monthName} {year}</h2>
        <div className="flex items-center space-x-2">
          <motion.button
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} hover:bg-gray-700`}
            onClick={goToPreviousMonth}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SafeIcon icon={FiChevronLeft} />
          </motion.button>
          <motion.button
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} hover:bg-gray-700`}
            onClick={() => setCurrentDate(new Date())}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Today
          </motion.button>
          <motion.button
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} hover:bg-gray-700`}
            onClick={goToNextMonth}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SafeIcon icon={FiChevronRight} />
          </motion.button>
        </div>
      </div>
      
      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-gray-400 text-sm font-medium">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4 flex-shrink-0">
        {calendarDays}
      </div>
      
      {/* Events for Selected Date */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          <motion.button
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} hover:bg-indigo-600`}
            onClick={() => setShowAddEvent(!showAddEvent)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SafeIcon icon={FiPlus} />
          </motion.button>
        </div>
        
        {showAddEvent && (
          <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-lg mb-4`}>
            <input
              type="text"
              className={`w-full p-2 rounded-md mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-600'} text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder="Event title..."
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEvent()}
            />
            <div className="flex justify-end">
              <motion.button
                className="px-4 py-2 bg-indigo-600 rounded-md text-white"
                onClick={addEvent}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add Event
              </motion.button>
            </div>
          </div>
        )}
        
        {events[selectedDateKey] && events[selectedDateKey].length > 0 ? (
          <div>
            {events[selectedDateKey].map(event => (
              <motion.div
                key={event.id}
                className={`p-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-lg mb-2 flex items-center justify-between`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center">
                  <div className="w-1 h-10 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-400 flex items-center">
                      <SafeIcon icon={FiClock} className="mr-1" />
                      {event.time}
                    </p>
                  </div>
                </div>
                <motion.button
                  className="p-2 text-gray-400 hover:text-red-500"
                  onClick={() => removeEvent(selectedDateKey, event.id)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SafeIcon icon={FiTrash2} />
                </motion.button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <p>No events for this day</p>
            <button
              className="mt-2 text-indigo-400 hover:underline"
              onClick={() => setShowAddEvent(true)}
            >
              Add an event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;