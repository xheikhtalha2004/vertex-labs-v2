import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
    Thermometer,
    Box,
    Activity,
    Cpu,
    Wind,
    CheckCircle
} from 'lucide-react';

const ICONS: Record<string, any> = {
    'thermal': Thermometer,
    'cad': Box,
    'fea': Activity,
    'proto': Cpu,
    'cfd': Wind,
    'valid': CheckCircle
};

export default function OrbitalServices({ services }: { services: any[] }) {
    const groupRef = useRef<THREE.Group>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useFrame((state) => {
        if (groupRef.current) {
            // Slow continuous rotation
            groupRef.current.rotation.y += 0.001;

            // Mouse interaction - tilt based on pointer
            const x = (state.pointer.x * Math.PI) / 15;
            const y = (state.pointer.y * Math.PI) / 15;
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, y * 0.3, 0.05);
            groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -x * 0.3, 0.05);
        }
    });

    return (
        <group ref={groupRef}>
            <DashedOrbitRing radius={8.2} />
            <DashedOrbitRing radius={10} dashed={true} opacity={0.15} />

            {services.map((service, i) => (
                <ServiceNode
                    key={i}
                    index={i}
                    total={services.length}
                    radius={8.2}
                    title={service.title}
                    iconId={service.id}
                    isHovered={hoveredIndex === i}
                    onHover={(hover: boolean) => setHoveredIndex(hover ? i : null)}
                />
            ))}
        </group>
    );
}

function ServiceNode({ index, total, radius = 3, title, iconId, isHovered, onHover }: any) {
    const angle = (index / total) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const ref = useRef<THREE.Group>(null);
    const Icon = ICONS[iconId] || Box;

    useFrame(({ camera }) => {
        if (ref.current) {
            ref.current.lookAt(camera.position);
        }
    });

    return (
        <group position={[x, 0, z]} ref={ref}>
            {/* HTML Overlay Card */}
            <Html center transform distanceFactor={12} style={{ pointerEvents: 'auto' }} zIndexRange={[100, 0]}>
                <div
                    className={`
                        w-52 p-3 rounded-2xl flex items-center gap-3 transition-all duration-300 cursor-pointer select-none
                        ${isHovered
                            ? 'bg-[#0E1118] border border-[#4F6DF5] scale-105 shadow-[0_0_30px_rgba(79,109,245,0.4)]'
                            : 'bg-[#0E1118]/80 border border-[#A6AFBF]/20 hover:border-[#4F6DF5]/60'
                        }
                    `}
                    onMouseEnter={() => onHover(true)}
                    onMouseLeave={() => onHover(false)}
                >
                    <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                        ${isHovered ? 'bg-[#4F6DF5] text-white' : 'bg-[#4F6DF5]/10 text-[#4F6DF5]'}
                    `}>
                        <Icon size={16} />
                    </div>
                    <div className="font-bold text-white text-xs tracking-wide leading-tight">{title}</div>
                </div>
            </Html>

            {/* Marker Mesh - Ensures something renders even if HTML fails */}
            <mesh visible={false}>
                <sphereGeometry args={[0.1]} />
                <meshBasicMaterial color="red" />
            </mesh>

            {/* Connection Line */}
            <DashedLine start={[0, 0, 0]} end={[-x / 2, -0, -z / 2]} opacity={isHovered ? 0.6 : 0.15} />
        </group>
    );
}

function DashedOrbitRing({ radius, dashed = true, opacity = 0.2 }: { radius: number, dashed?: boolean, opacity?: number }) {
    return (
        <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
                <ringGeometry args={[radius, radius + 0.05, 128]} />
                <meshBasicMaterial color="#4F6DF5" transparent opacity={opacity} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
}

function DashedLine({ start, end, opacity }: { start: number[], end: number[], opacity: number }) {
    const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
    const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

    return (
        <line geometry={lineGeometry}>
            <lineBasicMaterial color="#4F6DF5" transparent opacity={opacity} />
        </line>
    )
}
