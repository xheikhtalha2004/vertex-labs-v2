import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Smaller crystal for the services section.
 * A simpler icosahedron with wireframe overlay.
 */
export default function SmallCrystal() {
    const meshRef = useRef<THREE.Mesh>(null);
    const wireRef = useRef<THREE.LineSegments>(null);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        if (meshRef.current) {
            meshRef.current.rotation.y = time * 0.1;
            meshRef.current.rotation.z = Math.sin(time * 0.08) * 0.05;
        }
        if (wireRef.current) {
            wireRef.current.rotation.y = time * 0.1;
            wireRef.current.rotation.z = Math.sin(time * 0.08) * 0.05;
        }
    });

    return (
        <group>
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[1.2, 0]} />
                <meshPhongMaterial
                    color="#4F6DF5"
                    transparent
                    opacity={0.15}
                    shininess={100}
                />
            </mesh>
            <lineSegments ref={wireRef}>
                <icosahedronGeometry args={[1.2, 0]} />
                <lineBasicMaterial color="#4F6DF5" transparent opacity={0.6} />
            </lineSegments>
        </group>
    );
}
