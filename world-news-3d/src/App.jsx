import React, { useState } from 'react';
import GlobeViewer from './components/GlobeViewer';
import NewsPanel from './components/NewsPanel';
import { Info } from 'lucide-react';

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryName, setCountryName] = useState(null);

  const handleCountrySelect = (isoCode, name) => {
    setSelectedCountry(isoCode);
    setCountryName(name);
  };

  const handleClosePanel = () => {
    setSelectedCountry(null);
    setCountryName(null);
  };

  return (
    <div className="w-full h-screen bg-[#000011] text-white relative overflow-hidden">

      {/* Globe Container */}
      <div className="absolute inset-0 z-0">
        <GlobeViewer
          onCountrySelect={handleCountrySelect}
          selectedCountry={selectedCountry}
        />
      </div>

      {/* UI Overlay */}
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

      {/* Side Panel */}
      <NewsPanel
        selectedCountry={selectedCountry}
        countryName={countryName}
        onClose={handleClosePanel}
      />

    </div>
  );
}

export default App;
