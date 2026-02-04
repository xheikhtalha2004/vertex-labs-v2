import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Lenis from 'lenis';
import { addEffect } from '@react-three/fiber';

interface LenisContextType {
  lenis: Lenis | null;
  scrollProgress: number;
}

const LenisContext = createContext<LenisContextType>({
  lenis: null,
  scrollProgress: 0,
});

export function useLenis() {
  return useContext(LenisContext);
}

export function useScrollProgress() {
  const { scrollProgress } = useContext(LenisContext);
  return scrollProgress;
}

interface LenisProviderProps {
  children: ReactNode;
}

export function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Initialize Lenis with smooth scroll configuration
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Sync Lenis with R3F render loop using addEffect
    // This ensures scroll updates happen within the animation frame
    const unsubscribe = addEffect((time) => {
      lenis.raf(time);
      return true; // Keep the effect running
    });

    // Update scroll progress on scroll
    lenis.on('scroll', ({ progress }: { progress: number }) => {
      setScrollProgress(progress);
    });

    return () => {
      unsubscribe();
      lenis.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current, scrollProgress }}>
      {children}
    </LenisContext.Provider>
  );
}

export default LenisProvider;
