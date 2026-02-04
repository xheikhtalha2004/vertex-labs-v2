/**
 * Grid Distortion Shader
 * Creates an animated topological grid that undulates like a data flow visualization.
 * Used for the hero background to represent "engineering" and "computation."
 */

export const gridDistortionVertex = /* glsl */ `
  uniform float u_time;
  uniform float u_amplitude;
  uniform float u_frequency;
  uniform vec2 u_mouse;
  
  varying vec2 vUv;
  varying float vElevation;
  
  // Simplex noise function for organic movement
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  void main() {
    vUv = uv;
    
    vec3 pos = position;
    
    // Multi-layered wave distortion
    float wave1 = sin(pos.x * u_frequency + u_time * 0.5) * u_amplitude;
    float wave2 = sin(pos.y * u_frequency * 0.8 + u_time * 0.3) * u_amplitude * 0.5;
    float noise = snoise(pos.xy * 0.5 + u_time * 0.1) * u_amplitude * 0.3;
    
    // Mouse influence - create ripple effect near cursor
    // Map u_mouse (which is -1 to 1) to world coordinates. 
    // Assuming plane size is large, we multiply by a larger factor to cover the screen.
    float mouseDistance = length(pos.xy - u_mouse * 15.0); 
    
    // Increased interaction radius and strength
    float mouseInfluence = smoothstep(6.0, 0.0, mouseDistance) * 3.0; // Stronger push
    
    // Combine all distortions
    float elevation = wave1 + wave2 + noise + mouseInfluence;
    pos.z += elevation;
    
    vElevation = elevation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const gridDistortionFragment = /* glsl */ `
  uniform float u_time;
  uniform vec3 u_baseColor;
  uniform vec3 u_highlightColor;
  
  varying vec2 vUv;
  varying float vElevation;
  
  void main() {
    // Grid lines
    float gridX = abs(fract(vUv.x * 20.0 - 0.5) - 0.5) / fwidth(vUv.x * 20.0);
    float gridY = abs(fract(vUv.y * 20.0 - 0.5) - 0.5) / fwidth(vUv.y * 20.0);
    float grid = 1.0 - min(min(gridX, gridY), 1.0);
    
    // Color based on elevation
    float elevationMix = smoothstep(-0.3, 0.3, vElevation);
    vec3 color = mix(u_baseColor, u_highlightColor, elevationMix);
    
    // Apply grid pattern
    color = mix(color * 0.1, color, grid * 0.3 + 0.1);
    
    // Add subtle glow at peaks
    float glow = smoothstep(0.1, 0.3, vElevation) * 0.3;
    color += u_highlightColor * glow;
    
    // Fade at edges
    float edgeFade = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
    edgeFade *= smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
    
    gl_FragColor = vec4(color, grid * 0.6 * edgeFade);
  }
`;

// Default uniforms
export const gridDistortionUniforms = {
  u_time: { value: 0 },
  u_amplitude: { value: 0.15 },
  u_frequency: { value: 2.0 },
  u_mouse: { value: [0, 0] },
  u_baseColor: { value: [0.05, 0.08, 0.12] },
  u_highlightColor: { value: [0.31, 0.43, 0.96] }, // #4F6DF5
};
