import React, { useState, useEffect, useRef } from 'react';
import GlobeViewer from './GlobeViewer';
// NewsPanel import removed as we are inlining the custom overlay
import { countryNews } from '../data/mockData';
import { Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getFlagUrl = (iso3) => {
    if (!iso3) return '';
    const map = {
        USA: 'us', GBR: 'gb', JPN: 'jp', BRA: 'br', IND: 'in', RUS: 'ru',
        ZAF: 'za', AUS: 'au', DEU: 'de', FRA: 'fr', CAN: 'ca', CHN: 'cn',
        ITA: 'it', MEX: 'mx', KOR: 'kr', SOM: 'so', NOR: 'no', SWE: 'se',
        FIN: 'fi', DNK: 'dk', ISL: 'is', CHE: 'ch', ESP: 'es', PRT: 'pt',
        NLD: 'nl', BEL: 'be', AUT: 'at', POL: 'pl', UKR: 'ua', TUR: 'tr',
        ISR: 'il', SAU: 'sa', EGY: 'eg', IRN: 'ir', ARE: 'ae', THA: 'th',
        VNM: 'vn', IDN: 'id', MYS: 'my', NGA: 'ng', KEN: 'ke', ZWE: 'zw',
        GRC: 'gr', PHL: 'ph', ESH: 'eh', LBY: 'ly'
    };
    const iso2 = map[iso3] || iso3.slice(0, 2).toLowerCase();
    return `https://flagcdn.com/w160/${iso2}.png`;
};

function GlobeView({ onBackToHome }) {
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [countryName, setCountryName] = useState(null);
    const [showNavbar, setShowNavbar] = useState(false);
    const [showLegend, setShowLegend] = useState(false);
    const lastMouseY = useRef(0);
    const hideTimeoutRef = useRef(null);

    const handleCountrySelect = (isoCode, name) => {
        setSelectedCountry(isoCode);
        setCountryName(name);
    };

    const handleClosePanel = () => {
        setSelectedCountry(null);
        setCountryName(null);
    };

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
                />
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
                                style={{
                                    fontSize: '0.95rem',
                                    fontFamily: '"Roboto", sans-serif',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    cursor: 'pointer',
                                    transition: 'color 0.2s',
                                    fontWeight: '400'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.color = 'white';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.color = 'rgba(255, 255, 255, 0.7)';
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
                            top: 0,
                            left: 0,
                            width: '25vw',
                            height: '100vh',
                            background: 'rgba(20, 20, 35, 0.7)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            borderRadius: 0,
                            zIndex: 999999,
                            pointerEvents: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            padding: '2rem',
                            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 0 50px rgba(0,0,0,0.5)',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            boxSizing: 'border-box'
                        }}>

                        <button
                            onClick={handleClosePanel}
                            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-50 cursor-pointer"
                            style={{ pointerEvents: 'auto' }}
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-start px-2 mt-8">
                            <img
                                src={getFlagUrl(selectedCountry)}
                                alt="flag"
                                className="w-24 h-auto mb-4 border border-white/30 shadow-lg rounded-sm"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '2rem', textAlign: 'left', lineHeight: '1.1', textTransform: 'uppercase' }}>
                                {countryName || selectedCountry}
                            </div>
                            <div className="text-sm text-white/70 mt-2 font-mono">ISO: {selectedCountry}</div>
                        </div>

                        <div className="mt-8 w-full pr-2" style={{ pointerEvents: 'auto' }}>
                            {countryNews[selectedCountry]?.length > 0 ? (
                                <div className="space-y-4 pb-4">
                                    {countryNews[selectedCountry].map(article => (
                                        <div key={article.id} className="bg-black/20 p-4 rounded-lg border border-white/10 hover:bg-black/30 transition-colors group cursor-pointer overflow-hidden">
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors leading-tight">
                                                    {article.title}
                                                </h3>
                                                <div className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/60 shrink-0 whitespace-nowrap">
                                                    {article.source}
                                                </div>
                                            </div>
                                            <p className="text-xs text-white/70 line-clamp-3 leading-relaxed">
                                                {article.summary}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-white/40 text-sm italic text-center mt-10">
                                    No news articles found.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

export default GlobeView;
