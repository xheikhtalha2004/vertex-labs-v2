import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Main hero crystal visualization.
 * An icosahedron with wireframe overlay, orbital rings, and floating particles.
 */
export default function CrystalMesh() {
    const meshRef = useRef<THREE.Mesh>(null);
    const wireRef = useRef<THREE.LineSegments>(null);
    const groupRef = useRef<THREE.Group>(null);

    const moveRef = useRef({ x: 0, y: 0 }); // Mouse position target

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // Use R3F built-in pointer state (normalized -1 to 1) for reliable tracking
        // Smoothly interpolate current rotation target towards pointer
        if (moveRef.current) {
            moveRef.current.x += (state.pointer.x - moveRef.current.x) * 0.1;
            moveRef.current.y += (state.pointer.y - moveRef.current.y) * 0.1;
        }

        if (meshRef.current) {
            // Base rotation + mouse interaction
            // Rotate mesh to face mouse (gimbal effect)
            meshRef.current.rotation.y = time * 0.1 + moveRef.current.x * 1.0;
            meshRef.current.rotation.x = Math.sin(time * 0.05) * 0.1 - moveRef.current.y * 1.0;
        }
        if (wireRef.current) {
            wireRef.current.rotation.y = time * 0.08;
            wireRef.current.rotation.x = Math.sin(time * 0.05) * 0.08;
        }
        if (groupRef.current) {
            groupRef.current.rotation.y = time * 0.02;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Main crystal body */}
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[2, 1]} />
                <meshPhongMaterial
                    color="#4F6DF5"
                    transparent
                    opacity={0.12}
                    shininess={100}
                    specular="#4F6DF5"
                />
            </mesh>

            {/* Wireframe overlay */}
            <lineSegments ref={wireRef}>
                <icosahedronGeometry args={[2, 1]} />
                <lineBasicMaterial color="#4F6DF5" transparent opacity={0.5} />
            </lineSegments>

            {/* Inner glow sphere */}
            <mesh>
                <sphereGeometry args={[0.6, 16, 16]} />
                <meshBasicMaterial color="#4F6DF5" transparent opacity={0.25} />
            </mesh>

            {/* Orbital rings */}
            {[...Array(3)].map((_, i) => (
                <group key={i} rotation={[Math.PI / 3 * i, Math.PI / 4 * i, 0]}>
                    <Line
                        points={[...Array(65)].map((_, j) => {
                            const angle = (j / 64) * Math.PI * 2;
                            return new THREE.Vector3(
                                Math.cos(angle) * (3 + i * 0.4),
                                Math.sin(angle) * (3 + i * 0.4),
                                0
                            );
                        })}
                        color="#4F6DF5"
                        transparent
                        opacity={0.12 - i * 0.02}
                        lineWidth={1}
                    />
                </group>
            ))}

            {/* Floating particles */}
            {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 3.5;
                return (
                    <mesh key={i} position={[
                        Math.cos(angle) * radius,
                        Math.sin(angle) * radius * 0.4,
                        (i % 2 === 0 ? 1 : -1) * 0.5
                    ]}>
                        <sphereGeometry args={[0.04, 8, 8]} />
                        <meshBasicMaterial color="#4F6DF5" transparent opacity={0.5} />
                    </mesh>
                );
            })}
        </group>
    );
}
