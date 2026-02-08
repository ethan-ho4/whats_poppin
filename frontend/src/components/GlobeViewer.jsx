import React, { useState, useEffect, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { fipsToIso3 } from '../utils/countryMapping';

const GlobeViewer = ({ onCountrySelect, selectedCountry, dynamicPoints = [], onPointsRendered }) => {
    const globeEl = useRef();
    const [countries, setCountries] = useState({ features: [] });
    const [hoverD, setHoverD] = useState(null);
    const [visibleData, setVisibleData] = useState([]);

    // New state for the "No Articles Found" message
    const [showNoDataMessage, setShowNoDataMessage] = useState(false);

    // Styling for countries
    const getPolygonLabel = (d) => `
    <div style="background: rgba(0,0,0,0.7); padding: 5px 10px; border-radius: 4px; color: white;">
      <b>${d.properties.ADMIN}</b> (${d.properties.ISO_A3})
      <br />
      Click for news
    </div>
  `;

    const allPointsRef = useRef([]);

    // Memoize all points and top points
    const { allPoints, topPoints } = useMemo(() => {
        const all = [];

        // 1. Process Dynamic Data from API
        dynamicPoints.forEach((article) => {
            const lat = article.lat;
            const lng = article.lng || article.lon;

            if (lat !== undefined && lng !== undefined) {
                // Map GDELT FIPS code to ISO-A3
                const fips = article.country_code;
                const isoCode = fipsToIso3[fips] || 'DYNAMIC';

                all.push({
                    ...article,
                    lat,
                    lng,
                    locationLabels: article.country || 'Unknown Location',
                    isoCode: isoCode
                });
            }
        });

        allPointsRef.current = all;
        return { allPoints: all, topPoints: all };
    }, [dynamicPoints]);

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

        const ZOOM_THRESHOLD = 1.5;
        const VIEW_ANGLE_FACTOR = 0.6;

        // Always use the latest points from the Ref to avoid stale closure
        const candidates = allPointsRef.current;

        let maxAngle = Math.min(Math.PI / 2, altitude * VIEW_ANGLE_FACTOR + 0.3);

        if (altitude > ZOOM_THRESHOLD) {
            maxAngle = Math.PI / 1.5;
        }

        const filtered = candidates.filter(d => {
            const dist = getDistance(lat, lng, d.lat, d.lng);
            return dist < maxAngle;
        });

        setVisibleData(filtered);
    };

    // Initial load and point updates
    useEffect(() => {
        // ... (fetch logic remains same) ...
        fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then(data => {
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

        if (globeEl.current) {
            globeEl.current.pointOfView({ altitude: 1.7 });
        }

        // Initialize visible data
        setVisibleData(topPoints);
    }, [topPoints]);

    // Notify parent of rendered points count
    useEffect(() => {
        if (onPointsRendered) {
            onPointsRendered(visibleData.length);
        }
    }, [visibleData, onPointsRendered]);

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

    // Smart Rotation removed as per user request

    const userLocationRef = useRef(null);
    const isAnimatingRef = useRef(false);

    // Geolocation and 'c', 's', 'a' key listener
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

        // 2. Listen for keys
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();

            // 'c' key: Home to user location
            if (key === 'c') {
                if (isAnimatingRef.current || showNoDataMessage) return;

                setShowNoDataMessage(false); // Reset message on navigation
                const loc = userLocationRef.current;
                if (loc && globeEl.current) {
                    const controls = globeEl.current.controls();
                    if (controls) {
                        controls.autoRotate = false;
                        controls.target.set(0, 0, 0);
                        controls.update();
                    }
                    globeEl.current.pointOfView({
                        lat: loc.lat,
                        lng: loc.lng,
                        altitude: 1.5
                    }, 1500);

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
                if (isAnimatingRef.current || showNoDataMessage) return;

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

            // 'a' key: Accelerate spin, zoom out, then look into space
            if (key === 'a') {
                if (isAnimatingRef.current || showNoDataMessage) return;
                isAnimatingRef.current = true;
                setShowNoDataMessage(false); // Reset message at start
                if (globeEl.current) {
                    const controls = globeEl.current.controls();
                    const camera = globeEl.current.camera();

                    if (controls && camera) {
                        const startPos = camera.position.clone();
                        const startRotation = camera.rotation.clone();
                        const startTime = Date.now();
                        const animationDuration = 2500; // 2.5 seconds total

                        // Disable controls completely
                        controls.enabled = false;

                        const spherical = new THREE.Spherical();
                        spherical.setFromVector3(camera.position);

                        const animateAll = () => {
                            const elapsed = Date.now() - startTime;
                            // Ensure progress doesn't exceed 1
                            const progress = Math.min(elapsed / animationDuration, 1);

                            // 1. Zoom out - increase radius (altitude)
                            const extraRadius = progress * 800; // Adjust multiplier as needed for zoom extent

                            // 2. Eased Progress
                            const timeInSeconds = progress * 2.5;
                            let rawProgress;
                            if (timeInSeconds <= 2.0) {
                                rawProgress = 3 * timeInSeconds * timeInSeconds;
                            } else {
                                const dt = timeInSeconds - 2.0;
                                rawProgress = 12 + (12 * dt) - (0.5 * 24 * dt * dt);
                            }
                            const maxVal = 15;
                            const easedProgress = Math.min(rawProgress / maxVal, 1.0);

                            // 3. Globe Spin
                            const totalSpinRadians = 0.5;
                            // Re-initialize from startPos + extraRadius
                            spherical.setFromVector3(startPos);
                            spherical.radius += extraRadius;
                            spherical.theta -= easedProgress * totalSpinRadians;

                            camera.position.setFromSpherical(spherical);
                            camera.lookAt(0, 0, 0);

                            // 4. Turn Away (Camera Rotation)
                            // Rotate camera 90 degrees (turn away left to right)
                            camera.rotateY(Math.PI / 2 * easedProgress);

                            if (progress < 1) {
                                requestAnimationFrame(animateAll);
                            } else {
                                isAnimatingRef.current = false;
                                controls.enabled = false;
                                controls.autoRotate = false;
                                // Animation complete - SHOW MESSAGE
                                setShowNoDataMessage(true);
                            }
                        };
                        animateAll();
                    }
                }
            }

            // SPACE key: Return to Earth (Smooth Transition)
            if (key === ' ') {
                if (isAnimatingRef.current) return;
                isAnimatingRef.current = true;
                if (globeEl.current) {
                    setShowNoDataMessage(false);
                    const controls = globeEl.current.controls();
                    const camera = globeEl.current.camera();

                    if (controls && camera) {
                        controls.enabled = false;
                        controls.autoRotate = false;

                        // 1. Capture Start State
                        const startPos = camera.position.clone();

                        // Get current look direction
                        const forward = new THREE.Vector3();
                        camera.getWorldDirection(forward);
                        // Current target is roughly position + forward distance
                        // But for interpolation, we can just say we are looking at (pos + forward)
                        const startTarget = startPos.clone().add(forward);

                        // 2. Define End State
                        // We want to end up looking at 0,0,0 from a position close to Earth
                        // preserving the general angle "inward"
                        const endTarget = new THREE.Vector3(0, 0, 0);

                        // Calculate end position: same direction from center, but closer
                        // Spherical calc to find "surface" position at current angle
                        const spherical = new THREE.Spherical();
                        spherical.setFromVector3(startPos);
                        spherical.radius = 250; // Target altitude (~1.7)
                        const endPos = new THREE.Vector3().setFromSpherical(spherical);

                        const startTime = Date.now();
                        const duration = 2000;

                        const animateReturn = () => {
                            const elapsed = Date.now() - startTime;
                            const progress = Math.min(elapsed / duration, 1);

                            // Easing: Quadratic In/Out
                            const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

                            // Interpolate Position
                            const currentPos = new THREE.Vector3().lerpVectors(startPos, endPos, ease);
                            camera.position.copy(currentPos);

                            // Interpolate LookAt Target
                            // We need to look at a moving point between startTarget and (0,0,0)
                            const currentTarget = new THREE.Vector3().lerpVectors(startTarget, endTarget, ease);
                            camera.lookAt(currentTarget);

                            if (progress < 1) {
                                requestAnimationFrame(animateReturn);
                            } else {
                                // Animation complete
                                isAnimatingRef.current = false;
                                controls.enabled = true;
                                controls.autoRotate = true;
                                controls.autoRotateSpeed = 0.35;
                                controls.target.set(0, 0, 0);
                                controls.update();
                            }
                        };
                        animateReturn();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showNoDataMessage]);

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
        <div className="cursor-move relative">
            {showNoDataMessage && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    zIndex: 1000,
                    pointerEvents: 'none',
                    textAlign: 'center',
                    fontFamily: 'sans-serif',
                    textShadow: '0 0 20px rgba(0,0,0,0.8)',
                }}>
                    <div style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        no article found lol
                    </div>
                    <div style={{ fontSize: '1.5rem', opacity: 0.8 }}>
                        press space bar to go back
                    </div>
                </div>
            )}
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
                pointAltitude={0.02}
                pointRadius={0.4}
                pointLabel={d => `
                        <div style="background: rgba(0,0,0,0.8); padding: 8px 12px; border-radius: 6px; color: white; border: 1px solid rgba(255,255,255,0.2); font-family: 'Moon', sans-serif;">
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
