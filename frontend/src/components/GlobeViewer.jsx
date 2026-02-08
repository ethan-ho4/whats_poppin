import React, { useState, useEffect, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { countryNews } from '../data/mockData';

const GlobeViewer = ({ onCountrySelect, selectedCountry }) => {
    const globeEl = useRef();
    const [countries, setCountries] = useState({ features: [] });
    const [hoverD, setHoverD] = useState(null);
    const [visibleData, setVisibleData] = useState([]);

    // Memoize all points and top points
    const { allPoints, topPoints } = useMemo(() => {
        const all = [];
        const top = [];
        Object.entries(countryNews).forEach(([isoCode, articles]) => {
            articles.forEach((article, index) => {
                if (article.lat && article.lng) {
                    const point = { ...article, isoCode };
                    all.push(point);
                    if (index === 0) top.push(point);
                }
            });
        });
        return { allPoints: all, topPoints: top };
    }, []);

    // Helper to calculate distance
    const getDistance = (lat1, lng1, lat2, lng2) => {
        const rad = Math.PI / 180;
        const phi1 = lat1 * rad;
        const phi2 = lat2 * rad;
        const deltaPhi = (lat2 - lat1) * rad;
        const deltaLambda = (lng2 - lng1) * rad;

        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return c; // Angular distance in radians
    };

    // Updating logic
    const updateVisiblePoints = () => {
        if (!globeEl.current) return;

        const { lat, lng, altitude } = globeEl.current.pointOfView();


        // Thresholds
        const ZOOM_THRESHOLD = 1.5; // Altitude below which we show detail
        const VIEW_ANGLE_FACTOR = 0.6; // Multiplier for field of view based on altitude

        const isZoomedOut = altitude > ZOOM_THRESHOLD;
        // Always show all points for now to ensure users see the city spread
        const candidates = allPoints;

        // Calculate visible cap
        // Horizon is acos(1 / (1 + alt)), but we want a tighter cone for culling "not in view"
        // Approximate visible angle based on altitude (smaller altitude = smaller visible patch)
        // Max angle is PI/2 (hemisphere)
        let maxAngle = Math.min(Math.PI / 2, altitude * VIEW_ANGLE_FACTOR + 0.3); // +0.3 base field of view

        if (isZoomedOut) {
            // When zoomed out, show more of the globe features
            maxAngle = Math.PI / 1.5;
        }

        const filtered = candidates.filter(d => {
            const dist = getDistance(lat, lng, d.lat, d.lng);
            return dist < maxAngle;
        });

        setVisibleData(filtered);
    };

    // Initial load of countries
    useEffect(() => {
        fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then(data => {
                // Fix missing ISO codes for specific countries
                data.features.forEach(f => {
                    if (f.properties.ISO_A3 === '-99') {
                        switch (f.properties.ADMIN) {
                            case 'France': f.properties.ISO_A3 = 'FRA'; break;
                            case 'Norway': f.properties.ISO_A3 = 'NOR'; break;
                            case 'Somaliland': f.properties.ISO_A3 = 'SOM'; break;
                            default: break;
                        }
                    }
                });
                setCountries(data);
            });

        // Initial point update and zoom position
        // We need a small delay or check until globe is ready, but typically pointOfView has default
        if (globeEl.current) {
            // Set initial view to be closer (bigger globe)
            globeEl.current.pointOfView({ altitude: 1.7 });
        }

        setVisibleData(topPoints);
    }, [topPoints]);

    // Setup controls listener
    useEffect(() => {
        const globe = globeEl.current;
        if (!globe) return;

        let timeoutId;
        const handleChange = () => {
            if (timeoutId) cancelAnimationFrame(timeoutId);
            timeoutId = requestAnimationFrame(updateVisiblePoints);
        };

        // Retry loop to attach controls
        const checkControls = () => {
            const controls = globe.controls();
            if (controls) {
                console.log('Globe controls attached');
                controls.addEventListener('change', handleChange);
                // Run once to initialize
                handleChange();
            } else {
                // console.log('Waiting for globe controls...');
                setTimeout(checkControls, 100);
            }
        };

        checkControls();

        return () => {
            const controls = globe.controls();
            if (controls) {
                controls.removeEventListener('change', handleChange);
            }
            if (timeoutId) cancelAnimationFrame(timeoutId);
        };
    }, []); // allPoints/topPoints are stable, so closure is safe


    // Effect to focus on selected country
    useEffect(() => {
        if (selectedCountry && globeEl.current) {
            const country = countries.features.find(d => d.properties.ISO_A3 === selectedCountry);
            if (country) {
                // Optional: Fly to country
                // globeEl.current.pointOfView({ lat: ..., lng: ..., altitude: ... });
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

    // Window resize handling
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="cursor-move">
            <Globe
                ref={globeEl}
                width={dimensions.width}
                height={dimensions.height}
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

                onPolygonHover={setHoverD}
                onPolygonClick={(d) => {
                    console.log('Polygon Clicked:', d.properties.ADMIN);
                    onCountrySelect(d.properties.ISO_A3, d.properties.ADMIN)
                }}

                pointsData={visibleData}
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
                    console.log('Point Clicked:', d.title);
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
