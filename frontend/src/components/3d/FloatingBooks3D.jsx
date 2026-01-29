import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// Simplified Single Book Component
const Book = ({ position, rotation, color, delay = 0, size = 1 }) => {
  const bookRef = useRef();
  const frameCount = useRef(0);
  
  useFrame((state) => {
    frameCount.current++;
    if (frameCount.current % 3 !== 0) return;
    
    if (bookRef.current) {
      bookRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2 + delay) * 0.08;
    }
  });

  const bookWidth = 0.8 * size;
  const bookHeight = 1.1 * size;
  const bookDepth = 0.12 * size;

  const bookMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.1,
    roughness: 0.6
  }), [color]);

  const pageMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: "#faf8f5" }), []);

  return (
    <group ref={bookRef} position={position} rotation={rotation}>
      <RoundedBox args={[bookWidth, bookHeight, bookDepth]} radius={0.02} smoothness={2}>
        <primitive object={bookMaterial} attach="material" />
      </RoundedBox>
      <mesh position={[0.02, 0, 0]}>
        <boxGeometry args={[bookWidth * 0.85, bookHeight * 0.95, bookDepth * 0.7]} />
        <primitive object={pageMaterial} attach="material" />
      </mesh>
    </group>
  );
};

// Reduced Book Stack (3 books instead of 5)
const BookStack = () => {
  const books = useMemo(() => [
    { position: [-2.2, 0.3, -1], rotation: [0.1, 0.3, 0.1], color: '#1a4b8c', delay: 0, size: 0.85 },
    { position: [2.5, -0.2, -0.5], rotation: [-0.1, -0.4, 0.15], color: '#8b1a1a', delay: 1, size: 0.9 },
    { position: [-1.8, -0.8, 0], rotation: [0.2, 0.5, -0.1], color: '#1a5c3a', delay: 2, size: 0.8 },
  ], []);

  return (
    <group>
      {books.map((book, index) => (
        <Float
          key={index}
          speed={1}
          rotationIntensity={0.2}
          floatIntensity={0.25}
          floatingRange={[-0.05, 0.05]}
        >
          <Book {...book} />
        </Float>
      ))}
    </group>
  );
};

// Scene
const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <BookStack />
    </>
  );
};

// Main Export
const FloatingBooks3D = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
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
          <Scene />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default FloatingBooks3D;
