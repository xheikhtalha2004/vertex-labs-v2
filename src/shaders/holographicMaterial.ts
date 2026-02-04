/**
 * Holographic Material Shader
 * Creates a sci-fi holographic effect with Fresnel glow, scanlines, and glitch.
 * Used for hover states on service cards and project thumbnails.
 */

export const holographicVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const holographicFragment = /* glsl */ `
  uniform float u_time;
  uniform float u_hover;
  uniform vec3 u_baseColor;
  uniform vec3 u_fresnelColor;
  uniform float u_fresnelPower;
  uniform float u_scanlineSpeed;
  uniform float u_scanlineCount;
  uniform float u_glitchIntensity;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  
  // Random function for glitch
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    
    // Fresnel effect for edge glow
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), u_fresnelPower);
    
    // Scanlines
    float scanline = sin(vUv.y * u_scanlineCount + u_time * u_scanlineSpeed) * 0.5 + 0.5;
    scanline = pow(scanline, 3.0) * 0.3;
    
    // Glitch distortion (only on hover)
    float glitch = 0.0;
    if (u_hover > 0.0 && u_glitchIntensity > 0.0) {
      float glitchTrigger = step(0.99, random(vec2(floor(u_time * 10.0), 0.0)));
      float glitchLine = step(0.98, random(vec2(vUv.y * 20.0, floor(u_time * 20.0))));
      glitch = glitchTrigger * glitchLine * u_glitchIntensity * u_hover;
    }
    
    // Combine colors
    vec3 baseWithScanline = u_baseColor + scanline * u_fresnelColor * 0.2;
    vec3 fresnelGlow = u_fresnelColor * fresnel * (0.5 + u_hover * 0.5);
    
    vec3 finalColor = baseWithScanline + fresnelGlow + vec3(glitch);
    
    // Alpha based on fresnel and hover
    float alpha = 0.3 + fresnel * 0.5 + u_hover * 0.2;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Default uniforms
export const holographicUniforms = {
    u_time: { value: 0 },
    u_hover: { value: 0 }, // 0 = not hovering, 1 = hovering
    u_baseColor: { value: [0.05, 0.08, 0.15] },
    u_fresnelColor: { value: [0.31, 0.43, 0.96] }, // #4F6DF5
    u_fresnelPower: { value: 2.5 },
    u_scanlineSpeed: { value: 5.0 },
    u_scanlineCount: { value: 100.0 },
    u_glitchIntensity: { value: 0.3 },
};
