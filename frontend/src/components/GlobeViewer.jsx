import React, { useState, useEffect, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { countryNews } from '../data/mockData';

const GlobeViewer = ({ onCountrySelect, selectedCountry }) => {
    const globeEl = useRef();
    const [countries, setCountries] = useState({ features: [] });

    // Fetch country polygon data
    const newsPoints = useMemo(() => {
        const points = [];
        Object.entries(countryNews).forEach(([isoCode, articles]) => {
            articles.forEach(article => {
                if (article.lat && article.lng) {
                    points.push({
                        ...article,
                        isoCode
                    });
                }
            });
        });
        return points;
    }, []);

    useEffect(() => {
        // Determine the base path based on deployment - assuming public/datasets or directly fetching
        // Using a reliable CDN for country polygons for now to ensure it works out of the box
        fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then(setCountries);
    }, []);

    // Effect to focus on selected country
    useEffect(() => {
        if (selectedCountry && globeEl.current) {
            // Logic to find polygon center and fly to it could go here
            // For now we just highlight it
            const country = countries.features.find(d => d.properties.ISO_A3 === selectedCountry);
            if (country) {
                // Calculate centroid or just highlight
                // Advanced: use d3-geo to find centroid
            }
        }
    }, [selectedCountry, countries]);

    // Entrance animation: Spin fast then slow down + Center on location
    useEffect(() => {
        const controls = globeEl.current?.controls();
        if (controls) {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 120; // Very fast burst

            let isSlowedDown = false;
            let userLocation = null;
            let hasCentered = false;

            const attemptCenter = () => {
                if (isSlowedDown && userLocation && !hasCentered && globeEl.current) {
                    hasCentered = true;
                    globeEl.current.pointOfView({
                        lat: userLocation.lat,
                        lng: userLocation.lng,
                        altitude: 2.5 // Standard zoom distance
                    });
                }
            };

            // Attempt to get user location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        attemptCenter();
                    },
                    (error) => {
                        console.warn("Geolocation access denied or failed", error);
                    }
                );
            }

            // Slow down logic
            const timer = setTimeout(() => {
                if (globeEl.current) {
                    const currentControls = globeEl.current.controls();
                    if (currentControls) {
                        currentControls.autoRotateSpeed = 0.35; // Very slow maintenance spin
                    }
                    isSlowedDown = true;
                    attemptCenter();
                }
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, []);

    // Styling for countries
    const getPolygonLabel = (d) => `
    <div style="background: rgba(0,0,0,0.7); padding: 5px 10px; border-radius: 4px; color: white;">
      <b>${d.properties.ADMIN}</b> (${d.properties.ISO_A3})
      <br />
      ${countryNews[d.properties.ISO_A3] ? 'Click for news' : 'No news available'}
    </div>
  `;

    return (
        <div className="cursor-move">
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                lineHoverPrecision={0}

                polygonsData={countries.features}
                polygonAltitude={d => (d.properties.ISO_A3 === selectedCountry ? 0.06 : 0.01)}
                polygonCapColor={d =>
                    (d.properties.ISO_A3 === selectedCountry ? 'rgba(56, 189, 248, 0.8)' : 'rgba(200, 200, 200, 0.1)')
                }
                polygonSideColor={() => 'rgba(0, 50, 80, 0.4)'}
                polygonStrokeColor={() => '#111'}
                polygonLabel={getPolygonLabel}


                onPolygonClick={(d) => onCountrySelect(d.properties.ISO_A3, d.properties.ADMIN)}

                pointsData={newsPoints}
                pointLat="lat"
                pointLng="lng"
                pointColor={() => '#ef4444'}
                pointAltitude={0.07}
                pointRadius={0.4}
                pointLabel={d => `
                    <div style="background: rgba(0,0,0,0.8); padding: 8px 12px; border-radius: 6px; color: white; border: 1px solid rgba(255,255,255,0.2);">
                        <div style="font-weight: bold; margin-bottom: 4px;">${d.title}</div>
                        <div style="font-size: 0.8em; opacity: 0.8;">${d.locationLabels}</div>
                    </div>
                `}
                onPointClick={(d) => {
                    const country = countries.features.find(c => c.properties.ISO_A3 === d.isoCode);
                    onCountrySelect(d.isoCode, country ? country.properties.ADMIN : d.locationLabels);
                }}

                atmosphereColor="#3a228a"
                atmosphereAltitude={0.25}
            />
        </div>
    );
};

export default GlobeViewer;
