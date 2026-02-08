import React, { useState } from 'react';
import ParticleWave from './ParticleWave';



function ChatView({ onEnter, onTopicSelect }) {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const topics = ['Technology', 'Business', 'Sports', 'Entertainment', 'Science'];

    const handleTopicClick = (topic) => {
        setSelectedTopic(topic);

        // Navigate immediately
        if (onTopicSelect) {
            onTopicSelect(topic);
        }
        onEnter();

        // Fetch data in background (non-blocking)
        fetch(`http://localhost:8000/news?query=${encodeURIComponent(topic)}`)
            .then(response => response.json())
            .then(data => {
                // Data will be available for GlobeView to use
                // The new structure is array: [{ title, url, ... }, ...]
                console.log('News loaded for', topic, data);
            })
            .catch(error => {
                console.error('Error fetching news:', error);
            });
    };

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setResponse(null);
        try {
            // Updated to use /news endpoint which now returns a list of articles directly
            const res = await fetch(`http://localhost:8000/news?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            console.log("News results JSON:", data);

            // Format response for display
            // data is now an array: [{ title, url, ... }, ...]
            if (Array.isArray(data) && data.length > 0) {
                const count = data.length;
                setResponse(`Found ${count} articles for "${query}". Top result: ${data[0].title}`);
            } else {
                setResponse(`No articles found for "${query}".`);
            }

        } catch (error) {
            console.error("Error fetching news:", error);
            setResponse("Error connecting to server.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0a0b0f', margin: 0, padding: 0, overflowY: 'auto', position: 'relative' }}>
            {/* Particle Wave Background */}
            <ParticleWave />
            
            {/* Navbar */}
            {/* Navbar */}
            <nav style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '0 0 1rem 1rem',
                padding: '1rem 2rem',
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    fontFamily: '"Moon", sans-serif',
                    color: 'white',
                    flex: '1'
                }}>
                    What's Poppin
                </h1>

                {/* Topic Links - Centered */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '2', justifyContent: 'center' }}>
                    {topics.map((topic, index) => (
                        <React.Fragment key={topic}>
                            <span
                                onClick={() => handleTopicClick(topic)}
                                style={{
                                    fontSize: '0.95rem',
                                    fontFamily: '"Moon", sans-serif',
                                    color: selectedTopic === topic ? '#3B82F6' : '#D1D5DB',
                                    cursor: 'pointer',
                                    transition: 'color 0.2s',
                                    fontWeight: selectedTopic === topic ? '600' : '400'
                                }}
                                onMouseOver={(e) => {
                                    if (selectedTopic !== topic) e.target.style.color = 'white';
                                }}
                                onMouseOut={(e) => {
                                    if (selectedTopic !== topic) e.target.style.color = '#D1D5DB';
                                }}
                            >
                                {topic}
                            </span>
                            {index < topics.length - 1 && (
                                <span style={{ color: '#D1D5DB', fontSize: '0.95rem' }}>/</span>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Globe Button - Right */}
                <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onEnter}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            padding: '0.6rem',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                    </button>
                </div>
            </nav>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '0 2rem',
                marginTop: '-100px'
            }}>
                <h2 style={{
                    fontFamily: '"Moon", sans-serif',
                    fontSize: 'clamp(3rem, 8vw, 11rem)',
                    fontWeight: '300',
                    letterSpacing: '3px',
                    color: 'white',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    textTransform: 'uppercase'
                }}>
                    What's happening today?
                </h2>

                <style>
                    {`
                    @keyframes gradient-move {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    @keyframes liquid-shine {
                        0% { transform: translateX(-150%) skewX(-25deg); }
                        100% { transform: translateX(150%) skewX(-25deg); }
                    }
                    input::placeholder {
                        color: rgba(255, 255, 255, 0.5);
                    }
                    `}
                </style>
                <div style={{
                    width: '100%',
                    maxWidth: '800px',
                    position: 'relative',
                    background: 'linear-gradient(270deg, #3B82F6, #8B5CF6, #EC4899, #3B82F6)',
                    backgroundSize: '200% 200%',
                    padding: '2px',
                    borderRadius: '1.5rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
                    animation: 'gradient-move 3s ease infinite',
                    transform: isFocused ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 10
                }}
                >
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        autoFocus
                        placeholder="Ask about global news, trends, or specific countries..."
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '1.25rem 2rem',
                            paddingRight: '4rem',
                            fontSize: '1.1rem',
                            borderRadius: '1.5rem',
                            border: 'none',
                            backgroundColor: 'rgba(10, 11, 15, 0.8)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            fontFamily: '"Moon", sans-serif',
                            fontWeight: '400',
                            color: 'white'
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            backgroundColor: 'transparent',
                            color: query ? '#3B82F6' : '#64748B',
                            border: 'none',
                            borderRadius: '50%',
                            width: '3rem',
                            height: '3rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.color = query ? '#2563EB' : '#475569';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.color = query ? '#3B82F6' : '#64748B';
                        }}
                    >
                        {loading ? (
                            <div style={{
                                width: '20px',
                                height: '20px',
                                border: '2px solid #3B82F6',
                                borderTop: '2px solid transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        )}
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </button>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['Latest Global Headlines', 'Tech Trends in Japan', 'Sports updates in UK', 'Economy in US'].map((hint) => (
                        <button key={hint} style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#1F2937',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontFamily: '"Moon", sans-serif',
                            color: '#D1D5DB',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 5px rgba(255,255,255,0.05)'
                        }}
                            onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.color = '#D1D5DB';
                            }}
                        >
                            {hint}
                        </button>
                    ))}
                </div>

                {/* Response Area */}
                {response && (
                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        backgroundColor: '#1F2937',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px -1px rgba(255, 255, 255, 0.1)',
                        maxWidth: '800px',
                        width: '100%',
                        animation: 'fadeIn 0.5s ease-out'
                    }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1.1rem' }}>Fuzzy Search Result:</h3>
                        <p style={{ margin: 0, color: '#D1D5DB', lineHeight: '1.5' }}>{response}</p>
                    </div>
                )}
                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>

                {/* News Ticker */}
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', // Darkish blue (slate-900)
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    zIndex: 1000,
                    boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
                    whiteSpace: 'nowrap', // Ensure single line
                    overflow: 'hidden',
                    padding: '1.5rem 0' // Increased padding for wider look
                }}>
                    <style>
                        {`
                        @keyframes ticker-scroll {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); }
                        }
                        `}
                    </style>
                    <div style={{
                        display: 'inline-block',
                        animation: 'ticker-scroll 60s linear infinite',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '1rem',
                        fontFamily: '"Moon", sans-serif',
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                    }}>
                        {/* Duplicate content for seamless loop */}
                        <span>BREAKING: Global markets rally as tech sector surges | UN announces new climate initiative for 2030 | Japan introduces new high-speed rail network | UK sports update: Premier League finals set for next week | US Economy shows strong growth in Q3 | New AI regulations proposed by EU commission | Space tourism flights fully booked for 2026 | </span>
                        <span>BREAKING: Global markets rally as tech sector surges | UN announces new climate initiative for 2030 | Japan introduces new high-speed rail network | UK sports update: Premier League finals set for next week | US Economy shows strong growth in Q3 | New AI regulations proposed by EU commission | Space tourism flights fully booked for 2026 | </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatView;
