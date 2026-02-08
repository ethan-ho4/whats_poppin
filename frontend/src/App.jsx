import React, { useState } from 'react';
import { countryNews } from './data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import GlobeViewer from './components/GlobeViewer';
import NewsPanel from './components/NewsPanel';
import { Info, X } from 'lucide-react';

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

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryName, setCountryName] = useState(null);

  const handleCountrySelect = (isoCode, name) => {
    console.log('Selected:', isoCode, name);
    setSelectedCountry(isoCode);
    setCountryName(name);
  };

  const handleClosePanel = () => {
    setSelectedCountry(null);
    setCountryName(null);
  };

  return (
    <div className="flex w-full h-screen bg-[#000011] text-white overflow-hidden">

      {/* Side Panel - Using AnimatePresence for smooth slide-in/out */}
      {/* <AnimatePresence mode="wait">
        {selectedCountry && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '0%', opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-auto max-h-screen z-50 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="w-[33vw] min-w-[320px] h-auto">
              <NewsPanel
                selectedCountry={selectedCountry}
                countryName={countryName}
                onClose={handleClosePanel}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* Main Content Area (Globe) */}
      <div className="flex-1 relative z-0">
        <GlobeViewer
          onCountrySelect={handleCountrySelect}
          selectedCountry={selectedCountry}
        />

        {/* UI Overlay - Positioned securely over Globe */}
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <h1 className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 drop-shadow-lg">
            GlobalPulse
          </h1>
          <p className="text-white/60 text-sm mt-1 font-light tracking-wide max-w-xs">
            Interactive real-time news visualization. Click any country to explore locally.
          </p>
        </div>

        <div className="absolute bottom-6 left-6 z-10 pointer-events-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10 flex items-center gap-3 text-sm text-gray-300 max-w-sm">
            <Info size={16} className="text-blue-400 shrink-0" />
            <p>
              Navigate the globe by dragging. Scroll to zoom.
            </p>
          </div>
        </div>
      </div>

      {/* TEMPORARY: Red Circle Overlay for Testing - Using Inline Styles */}
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
            <div
              className="mt-8 w-full pr-2"
              style={{ pointerEvents: 'auto' }}
            >
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

    </div >
  );
}

export default App;
