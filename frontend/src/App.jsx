import React, { useState } from 'react';
import ChatView from './components/ChatView';
import GlobeView from './components/GlobeView';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'globe'
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearchError, setIsSearchError] = useState(false);

  const handleEnterGlobe = () => {
    setCurrentView('globe');
  };

  const handleBackToHome = () => {
    setCurrentView('chat');
    setSelectedTopic(null);
    setFilteredNews([]);
    setIsSearchError(false);
  };

  /* 
    Enhanced handler that:
    1. Sets topic/query & loading state immediately
    2. Switches to Globe view immediately
    3. Fetches data in background
  */
  const handleSearchOrTopic = (query) => {
    setSelectedTopic(query);
    setLoading(true);
    setCurrentView('globe'); // Immediate switch
    setIsSearchError(false); // Reset error state

    const startTime = Date.now();

    fetch(`http://localhost:8000/news?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, 1500 - elapsedTime);

                setTimeout(() => {
                    if (data && data.length > 0) {
                        setFilteredNews(data);
                        setIsSearchError(false);
                    } else {
                        setFilteredNews([]);
                        setIsSearchError(true);
                    }
                    setLoading(false);
                }, remainingTime);
            })
            .catch(error => {
                console.error('Error fetching news:', error);
                setLoading(false);
                // Optional: set isSearchError(true) on network error too? 
                // For now, let's assume empty data is result of valid query with 0 hits.
                setIsSearchError(true);
            });
  };

  return (
    <div className="w-full h-screen bg-[#000011] text-white overflow-hidden">
      <AnimatePresence mode="wait">
        {currentView === 'chat' ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <ChatView 
              onEnter={handleEnterGlobe} 
              onTopicSelect={handleSearchOrTopic}
              onSearch={handleSearchOrTopic} // Pass search handler
              selectedTopic={selectedTopic}
            />
          </motion.div>
        ) : (
          <motion.div
            key="globe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <GlobeView
              onBackToHome={handleBackToHome}
              selectedTopic={selectedTopic}
              onTopicChange={handleSearchOrTopic}
              filteredNews={filteredNews}
              loading={loading}
              setLoading={setLoading}
              isSearchError={isSearchError}
              setIsSearchError={setIsSearchError}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
