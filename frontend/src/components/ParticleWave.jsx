import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const maxDis = 50;

function ParticleWave() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        // const noise = new Noise(Math.random()); // Unused in current animation

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(-10, 20, 30);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        containerRef.current.appendChild(renderer.domElement);

        const pointLight = new THREE.PointLight(0xffffff, 1000);
        pointLight.position.set(10, 10, 20);
        scene.add(pointLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Reused geometry and material for better performance
        const geometry = new THREE.SphereGeometry(0.04, 24, 24);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

        let particles = [];
        for (let x = -maxDis; x < maxDis; x++) {
            let pGroup = [];
            for (let z = -maxDis; z < maxDis; z++) {
                const p = new THREE.Mesh(geometry, material);
                p.position.set(x, 0, z);
                scene.add(p);
                pGroup.push(p);
            }
            particles.push(pGroup);
        }

        let frame = 0;
        let animationId;

        function animate() {
            animationId = requestAnimationFrame(animate);
            controls.update();

            particles.forEach((pGroup) => {
                pGroup.forEach((p) => {
                    p.position.y = Math.sin(Math.sqrt((p.position.x + maxDis) ** 2 + (p.position.z + maxDis) ** 2) / 3 + frame) * 2;
                });
            });

            frame += 0.005;
            renderer.render(scene, camera);
        }

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
            particles.forEach(pGroup => {
                pGroup.forEach(p => {
                    p.geometry.dispose();
                    p.material.dispose();
                    scene.remove(p);
                });
            });
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 0
            }}
        />
    );
}

export default ParticleWave;