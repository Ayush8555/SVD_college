import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Simplified orbiting element
const OrbitingShape = ({ orbitRadius, speed, startAngle, color, size }) => {
  const groupRef = useRef();
  const meshRef = useRef();
  const frameCount = useRef(0);
  
  const geometry = useMemo(() => new THREE.OctahedronGeometry(size), [size]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.4,
    roughness: 0.4
  }), [color]);
  
  useFrame((state) => {
    frameCount.current++;
    if (frameCount.current % 3 !== 0) return;
    
    if (groupRef.current) {
      const angle = state.clock.elapsedTime * speed + startAngle;
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius * 0.3;
      groupRef.current.position.y = Math.sin(angle) * orbitRadius * 0.2;
    }
    
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.008;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry} material={material} />
    </group>
  );
};

// Central core - simplified
const CentralCore = () => {
  const coreRef = useRef();
  const frameCount = useRef(0);
  
  const coreGeometry = useMemo(() => new THREE.IcosahedronGeometry(0.35, 1), []);
  const coreMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffa31a",
    emissive: "#ff6b00",
    emissiveIntensity: 0.4,
    metalness: 0.7,
    roughness: 0.3
  }), []);
  
  const ringGeometry = useMemo(() => new THREE.TorusGeometry(1.2, 0.008, 8, 32), []);
  const ringMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: "#4d94ff", 
    transparent: true, 
    opacity: 0.25 
  }), []);
  
  useFrame((state) => {
    frameCount.current++;
    if (frameCount.current % 2 !== 0) return;
    
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.2}>
        <mesh ref={coreRef} geometry={coreGeometry} material={coreMaterial} />
      </Float>
      <mesh rotation={[Math.PI / 2, 0, 0]} geometry={ringGeometry} material={ringMaterial} />
    </group>
  );
};

// Simplified Scene with fewer elements
const OrbitScene = () => {
  const orbitingElements = useMemo(() => [
    { orbitRadius: 1.3, speed: 0.4, startAngle: 0, color: '#4d94ff', size: 0.12 },
    { orbitRadius: 1.3, speed: 0.4, startAngle: Math.PI, color: '#22d3ee', size: 0.1 },
    { orbitRadius: 2, speed: 0.25, startAngle: 0.5, color: '#a855f7', size: 0.1 },
    { orbitRadius: 2, speed: 0.25, startAngle: 2.6, color: '#10b981', size: 0.12 },
  ], []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#ffa31a" />
      <directionalLight position={[5, 5, 5]} intensity={0.4} />
      
      <CentralCore />
      
      {orbitingElements.map((props, index) => (
        <OrbitingShape key={index} {...props} />
      ))}
    </>
  );
};

// Main Export
const OrbitingElements3D = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 2, 5], fov: 45 }}
        gl={{ 
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false
        }}
        dpr={0.75}
        frameloop="demand"
        style={{ background: 'transparent' }}
      >
        <React.Suspense fallback={null}>
          <OrbitScene />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default OrbitingElements3D;
