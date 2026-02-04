import { ReactNode, useState, createContext, useContext } from 'react';
import { PerformanceMonitor } from '@react-three/drei';

type PerformanceTierLevel = 'high' | 'mid' | 'low';

interface PerformanceTierContextType {
    tier: PerformanceTierLevel;
    dpr: number;
}

const PerformanceTierContext = createContext<PerformanceTierContextType>({
    tier: 'high',
    dpr: 2,
});

export function usePerformanceTier() {
    return useContext(PerformanceTierContext);
}

interface PerformanceTierProps {
    children: ReactNode;
}

/**
 * Automatic performance tiering component.
 * Monitors FPS and dynamically downgrades rendering quality
 * to maintain smooth experience on lower-end devices.
 */
export default function PerformanceTier({ children }: PerformanceTierProps) {
    const [tier, setTier] = useState<PerformanceTierLevel>('high');
    const [dpr, setDpr] = useState(Math.min(2, window.devicePixelRatio));

    const handleIncline = () => {
        // FPS is good, can upgrade quality
        if (tier === 'low') {
            setTier('mid');
            setDpr(1);
        } else if (tier === 'mid') {
            setTier('high');
            setDpr(Math.min(2, window.devicePixelRatio));
        }
    };

    const handleDecline = () => {
        // FPS dropped, downgrade quality
        if (tier === 'high') {
            setTier('mid');
            setDpr(1);
        } else if (tier === 'mid') {
            setTier('low');
            setDpr(0.75);
        }
    };

    return (
        <PerformanceTierContext.Provider value={{ tier, dpr }}>
            <PerformanceMonitor
                onIncline={handleIncline}
                onDecline={handleDecline}
                flipflops={3} // Number of tier changes before stabilizing
                factor={1} // Initial factor
            >
                {children}
            </PerformanceMonitor>
        </PerformanceTierContext.Provider>
    );
}
