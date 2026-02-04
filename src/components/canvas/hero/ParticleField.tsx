import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Floating particle field for ambient atmosphere.
 * Low-poly particle system that slowly rotates in the background.
 */
export default function ParticleField() {
    const pointsRef = useRef<THREE.Points>(null);

    const geometry = useMemo(() => {
        const particleCount = 60;
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 16;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geo;
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
        }
    });

    return (
        <points ref={pointsRef} geometry={geometry}>
            <pointsMaterial
                size={0.03}
                color="#4F6DF5"
                transparent
                opacity={0.5}
                sizeAttenuation
            />
        </points>
    );
}
