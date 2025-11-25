import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

interface FoliageProps {
  treeState: TreeState;
}

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  
  attribute vec3 aTarget;
  attribute float aRandom;
  
  varying float vAlpha;
  varying float vRandom;

  void main() {
    vRandom = aRandom;
    
    // Staggered animation based on randomness for "organic" feel
    float localProgress = smoothstep(0.0, 1.0, (uProgress * 1.5) - (aRandom * 0.5));
    localProgress = clamp(localProgress, 0.0, 1.0);

    // Cubic ease out for snap effect
    float t = 1.0 - pow(1.0 - localProgress, 3.0);
    
    vec3 pos = mix(position, aTarget, t);
    
    // Add subtle wind sway when formed
    if (localProgress > 0.8) {
      float wind = sin(uTime * 2.0 + pos.y * 2.0 + pos.x) * 0.05 * (pos.y / 10.0);
      pos.x += wind;
      pos.z += wind;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = (40.0 * aRandom + 20.0) * (1.0 / -mvPosition.z);
    
    vAlpha = localProgress;
  }
`;

const fragmentShader = `
  varying float vAlpha;
  varying float vRandom;
  uniform vec3 uColor;

  void main() {
    // Circular particle
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    // Gradient glow
    float glow = 1.0 - (dist * 2.0);
    glow = pow(glow, 1.5);

    // Sparkle effect
    vec3 finalColor = uColor;
    if (vRandom > 0.9) {
      finalColor = mix(finalColor, vec3(1.0, 0.9, 0.5), 0.5); // Gold highlights
    }

    gl_FragColor = vec4(finalColor * 2.0, 1.0); // Boost brightness for Bloom
  }
`;

const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const count = 15000; // High count for luxury density

  const { attributes, uniforms } = useMemo(() => {
    const chaosPositions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    const treeHeight = 14;
    const baseRadius = 5;

    for (let i = 0; i < count; i++) {
      // 1. Chaos Position: Random Sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 15 + Math.random() * 15; // Large explosion radius
      
      const cx = r * Math.sin(phi) * Math.cos(theta);
      const cy = r * Math.sin(phi) * Math.sin(theta);
      const cz = r * Math.cos(phi);

      chaosPositions[i * 3] = cx;
      chaosPositions[i * 3 + 1] = cy;
      chaosPositions[i * 3 + 2] = cz;

      // 2. Target Position: Cone
      // Use spiral distribution for even coverage
      const y = Math.random() * treeHeight;
      const coneRadius = (1 - y / treeHeight) * baseRadius;
      const angle = i * 0.1 + Math.random(); // Spiral offset
      const dist = Math.random() * coneRadius; // Volume filling
      
      const tx = Math.cos(angle) * dist;
      const tz = Math.sin(angle) * dist;
      const ty = y - (treeHeight / 2) + 2; // Center vertically

      targetPositions[i * 3] = tx;
      targetPositions[i * 3 + 1] = ty;
      targetPositions[i * 3 + 2] = tz;

      randoms[i] = Math.random();
    }

    return {
      attributes: {
        position: new THREE.BufferAttribute(chaosPositions, 3),
        aTarget: new THREE.BufferAttribute(targetPositions, 3),
        aRandom: new THREE.BufferAttribute(randoms, 1),
      },
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uColor: { value: new THREE.Color('#004225') } // Deep Emerald
      }
    };
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smooth interpolation for the uniform
      const targetProgress = treeState === TreeState.FORMED ? 1 : 0;
      const current = materialRef.current.uniforms.uProgress.value;
      const step = delta * 0.8; // Transition speed
      
      if (Math.abs(current - targetProgress) > 0.001) {
        materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(current, targetProgress, step);
      }
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" {...attributes.position} />
        <bufferAttribute attach="attributes-aTarget" {...attributes.aTarget} />
        <bufferAttribute attach="attributes-aRandom" {...attributes.aRandom} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;