import React from 'react';
import { motion } from 'framer-motion';

function Navbar() {
    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-0 left-0 right-0 z-40 bg-green-500 border-b-4 border-green-600"
        >
            <div className="px-6 py-4">
                <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
                    What's Poppin
                </h1>
            </div>
        </motion.nav>
    );
}

export default Navbar;
