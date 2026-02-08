import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, MapPin, Globe, LayoutGrid, X, MessageSquare, Menu, Terminal, Layers, Info } from 'lucide-react';
import GlobeViewer from './GlobeViewer';
import ChatView from './ChatView';
import { fipsToIso3 } from '../utils/countryMapping';




const NewsCard = ({ article }) => {
    // For now, we use a placeholder logic since backend scraping is disconnected
    // If article already has image_url (from CSV or DB), we use it. 
    // Otherwise, we show a themed placeholder based on the article title/topic.
    const [imageUrl, setImageUrl] = useState(article.image_url || null);
    const [loadingImage, setLoadingImage] = useState(!article.image_url);

    useEffect(() => {
        if (article.image_url) return;

        // Simulating a lazy load for the placeholder to'test' shimmer UI
        const timer = setTimeout(() => {
            // Using a high-quality random news-related image as a temporary placeholder
            const randomId = Math.floor(Math.random() * 1000);
            setImageUrl(`https://picsum.photos/seed/${randomId}/400/200`);
            setLoadingImage(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [article.url, article.image_url]);

    return (
        <div
            className="bg-white/5 hover:bg-white/10 transition-all duration-300 group cursor-pointer w-full"
            style={{
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                marginBottom: '1.25rem',
                boxSizing: 'border-box',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onClick={() => article.url && window.open(article.url, '_blank')}
        >
            {/* Image Section */}
            <div style={{ width: '100%', height: '140px', position: 'relative', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                {loadingImage ? (
                    <div className="shimmer" style={{ width: '100%', height: '100%' }} />
                ) : imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        className="group-hover:scale-110"
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                        <Globe size={32} />
                    </div>
                )}
                {/* Visual Polish: Bottom Gradient for text contrast */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }} />
            </div>

            {/* Content Section */}
            <div style={{ padding: '1rem 1.25rem' }}>
                <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        textDecoration: 'none',
                        color: 'rgba(255, 255, 255, 0.95)',
                        transition: 'color 0.2s ease-in-out',
                        display: 'block'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)'}
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-sm font-bold leading-tight mb-2 tracking-tight">
                        {article.title}
                    </h3>
                </a>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <div style={{
                        fontSize: '0.7rem',
                        color: 'rgba(255,255,255,0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <Terminal size={10} />
                        {article.url ? new URL(article.url).hostname.replace('www.', '') : 'News Source'}
                    </div>
                </div>
            </div>
        </div>
    );
};

function GlobeView({ onBackToHome, selectedTopic: initialTopic, filteredNews: initialNews }) {
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [countryName, setCountryName] = useState(null);
    const [showNavbar, setShowNavbar] = useState(false);
    const [showLegend, setShowLegend] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(initialTopic || null);
    const [activeNewsPoints, setActiveNewsPoints] = useState([]);
    const [searchQuery, setSearchQuery] = useState(initialTopic || null);
    const [totalNewsResults, setTotalNewsResults] = useState(initialNews ? initialNews.length : 0);
    const [renderedPointsCount, setRenderedPointsCount] = useState(0);
    const lastMouseY = useRef(0);
    const hideTimeoutRef = useRef(null);

    const handleTopicClick = (topic) => {
        setSelectedTopic(topic);
        setSearchQuery(topic);

        // Fetch news with topic filter
        fetch(`http://localhost:8000/news?query=${encodeURIComponent(topic)}`)
            .then(response => response.json())
            .then(newsData => {
                console.log('News loaded for', topic, newsData);
                // Filter articles that have valid coordinates for the globe
                const points = newsData.filter(article => article.lat && (article.lon || article.lng));
                setTotalNewsResults(newsData.length);
                setActiveNewsPoints(points);
                setRenderedPointsCount(0); // Reset rendered count
            })
            .catch(error => {
                console.error('Error fetching news:', error);
            });
    };

    const handleCountrySelect = (isoCode, name) => {
        setSelectedCountry(isoCode);
        setCountryName(name);
    };

    const handleClosePanel = () => {
        setSelectedCountry(null);
        setCountryName(null);
    };

    // Sync with initial props if they change (e.g., coming from ChatView)
    useEffect(() => {
        if (initialTopic) {
            setSelectedTopic(initialTopic);
            setSearchQuery(initialTopic);
        }
        if (initialNews) {
            setTotalNewsResults(initialNews.length);
            const points = initialNews.filter(article => article.lat && (article.lon || article.lng));
            setActiveNewsPoints(points);
        }
    }, [initialTopic, initialNews]);

    // Show navbar when component mounts (during view switch)
    useEffect(() => {
        setShowNavbar(true);

        // Hide after 3 seconds
        const timeout = setTimeout(() => {
            setShowNavbar(false);
        }, 3000);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const currentY = e.clientY;

            // Show navbar if mouse moves upward or is near the top
            if (currentY < lastMouseY.current || currentY < 100) {
                setShowNavbar(true);

                // Clear existing timeout
                if (hideTimeoutRef.current) {
                    clearTimeout(hideTimeoutRef.current);
                }

                // Set new timeout to hide navbar after 3 seconds
                hideTimeoutRef.current = setTimeout(() => {
                    setShowNavbar(false);
                }, 3000);
            }

            lastMouseY.current = currentY;
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000011', margin: 0, padding: 0, position: 'relative', overflow: 'hidden' }}>

            {/* Globe Container */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <GlobeViewer
                    onCountrySelect={handleCountrySelect}
                    selectedCountry={selectedCountry}
                    dynamicPoints={activeNewsPoints}
                    onPointsRendered={setRenderedPointsCount}
                />
            </div>

            {/* Right Side UI Container (Status Panel & Info Button) */}
            <div
                style={{
                    position: 'fixed',
                    top: showNavbar ? '5.5rem' : '1.5rem',
                    right: '2rem',
                    zIndex: 900,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '1rem',
                    transition: 'top 0.3s ease-in-out',
                }}
            >
                {/* Search Status Panel */}
                <AnimatePresence>
                    {searchQuery && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                backdropFilter: 'blur(20px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '12px',
                                padding: '1rem 1.5rem',
                                color: 'white',
                                minWidth: '250px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                pointerEvents: 'auto'
                            }}
                        >
                            <div style={{ marginBottom: '0.75rem' }}>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '0.25rem'
                                }}>
                                    Searching
                                </div>
                                <div style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    color: '#FFFFFF'
                                }}>
                                    {searchQuery}
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                paddingTop: '0.75rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                                        Total Results
                                    </span>
                                    <span style={{
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        color: '#60A5FA'
                                    }}>
                                        {totalNewsResults}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                                        Rendered
                                    </span>
                                    <span style={{
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        color: '#34D399'
                                    }}>
                                        {renderedPointsCount} / {activeNewsPoints.length}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Info Button Container */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'row-reverse',
                        gap: '1rem',
                    }}
                    onMouseEnter={() => setShowLegend(true)}
                    onMouseLeave={() => setShowLegend(false)}
                >
                    <button
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            padding: '0.8rem',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s, transform 0.2s',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                        aria-label="Information"
                    >
                        <Info size={24} />
                    </button>

                    <AnimatePresence>
                        {showLegend && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '0.8rem 1rem',
                                    color: 'white',
                                    fontSize: '0.85rem',
                                    whiteSpace: 'nowrap',
                                    pointerEvents: 'none',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>C</span>
                                        <span>Center on Location</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>S</span>
                                        <span>Toggle Spin</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>A</span>
                                        <span>Ascend to Space</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Navbar */}
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
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
                transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
                transition: 'transform 0.3s ease-in-out',
                zIndex: 1000,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    flex: '1'
                }}>
                    What's Poppin
                </h1>

                {/* Topic Links - Centered */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '2', justifyContent: 'center' }}>
                    {['Technology', 'Business', 'Sports', 'Entertainment', 'Science'].map((topic, index, arr) => (
                        <React.Fragment key={topic}>
                            <span
                                onClick={() => handleTopicClick(topic)}
                                style={{
                                    fontSize: '0.95rem',
                                    fontFamily: '"Roboto", sans-serif',
                                    color: selectedTopic === topic ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                                    cursor: 'pointer',
                                    transition: 'color 0.2s',
                                    fontWeight: selectedTopic === topic ? '600' : '400'
                                }}
                                onMouseOver={(e) => {
                                    if (selectedTopic !== topic) e.target.style.color = 'white';
                                }}
                                onMouseOut={(e) => {
                                    if (selectedTopic !== topic) e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                                }}
                            >
                                {topic}
                            </span>
                            {index < arr.length - 1 && (
                                <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.95rem' }}>/</span>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Search Button - Right */}
                <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onBackToHome}
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
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Dynamic Info Button Container */}
            <div
                style={{
                    position: 'fixed',
                    top: showNavbar ? '5.5rem' : '1.5rem',
                    right: '2rem',
                    zIndex: 900,
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row-reverse',
                    gap: '1rem',
                    transition: 'top 0.3s ease-in-out',
                }}
                onMouseEnter={() => setShowLegend(true)}
                onMouseLeave={() => setShowLegend(false)}
            >
                <button
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '50%',
                        padding: '0.8rem',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s, transform 0.2s',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                    aria-label="Information"
                >
                    <Info size={24} />
                </button>

                <AnimatePresence>
                    {showLegend && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                padding: '0.8rem 1rem',
                                color: 'white',
                                fontSize: '0.85rem',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none', // Allow clicking through if needed, though mostly informational
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>C</span>
                                    <span>Center on Location</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>S</span>
                                    <span>Toggle Spin</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>A</span>
                                    <span>Ascend to Space</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Branding */}
            <div style={{
                position: 'fixed',
                bottom: '1rem',
                right: '1.5rem',
                zIndex: 100,
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.85rem',
                fontFamily: '"Roboto", sans-serif',
                letterSpacing: '2px',
                textTransform: 'uppercase'
            }}>
                What's Poppin © 2026
            </div>

            {/* Custom Overlay Panel */}
            <AnimatePresence>
                {selectedCountry && (
                    <motion.div
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: '0%', opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 120 }}
                        className="custom-scrollbar"
                        style={{
                            position: 'fixed',
                            top: '70px',
                            left: 0,
                            width: '25vw',
                            height: 'calc(100vh - 70px)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            borderRadius: '0 1.5rem 1.5rem 0',
                            zIndex: 50,
                            pointerEvents: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            borderRight: '1px solid rgba(255, 255, 255, 0.5)',
                            borderTop: '1px solid rgba(255, 255, 255, 0.5)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
                            boxShadow: '0 0 50px rgba(0,0,0,0.5)',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            boxSizing: 'border-box',
                            padding: '2rem'
                        }}>

                        <button
                            onClick={handleClosePanel}
                            className="p-2 text-white/70 hover:text-white transition-colors z-50 cursor-pointer"
                            style={{
                                pointerEvents: 'auto',
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                color: 'white'
                            }}
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-start px-2 mt-8">

                            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '2rem', textAlign: 'left', lineHeight: '1.1', textTransform: 'uppercase' }}>
                                {countryName || selectedCountry}
                            </div>
                        </div>

                        <div className="w-full pr-2" style={{ pointerEvents: 'auto', marginTop: '1.5rem' }}>
                            {(() => {
                                const displayNews = activeNewsPoints.filter(article => {
                                    const mappedIso = fipsToIso3[article.country_code];
                                    return mappedIso === selectedCountry ||
                                        article.country_code === selectedCountry ||
                                        article.country?.toLowerCase().includes(countryName?.toLowerCase());
                                });

                                return displayNews.length > 0 ? (
                                    <div className="pb-6 w-full">
                                        {displayNews.map(article => (
                                            <NewsCard key={article.id} article={article} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-white/40 text-sm italic text-center mt-10">
                                        No news articles found for this location.
                                    </div>
                                );
                            })()}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

export default GlobeView;
