import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollProgress } from './LenisProvider';

interface CameraRigProps {
    /** Control points for the camera path spline */
    pathPoints?: THREE.Vector3[];
    /** Enable mouse-driven "gimbal" offset for look-around */
    enableMouseLook?: boolean;
    /** Strength of mouse parallax effect (0-1) */
    mouseInfluence?: number;
}

/**
 * Scrollytelling camera controller.
 * Moves camera along a Catmull-Rom spline based on scroll progress,
 * with optional mouse-driven look-at offset for immersive parallax.
 */
export default function CameraRig({
    pathPoints,
    enableMouseLook = true,
    mouseInfluence = 0.1,
}: CameraRigProps) {
    const { camera } = useThree();
    const scrollProgress = useScrollProgress();
    const mouseRef = useRef({ x: 0, y: 0 });
    const targetRef = useRef(new THREE.Vector3(0, 0, 0));

    // Default camera path: overview → inspection → transition
    const defaultPath = [
        new THREE.Vector3(0, 0, 10),     // Hero: Wide establishing shot
        new THREE.Vector3(-2, 1, 8),     // Services: Slight left pan
        new THREE.Vector3(0, -1, 6),     // Archive: Move in closer
        new THREE.Vector3(2, 0, 7),      // Metrics: Right pan
        new THREE.Vector3(0, 0, 5),      // Contact: Close approach
    ];

    const points = pathPoints || defaultPath;

    // Create Catmull-Rom spline for smooth camera path
    const curve = useRef(
        new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5)
    );

    // Track mouse position for gimbal effect
    useFrame(() => {
        if (enableMouseLook && typeof window !== 'undefined') {
            // Normalized device coordinates (-1 to 1)
            const target = {
                x: (window.innerWidth / 2 - (window as any).__mouseX || 0) / window.innerWidth * 2,
                y: (window.innerHeight / 2 - (window as any).__mouseY || 0) / window.innerHeight * 2,
            };

            // Smooth interpolation
            mouseRef.current.x += (target.x - mouseRef.current.x) * 0.05;
            mouseRef.current.y += (target.y - mouseRef.current.y) * 0.05;
        }

        // Get position on spline based on scroll progress
        const point = curve.current.getPoint(Math.min(scrollProgress, 0.999));

        // Smoothly interpolate camera position
        camera.position.lerp(point, 0.1);

        // Calculate look-at target with mouse offset
        const lookAtBase = curve.current.getPoint(Math.min(scrollProgress + 0.01, 0.999));
        targetRef.current.set(
            lookAtBase.x + mouseRef.current.x * mouseInfluence,
            lookAtBase.y + mouseRef.current.y * mouseInfluence,
            lookAtBase.z - 2 // Look slightly ahead
        );

        camera.lookAt(targetRef.current);
    });

    return null;
}

// Global mouse tracker (set up once in main app)
if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
        (window as any).__mouseX = e.clientX;
        (window as any).__mouseY = e.clientY;
    });
}
