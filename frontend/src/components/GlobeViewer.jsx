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

    // Entrance animation: Fast Spin -> Slow Spin
    useEffect(() => {
        const globe = globeEl.current;

        if (globe) {
            const controls = globe.controls();
            if (controls) {
                // 1. Start Fast
                controls.autoRotate = true;
                controls.autoRotateSpeed = 120;

                // 2. Slow down after 1 second
                setTimeout(() => {
                    if (globeEl.current) {
                        const c = globeEl.current.controls();
                        if (c) {
                            c.autoRotateSpeed = 0.35;
                        }
                    }
                }, 1000);
            }
        }
    }, []);

    const userLocationRef = useRef(null);

    // Geolocation and 'c' key listener
    useEffect(() => {
        // 1. Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocationRef.current = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                },
                (err) => console.warn("Geolocation error:", err)
            );
        }

        // 2. Listen for 'c' and 's' keys
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();

            // 'c' key: Home to user location
            if (key === 'c') {
                const loc = userLocationRef.current;
                if (loc && globeEl.current) {
                    // Stop auto-rotation temporarily for the flight
                    const controls = globeEl.current.controls();
                    if (controls) {
                        controls.autoRotate = false;
                    }

                    // Fly to location
                    globeEl.current.pointOfView({
                        lat: loc.lat,
                        lng: loc.lng,
                        altitude: 1.5 // Zoom out a bit or keep current? Let's use a nice view altitude
                    }, 1500); // 1.5s flight time

                    // Resume slow spin after flight
                    setTimeout(() => {
                        if (globeEl.current) {
                            const c = globeEl.current.controls();
                            if (c) {
                                c.autoRotate = true;
                                c.autoRotateSpeed = 0.35;
                            }
                        }
                    }, 1500);
                }
            }

            // 's' key: Toggle spin
            if (key === 's') {
                if (globeEl.current) {
                    const controls = globeEl.current.controls();
                    if (controls) {
                        controls.autoRotate = !controls.autoRotate;
                        if (controls.autoRotate) {
                            controls.autoRotateSpeed = 0.35;
                        }
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
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
