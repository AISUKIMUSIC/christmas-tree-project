
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Instance, Instances } from '@react-three/drei';

// --- Assets & Geometries ---

// 1. Candy Cane Geometry & Material
const CandyCane = ({ ...props }) => {
  const { geometry, material } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 2, 0),
      new THREE.Vector3(0.2, 2.4, 0),
      new THREE.Vector3(0.6, 2.3, 0),
      new THREE.Vector3(0.7, 1.8, 0),
    ]);
    const geo = new THREE.TubeGeometry(curve, 32, 0.08, 16, false);
    geo.translate(0, -1, 0); // Center slightly
    
    // Custom Striped Shader
    const mat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        void main() {
          // Diagonal stripes
          float stripes = step(0.5, fract(vUv.x * 20.0 + vUv.y * 2.0));
          vec3 red = vec3(0.8, 0.0, 0.1);
          vec3 white = vec3(1.0, 0.95, 0.9);
          gl_FragColor = vec4(mix(white, red, stripes), 1.0);
        }
      `,
    });
    return { geometry: geo, material: mat };
  }, []);

  return <mesh geometry={geometry} material={material} {...props} castShadow />;
};

// 2. Christmas Stocking Component
const Stocking = ({ ...props }) => {
  return (
    <group {...props}>
      {/* Leg */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 1.2, 16]} />
        <meshStandardMaterial color="#800020" roughness={0.8} />
      </mesh>
      {/* Foot */}
      <mesh position={[0.2, 0.1, 0]} rotation={[0, 0, -0.2]} castShadow>
        <capsuleGeometry args={[0.16, 0.6, 4, 16]} />
        <meshStandardMaterial color="#800020" roughness={0.8} />
      </mesh>
      {/* Cuff */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <torusGeometry args={[0.2, 0.08, 16, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      {/* Heel/Toe Accents */}
      <mesh position={[0.4, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.165, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
    </group>
  );
};

export const EnvironmentDecor: React.FC = () => {
  // Generate random positions for decorations
  const decorations = useMemo(() => {
    const items = [];
    // Candy Canes
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 6 + Math.random() * 4;
      items.push({
        type: 'cane',
        position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
        rotation: [Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.2],
        scale: 0.8 + Math.random() * 0.4
      });
    }
    // Stockings (Lying on ground)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.random();
      const radius = 5 + Math.random() * 3;
      items.push({
        type: 'stocking',
        position: [Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius],
        rotation: [Math.PI / 2, Math.random() * Math.PI, 0], // Lying flat
        scale: 0.6 + Math.random() * 0.2
      });
    }
    return items;
  }, []);

  return (
    <group position={[0, -5, 0]}>
      
      {decorations.map((item, i) => (
        <group key={i} position={item.position as any} rotation={item.rotation as any} scale={item.scale}>
          {item.type === 'cane' ? <CandyCane /> : <Stocking />}
        </group>
      ))}

      {/* Add a few luxury gold spheres on the ground too */}
      {[...Array(5)].map((_, i) => (
         <mesh key={`gold-${i}`} position={[Math.sin(i)*8, 0.5, Math.cos(i)*8]} castShadow>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
         </mesh>
      ))}
    </group>
  );
};
