import React, { useState } from 'react';
import ChatView from './components/ChatView';
import GlobeView from './components/GlobeView';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'globe'

  const handleEnterGlobe = () => {
    setCurrentView('globe');
  };

  const handleBackToHome = () => {
    setCurrentView('chat');
  };

  return (
    <AnimatePresence mode="wait">
      {currentView === 'chat' ? (
        <motion.div
          key="chat"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ChatView onEnter={handleEnterGlobe} />
        </motion.div>
      ) : (
        <motion.div
          key="globe"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlobeView onBackToHome={handleBackToHome} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
