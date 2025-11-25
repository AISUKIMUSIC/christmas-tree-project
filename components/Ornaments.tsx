import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState, OrnamentData } from '../types';

interface BaseOrnamentGroupProps {
  treeState: TreeState;
  type: 'ball' | 'light';
  count: number;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}

const BaseOrnamentGroup: React.FC<BaseOrnamentGroupProps> = ({ treeState, type, count, geometry, material }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate data
  const data = useMemo(() => {
    const items: OrnamentData[] = [];
    const treeHeight = 14;
    const baseRadius = 5.5;

    const colors = type === 'ball' 
      ? ['#D4AF37', '#C0C0C0', '#B22222', '#FFFFFF'] 
      : ['#FFD700']; // Lights are just gold

    for (let i = 0; i < count; i++) {
      // Chaos: Random space
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 20 + Math.random() * 20;
      const cx = r * Math.sin(phi) * Math.cos(theta);
      const cy = r * Math.sin(phi) * Math.sin(theta);
      const cz = r * Math.cos(phi);

      // Target: Tree Surface
      const y = Math.random() * treeHeight - (treeHeight / 2) + 2;
      const normHeight = (y - 2 + (treeHeight/2)) / treeHeight;
      const coneRadius = (1 - normHeight) * baseRadius;
      
      const radius = coneRadius + 0.2; // Balls/Lights slightly outside foliage
      const angle = Math.random() * Math.PI * 2;
      const tx = Math.cos(angle) * radius;
      const tz = Math.sin(angle) * radius;

      const speed = type === 'ball' ? 2.5 : 4.0;
      const scale = type === 'ball' ? 0.25 + Math.random() * 0.2 : 0.1;

      items.push({
        id: i,
        type,
        color: colors[Math.floor(Math.random() * colors.length)],
        positions: {
          chaos: [cx, cy, cz],
          target: [tx, y, tz],
        },
        scale,
        speed: speed + Math.random()
      });
    }
    return items;
  }, [count, type]);

  const currentPositions = useRef(new Float32Array(count * 3));
  
  useMemo(() => {
    data.forEach((item, i) => {
      currentPositions.current[i * 3] = item.positions.chaos[0];
      currentPositions.current[i * 3 + 1] = item.positions.chaos[1];
      currentPositions.current[i * 3 + 2] = item.positions.chaos[2];
    });
  }, [data]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const isFormed = treeState === TreeState.FORMED;

    data.forEach((item, i) => {
      const tx = isFormed ? item.positions.target[0] : item.positions.chaos[0];
      const ty = isFormed ? item.positions.target[1] : item.positions.chaos[1];
      const tz = isFormed ? item.positions.target[2] : item.positions.chaos[2];

      const idx = i * 3;
      const cx = currentPositions.current[idx];
      const cy = currentPositions.current[idx + 1];
      const cz = currentPositions.current[idx + 2];

      const lerpFactor = THREE.MathUtils.clamp(delta * item.speed * 0.5, 0, 1);
      
      const nx = THREE.MathUtils.lerp(cx, tx, lerpFactor);
      const ny = THREE.MathUtils.lerp(cy, ty, lerpFactor);
      const nz = THREE.MathUtils.lerp(cz, tz, lerpFactor);

      currentPositions.current[idx] = nx;
      currentPositions.current[idx + 1] = ny;
      currentPositions.current[idx + 2] = nz;

      dummy.position.set(nx, ny, nz);
      dummy.scale.setScalar(item.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, new THREE.Color(item.color));
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} />
  );
};

// Specialized component for detailed Gifts
const GiftOrnamentGroup: React.FC<{ treeState: TreeState; count: number }> = ({ treeState, count }) => {
  const boxRef = useRef<THREE.InstancedMesh>(null);
  const ribbon1Ref = useRef<THREE.InstancedMesh>(null);
  const ribbon2Ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Geometries
  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  // Horizontal Ribbon
  const ribbon1Geo = useMemo(() => new THREE.BoxGeometry(1.02, 0.2, 1.02), []); 
  // Vertical Ribbon
  const ribbon2Geo = useMemo(() => new THREE.BoxGeometry(0.2, 1.02, 1.02), []);

  const boxMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    metalness: 0.3, roughness: 0.4 
  }), []);
  const ribbonMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    metalness: 1.0, roughness: 0.1, color: '#FFD700' // Gold ribbons
  }), []);

  // Gift specific data
  const data = useMemo(() => {
    const items: (OrnamentData & { rotSpeed: [number, number, number] })[] = [];
    const treeHeight = 14;
    const baseRadius = 5.5;
    // Luxury Gift Colors
    const colors = ['#800020', '#004225', '#191970', '#FFFFFF']; // Burgundy, Emerald, Midnight Blue, White

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 20 + Math.random() * 20;
      const cx = r * Math.sin(phi) * Math.cos(theta);
      const cy = r * Math.sin(phi) * Math.sin(theta);
      const cz = r * Math.cos(phi);

      const y = Math.random() * treeHeight - (treeHeight / 2) + 2;
      const normHeight = (y - 2 + (treeHeight/2)) / treeHeight;
      const coneRadius = (1 - normHeight) * baseRadius;
      
      const radius = coneRadius + 0.8; // Gifts stick out more
      const angle = Math.random() * Math.PI * 2;
      const tx = Math.cos(angle) * radius;
      const tz = Math.sin(angle) * radius;

      items.push({
        id: i,
        type: 'gift',
        color: colors[Math.floor(Math.random() * colors.length)],
        positions: {
          chaos: [cx, cy, cz],
          target: [tx, y, tz],
        },
        scale: 0.5 + Math.random() * 0.4,
        speed: 1.0 + Math.random(), // Slower, heavier
        rotSpeed: [Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5]
      });
    }
    return items;
  }, [count]);

  const currentPositions = useRef(new Float32Array(count * 3));
  
  // Initial fill
  useMemo(() => {
    data.forEach((item, i) => {
      currentPositions.current[i * 3] = item.positions.chaos[0];
      currentPositions.current[i * 3 + 1] = item.positions.chaos[1];
      currentPositions.current[i * 3 + 2] = item.positions.chaos[2];
    });
  }, [data]);

  useFrame((_, delta) => {
    if (!boxRef.current || !ribbon1Ref.current || !ribbon2Ref.current) return;
    const isFormed = treeState === TreeState.FORMED;

    data.forEach((item, i) => {
      const tx = isFormed ? item.positions.target[0] : item.positions.chaos[0];
      const ty = isFormed ? item.positions.target[1] : item.positions.chaos[1];
      const tz = isFormed ? item.positions.target[2] : item.positions.chaos[2];

      const idx = i * 3;
      const cx = currentPositions.current[idx];
      const cy = currentPositions.current[idx + 1];
      const cz = currentPositions.current[idx + 2];

      const lerpFactor = THREE.MathUtils.clamp(delta * item.speed * 0.5, 0, 1);
      
      const nx = THREE.MathUtils.lerp(cx, tx, lerpFactor);
      const ny = THREE.MathUtils.lerp(cy, ty, lerpFactor);
      const nz = THREE.MathUtils.lerp(cz, tz, lerpFactor);

      currentPositions.current[idx] = nx;
      currentPositions.current[idx + 1] = ny;
      currentPositions.current[idx + 2] = nz;

      dummy.position.set(nx, ny, nz);
      dummy.scale.setScalar(item.scale);
      
      // Self rotation logic
      // We use a pseudo-random rotation based on time and item ID to keep it deterministic but animated
      const time = performance.now() * 0.001;
      dummy.rotation.x = time * item.rotSpeed[0] + i;
      dummy.rotation.y = time * item.rotSpeed[1] + i;
      dummy.rotation.z = time * item.rotSpeed[2] + i;

      dummy.updateMatrix();

      // Apply same matrix to box and ribbons
      boxRef.current!.setMatrixAt(i, dummy.matrix);
      ribbon1Ref.current!.setMatrixAt(i, dummy.matrix);
      ribbon2Ref.current!.setMatrixAt(i, dummy.matrix);
      
      boxRef.current!.setColorAt(i, new THREE.Color(item.color));
      // Ribbons stay Gold (default material color)
    });

    boxRef.current.instanceMatrix.needsUpdate = true;
    ribbon1Ref.current.instanceMatrix.needsUpdate = true;
    ribbon2Ref.current.instanceMatrix.needsUpdate = true;
    if (boxRef.current.instanceColor) boxRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={boxRef} args={[boxGeo, boxMat, count]} />
      <instancedMesh ref={ribbon1Ref} args={[ribbon1Geo, ribbonMat, count]} />
      <instancedMesh ref={ribbon2Ref} args={[ribbon2Geo, ribbonMat, count]} />
    </group>
  );
};

const Ornaments: React.FC<{ treeState: TreeState }> = ({ treeState }) => {
  const ballGeo = useMemo(() => new THREE.SphereGeometry(1, 32, 32), []);
  const ballMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    metalness: 0.9, 
    roughness: 0.1,
    envMapIntensity: 1.5 
  }), []);

  const lightGeo = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);
  const lightMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    toneMapped: false,
    color: new THREE.Color('#FFD700').multiplyScalar(2)
  }), []);

  return (
    <group>
      <BaseOrnamentGroup 
        treeState={treeState} 
        type="ball" 
        count={250} 
        geometry={ballGeo} 
        material={ballMat} 
      />
      <GiftOrnamentGroup 
        treeState={treeState}
        count={45}
      />
       <BaseOrnamentGroup 
        treeState={treeState} 
        type="light" 
        count={400} 
        geometry={lightGeo} 
        material={lightMat} 
      />
    </group>
  );
};

export default Ornaments;