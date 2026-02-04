import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    gridDistortionVertex,
    gridDistortionFragment,
    gridDistortionUniforms
} from '../../../shaders/gridDistortion';

interface GridBackgroundProps {
    /** Grid size (default: 30x30) */
    size?: number;
    /** Divisions in the grid (default: 60) */
    divisions?: number;
    /** Wave amplitude (default: 0.15) */
    amplitude?: number;
    /** Wave frequency (default: 2.0) */
    frequency?: number;
    /** Position offset */
    position?: [number, number, number];
}

/**
 * Animated topological grid background.
 * Creates a "data flow" visualization using custom GLSL shaders.
 */
export default function GridBackground({
    size = 30,
    divisions = 60,
    amplitude = 0.15,
    frequency = 2.0,
    position = [0, 0, -5],
}: GridBackgroundProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    // Create shader material with uniforms
    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader: gridDistortionVertex,
            fragmentShader: gridDistortionFragment,
            uniforms: {
                ...gridDistortionUniforms,
                u_amplitude: { value: amplitude },
                u_frequency: { value: frequency },
            },
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
    }, [amplitude, frequency]);

    // Animate shader uniforms
    useFrame(({ clock }) => {
        if (shaderMaterial) {
            shaderMaterial.uniforms.u_time.value = clock.elapsedTime;

            // Update mouse position (normalized -1 to 1)
            if (typeof window !== 'undefined') {
                const targetX = ((window as any).__mouseX || window.innerWidth / 2) / window.innerWidth * 2 - 1;
                const targetY = -((window as any).__mouseY || window.innerHeight / 2) / window.innerHeight * 2 + 1;

                // Smooth interpolation
                mouseRef.current.x += (targetX - mouseRef.current.x) * 0.05;
                mouseRef.current.y += (targetY - mouseRef.current.y) * 0.05;

                shaderMaterial.uniforms.u_mouse.value = [mouseRef.current.x, mouseRef.current.y];
            }
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={position}
            rotation={[-Math.PI / 3, 0, 0]}
        >
            <planeGeometry args={[size, size, divisions, divisions]} />
            <primitive object={shaderMaterial} attach="material" />
        </mesh>
    );
}
