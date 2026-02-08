import React, { useState, useEffect, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { fipsToIso3 } from '../utils/countryMapping';

const GlobeViewer = ({ onCountrySelect, selectedCountry, dynamicPoints = [], isSearchError, onResetError, onSetError }) => {
    const globeEl = useRef();
    const [countries, setCountries] = useState({ features: [] });
    const [hoverD, setHoverD] = useState(null);
    const [visibleData, setVisibleData] = useState([]);

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
        dynamicPoints.forEach((article, index) => {
            const lat = article.lat;
            const lng = article.lng || article.lon;

            if (lat !== undefined && lng !== undefined) {
                // Map GDELT FIPS code to ISO-A3
                const fips = article.country_code;
                const isoCode = fipsToIso3[fips] || 'DYNAMIC';

                // Assign random blue or pink color deterministically based on index
                const color = index % 2 === 0 ? '#60A5FA' : '#F472B6'; 

                all.push({
                    ...article,
                    lat,
                    lng,
                    locationLabels: article.country || 'Unknown Location',
                    isoCode: isoCode,
                    color: color
                });
            }
        });

        allPointsRef.current = all;
        return { allPoints: all, topPoints: all };
    }, [dynamicPoints]);

    // Custom Glow Materials for Markers
    const { blueMaterial, pinkMaterial } = useMemo(() => {
        const createGlowTexture = (color) => {
             const canvas = document.createElement('canvas');
             canvas.width = 64;
             canvas.height = 64;
             const ctx = canvas.getContext('2d');
             
             // Radial gradient
             const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
             
             // Center white (strong core)
             gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
             gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');

             // Mid color (blue/pink)
             const isBlue = color === '#60A5FA';
             const midColor = isBlue ? '96, 165, 250' : '244, 114, 182';
             
             gradient.addColorStop(0.4, `rgba(${midColor}, 0.8)`);
             gradient.addColorStop(0.6, `rgba(${midColor}, 0.2)`);
             gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
             
             ctx.fillStyle = gradient;
             ctx.fillRect(0, 0, 64, 64);
             
             return new THREE.CanvasTexture(canvas);
        };
        
        const blueTex = createGlowTexture('#60A5FA');
        const pinkTex = createGlowTexture('#F472B6');
        
        const blueMat = new THREE.SpriteMaterial({ map: blueTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
        const pinkMat = new THREE.SpriteMaterial({ map: pinkTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
        
        return { blueMaterial: blueMat, pinkMaterial: pinkMat };
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
    const [showErrorMsg, setShowErrorMsg] = useState(false);

    // Animation Triggers
    const triggerErrorAnimation = () => {
         if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;
        
        if (globeEl.current) {
            const controls = globeEl.current.controls();
            const camera = globeEl.current.camera();

            if (controls && camera) {
                const startPos = camera.position.clone();
                const startTime = Date.now();
                const animationDuration = 2500; // 2.5 seconds total

                // Disable controls completely
                controls.enabled = false;
                controls.autoRotate = false;

                const spherical = new THREE.Spherical();
                spherical.setFromVector3(camera.position);

                const animateAll = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / animationDuration, 1);

                    // 1. Zoom out - increase radius (altitude)
                    const extraRadius = progress * 800; 

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
                    spherical.setFromVector3(startPos);
                    spherical.radius += extraRadius;
                    spherical.theta -= easedProgress * totalSpinRadians;

                    camera.position.setFromSpherical(spherical);
                    camera.lookAt(0, 0, 0);

                    // 4. Turn Away (Camera Rotation)
                    camera.rotateY(Math.PI / 2 * easedProgress);

                    if (progress < 1) {
                        requestAnimationFrame(animateAll);
                    } else {
                        // Animation complete
                        isAnimatingRef.current = false;
                        controls.enabled = false; 
                        controls.autoRotate = false;
                        setShowErrorMsg(true);
                    }
                };
                animateAll();
            }
        }
    };

    const triggerReturnAnimation = () => {
         if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;
        setShowErrorMsg(false);

        if (globeEl.current) {
            const controls = globeEl.current.controls();
            const camera = globeEl.current.camera();

            if (controls && camera) {
                controls.enabled = false;
                controls.autoRotate = false;

                const startPos = camera.position.clone();
                const forward = new THREE.Vector3();
                camera.getWorldDirection(forward);
                const startTarget = startPos.clone().add(forward);
                const endTarget = new THREE.Vector3(0, 0, 0);

                const spherical = new THREE.Spherical();
                spherical.setFromVector3(startPos);
                spherical.radius = 250; // Target altitude (~1.7)
                const endPos = new THREE.Vector3().setFromSpherical(spherical);

                const startTime = Date.now();
                const duration = 2000;

                const animateReturn = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

                    const currentPos = new THREE.Vector3().lerpVectors(startPos, endPos, ease);
                    camera.position.copy(currentPos);

                    const currentTarget = new THREE.Vector3().lerpVectors(startTarget, endTarget, ease);
                    camera.lookAt(currentTarget);

                    if (progress < 1) {
                        requestAnimationFrame(animateReturn);
                    } else {
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
    };

    // Watch for isSearchError prop to trigger animations
    useEffect(() => {
        if (isSearchError) {
            triggerErrorAnimation();
        } else {
            // Only trigger return if we were previously in error state? 
            // Actually, typically we just want to ensure we're at Earth. 
            // If we're already at Earth, this might re-animate. 
            // But usually this prop flips when a new search starts (reset to false).
            // We might want to avoid re-animating if we are already close?
            // For now, let's allow it, or we can check altitude.
             if (globeEl.current) {
                const { altitude } = globeEl.current.pointOfView();
                if (altitude > 4) { // Heuristic: if far away, return
                    triggerReturnAnimation();
                }
            }
        }
    }, [isSearchError]);


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
                if (isAnimatingRef.current || isSearchError) return; // Block nav if error? Or allow to escape?
                // Allow escape
                if (isSearchError && onResetError) onResetError(); 

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
                if (isAnimatingRef.current || isSearchError) return;

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

            // 'a' key: Manual Error Trigger (Dev/Fun)
            if (key === 'a') {
                if (onSetError) {
                    onSetError(true);
                } else {
                    triggerErrorAnimation();
                }
            }

            // SPACE key: Return to Earth (Smooth Transition)
            if (key === ' ') {
                if (onResetError) onResetError(); // Reset error state in parent
                triggerReturnAnimation();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSearchError, onResetError, onSetError]);

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
            {showErrorMsg && (
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

                // Markers: Custom Glowing Sprites
                customLayerData={visibleData}
                customThreeObject={d => {
                    const isBlue = d.color === '#60A5FA';
                    const material = isBlue ? blueMaterial : pinkMaterial;
                    const sprite = new THREE.Sprite(material);
                    sprite.scale.set(6, 6, 1); // Size of glow
                    sprite.userData = d; // Attach data for interaction
                    return sprite;
                }}
                customThreeObjectUpdate={(obj, d) => {
                     if (globeEl.current) {
                         const coords = globeEl.current.getCoords(d.lat, d.lng, 0.02);
                         Object.assign(obj.position, coords);
                     }
                }}
                onCustomLayerClick={(obj) => {
                    const d = obj.userData;
                    if (d) {
                        const country = countries.features.find(c => c.properties.ISO_A3 === d.isoCode);
                        onCountrySelect(d.isoCode, country ? country.properties.ADMIN : d.locationLabels);
                    }
                }}
                customLayerLabel={(obj) => {
                     const d = obj.userData;
                     if (!d) return '';
                     return `
                        <div style="background: rgba(0,0,0,0.8); padding: 8px 12px; border-radius: 6px; color: white; border: 1px solid rgba(255,255,255,0.2); font-family: 'Moon', sans-serif;">
                            <div style="font-weight: bold; margin-bottom: 4px;">${d.title}</div>
                            <div style="font-size: 0.8em; opacity: 0.8; text-transform: uppercase;">${d.locationLabels}</div>
                        </div>
                    `;
                }}

                atmosphereColor="#3a228a"
                atmosphereAltitude={0.25}
            />
        </div>
    );
};

export default GlobeViewer;
