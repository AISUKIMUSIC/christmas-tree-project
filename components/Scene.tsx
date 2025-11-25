
import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import { TreeState } from '../types';

interface SceneProps {
  treeState: TreeState;
}

const Scene: React.FC<SceneProps> = ({ treeState }) => {
  const treeGroupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    // Continuous rotation for the tree only
    if (treeGroupRef.current) {
         treeGroupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <>
      <color attach="background" args={['#050505']} />
      
      {/* 
          Lowered Y to 0 and increased Z to 35 to frame the full tree.
      */}
      <PerspectiveCamera makeDefault position={[0, 0, 35]} fov={50} />
      
      <OrbitControls 
        target={[0, -2, 0]} // Focus slightly lower on the tree's body
        enablePan={false} 
        maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going under the ground
        minDistance={10} 
        maxDistance={60} 
        autoRotate={false}
      />

      {/* Lighting - Luxury Setup */}
      <ambientLight intensity={0.2} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        color="#FFD700" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#00ffaa" />
      
      {/* 
          Using direct URL for HDRI to avoid "Failed to fetch" errors.
      */}
      <Environment 
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/st_fagans_interior_1k.hdr" 
        background={false} 
      />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Rotating Tree Group */}
      <group ref={treeGroupRef} position={[0, -5, 0]}>
        <Foliage treeState={treeState} />
        <Ornaments treeState={treeState} />
      </group>

      {/* Post Processing for Cinematic Feel */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.8} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.4} 
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default Scene;
