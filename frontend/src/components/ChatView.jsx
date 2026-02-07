import React, { useState, useEffect, useRef } from 'react';

function ChatView({ onEnter }) {
    const [showNavbar, setShowNavbar] = useState(false);
    const lastMouseY = useRef(0);
    const hideTimeoutRef = useRef(null);

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
        <div style={{ width: '100vw', height: '100vh', backgroundColor: '#3B82F6', margin: 0, padding: 0 }}>
            {/* Navbar */}
            <nav style={{
                width: '100%',
                backgroundColor: '#22C55E',
                padding: '1rem 2rem',
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
                transition: 'transform 0.3s ease-in-out',
                zIndex: 1000
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
                    onClick={onEnter}
                    style={{
                        backgroundColor: 'white',
                        color: '#22C55E',
                        border: 'none',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                    Globe
                </button>
            </nav>
        </div>
    );
}

export default ChatView;
