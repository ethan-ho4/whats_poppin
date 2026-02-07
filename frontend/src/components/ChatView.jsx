import React, { useState, useEffect, useRef } from 'react';

function ChatView({ onEnter }) {
    // Navbar is always visible now
    const [isTopicsOpen, setIsTopicsOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState('Topics');
    const topics = ['Technology', 'Politics', 'Business', 'Sports', 'Entertainment', 'Health', 'Science'];
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsTopicsOpen(false);
            }
        };

        if (isTopicsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isTopicsOpen]);

    return (
        <div style={{ width: '100vw', height: '100vh', backgroundColor: '#F3F4F6', margin: 0, padding: 0, overflowY: 'auto' }}>
            {/* Navbar */}
            {/* Navbar */}
            <nav style={{
                width: '100%',
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
                borderBottom: '1px solid #D1D5DB', // Slightly lighter line to partition navbar
                // Removed background and glass effect
            }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#1F2937'
                }}>
                    What's Poppin
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Custom Topics Dropdown */}
                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setIsTopicsOpen(!isTopicsOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem 0.75rem',
                                fontSize: '1rem',
                                borderRadius: '9999px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#1F2937',
                                fontFamily: '"Roboto", sans-serif',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {selectedTopic}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        {isTopicsOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                minWidth: '150px',
                                backgroundColor: 'white',
                                borderRadius: '1rem',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                                overflow: 'hidden',
                                zIndex: 1001
                            }}>
                                {topics.map((topic) => (
                                    <div
                                        key={topic}
                                        onClick={() => {
                                            setSelectedTopic(topic);
                                            setIsTopicsOpen(false);
                                        }}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            cursor: 'pointer',
                                            fontFamily: '"Roboto", sans-serif',
                                            fontSize: '0.9rem',
                                            color: selectedTopic === topic ? '#3B82F6' : '#1F2937',
                                            backgroundColor: selectedTopic === topic ? '#EFF6FF' : 'transparent',
                                            transition: 'all 0.15s'
                                        }}
                                        onMouseOver={(e) => {
                                            if (selectedTopic !== topic) e.target.style.backgroundColor = '#F3F4F6';
                                        }}
                                        onMouseOut={(e) => {
                                            if (selectedTopic !== topic) e.target.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        {topic}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onEnter}
                        style={{
                            backgroundColor: 'white',
                            color: 'black',
                            border: 'none',
                            padding: '0.5rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#e5e7eb';
                            e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        Globe
                    </button>
                </div>
            </nav>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '0 2rem'
            }}>
                <h2 style={{
                    fontFamily: '"Oswald", sans-serif',
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    color: '#1F2937',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    textTransform: 'uppercase' // News headlines are often uppercase
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
                    `}
                </style>
                <div style={{
                    width: '100%',
                    maxWidth: '800px',
                    position: 'relative',
                    background: 'linear-gradient(270deg, #3B82F6, #8B5CF6, #EC4899, #3B82F6)',
                    backgroundSize: '200% 200%',
                    padding: '2px',
                    borderRadius: '9999px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    animation: 'gradient-move 3s ease infinite',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden' // Ensure shine stays inside
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 30px -5px rgba(59, 130, 246, 0.2), 0 8px 10px -6px rgba(59, 130, 246, 0.2)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
                }}
                >
                    <input
                        type="text"
                        placeholder="Ask about global news, trends, or specific countries..."
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '1.25rem 2rem',
                            paddingRight: '4rem',
                            fontSize: '1.1rem',
                            borderRadius: '9999px',
                            border: 'none',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            fontFamily: '"Roboto", sans-serif',
                            fontWeight: '400'
                        }}
                    />
                    <button style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'transparent',
                        color: '#64748B',
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
                            e.target.style.color = '#475569';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.color = '#64748B';
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['Latest Global Headlines', 'Tech Trends in Japan', 'Sports updates in UK', 'Economy in US'].map((hint) => (
                        <button key={hint} style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: 'white',
                            border: '1px solid rgba(0,0,0,0.05)',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            color: '#6B7280',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.color = '#64748B';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.color = '#6B7280';
                        }}
                        >
                            {hint}
                        </button>
                    ))}
                </div>

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
                            0% { transform: translateX(100%); }
                            100% { transform: translateX(-100%); }
                        }
                        `}
                    </style>
                    <div style={{
                        display: 'inline-block',
                        animation: 'ticker-scroll 90s linear infinite',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '1.rem',
                        fontFamily: '"Oswald", sans-serif',
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                    }}>
                        BREAKING: Global markets rally as tech sector surges | UN announces new climate initiative for 2030 | Japan introduces new high-speed rail network | UK sports update: Premier League finals set for next week | US Economy shows strong growth in Q3 | New AI regulations proposed by EU commission | Space tourism flights fully booked for 2026 | 
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatView;
