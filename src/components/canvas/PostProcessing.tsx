import {
    EffectComposer,
    Bloom,
    Vignette,
    ChromaticAberration,
    Noise,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface PostProcessingProps {
    /** Force disable all effects */
    disabled?: boolean;
    /** Performance tier: 'high' | 'mid' | 'low' */
    tier?: 'high' | 'mid' | 'low';
}

/**
 * Cinematic post-processing effects pipeline.
 * Automatically respects reduced motion preferences and
 * implements performance tiering for low-end devices.
 */
export default function PostProcessing({
    disabled = false,
    tier = 'high',
}: PostProcessingProps) {
    const prefersReducedMotion = useReducedMotion();

    // Disable effects if user prefers reduced motion or explicitly disabled
    if (disabled || prefersReducedMotion || tier === 'low') {
        return null;
    }

    return (
        <EffectComposer multisampling={tier === 'high' ? 8 : 0}>
            {/* Bloom for emissive glow (hero crystal, LEDs) */}
            <Bloom
                intensity={tier === 'high' ? 0.4 : 0.2}
                luminanceThreshold={0.8}
                luminanceSmoothing={0.9}
                mipmapBlur
            />

            {/* Subtle chromatic aberration for "tech" feel */}
            {tier === 'high' && (
                <ChromaticAberration
                    offset={new Vector2(0.0005, 0.0005)}
                    blendFunction={BlendFunction.NORMAL}
                    radialModulation={false}
                    modulationOffset={0.5}
                />
            )}

            {/* Film grain for organic texture */}
            <Noise
                opacity={0.03}
                blendFunction={BlendFunction.OVERLAY}
            />

            {/* Vignette for cinematic framing */}
            <Vignette
                offset={0.3}
                darkness={0.5}
                blendFunction={BlendFunction.NORMAL}
            />
        </EffectComposer>
    );
}
