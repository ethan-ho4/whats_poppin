import React, { useState, useEffect, useRef } from 'react';
import GlobeViewer from './GlobeViewer';
import NewsPanel from './NewsPanel';
import { Info } from 'lucide-react';
import { motion } from 'framer-motion';

function GlobeView({ onBackToHome }) {
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [countryName, setCountryName] = useState(null);
    const [showNavbar, setShowNavbar] = useState(false);
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
                    color: 'white'
                }}>
                    What's Poppin
                </h1>

                <button
                    onClick={onBackToHome}
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
                    Chat
                </button>
            </nav>

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

            {/* Side Panel */}
            <NewsPanel
                selectedCountry={selectedCountry}
                countryName={countryName}
                onClose={handleClosePanel}
            />

        </div>
    );
}

export default GlobeView;
