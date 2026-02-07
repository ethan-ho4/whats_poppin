import React, { useState } from 'react';
import ChatView from './components/ChatView';
import GlobeView from './components/GlobeView';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'globe'
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [filteredNews, setFilteredNews] = useState([]);

  const handleEnterGlobe = () => {
    setCurrentView('globe');
  };

  const handleBackToHome = () => {
    setCurrentView('chat');
    setSelectedTopic(null);
    setFilteredNews([]);
  };

  const handleTopicSelect = (topic, newsData) => {
    setSelectedTopic(topic);
    setFilteredNews(newsData);
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
          <ChatView onEnter={handleEnterGlobe} onTopicSelect={handleTopicSelect} />
        </motion.div>
      ) : (
        <motion.div
          key="globe"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlobeView 
            onBackToHome={handleBackToHome} 
            selectedTopic={selectedTopic}
            filteredNews={filteredNews}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;

