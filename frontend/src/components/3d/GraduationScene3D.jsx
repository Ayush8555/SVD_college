import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Performance-optimized Graduation Cap 3D Model
const GraduationCap = ({ mousePosition }) => {
  const groupRef = useRef();
  const tassleRef = useRef();
  const frameCount = useRef(0);
  
  useFrame((state) => {
    // Optimize: Update only every 2nd frame
    frameCount.current++;
    if (frameCount.current % 2 !== 0) return;
    
    if (groupRef.current) {
      const targetRotationY = mousePosition.x * 0.3;
      const targetRotationX = mousePosition.y * 0.2;
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotationY,
        0.03
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotationX + 0.2,
        0.03
      );
      
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
    }
    
    if (tassleRef.current) {
      tassleRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.12;
    }
  });

  // Memoize geometries to prevent recreation
  const capGeometry = useMemo(() => new THREE.BoxGeometry(1.8, 0.08, 1.8), []);
  const borderGeometry = useMemo(() => new THREE.BoxGeometry(1.85, 0.02, 1.85), []);
  const domeGeometry = useMemo(() => new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), []);
  const buttonGeometry = useMemo(() => new THREE.CylinderGeometry(0.08, 0.08, 0.06, 8), []);
  const cordGeometry = useMemo(() => new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6), []);
  const coneGeometry = useMemo(() => new THREE.ConeGeometry(0.06, 0.15, 6), []);

  // Memoize materials
  const capMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#1a1a2e",
    metalness: 0.3,
    roughness: 0.4
  }), []);
  
  const goldMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffa31a",
    metalness: 0.6,
    roughness: 0.3,
    emissive: "#ff8f00",
    emissiveIntensity: 0.15
  }), []);

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.2}>
      <mesh position={[0, 0.15, 0]} geometry={capGeometry} material={capMaterial} />
      <mesh position={[0, 0.2, 0]} geometry={borderGeometry} material={goldMaterial} />
      <mesh position={[0, -0.1, 0]} geometry={domeGeometry} material={capMaterial} />
      <mesh position={[0, 0.25, 0]} geometry={buttonGeometry} material={goldMaterial} />
      
      <group ref={tassleRef} position={[0, 0.25, 0]}>
        <mesh position={[0.4, -0.2, 0]} rotation={[0, 0, -0.5]} geometry={cordGeometry} material={goldMaterial} />
        <mesh position={[0.6, -0.45, 0]} geometry={coneGeometry} material={goldMaterial} />
      </group>
    </group>
  );
};

// Reduced Knowledge Orbs (fewer objects)
const KnowledgeOrbs = () => {
  const orbsRef = useRef([]);
  const count = 6; // Reduced from 12
  const frameCount = useRef(0);
  
  const positions = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 5,
      y: (Math.random() - 0.5) * 3,
      z: (Math.random() - 0.5) * 2 - 2,
      speed: 0.3 + Math.random() * 0.3,
      offset: Math.random() * Math.PI * 2
    }));
  }, []);

  const orbGeometry = useMemo(() => new THREE.SphereGeometry(0.05, 8, 8), []);
  
  const materials = useMemo(() => [
    new THREE.MeshBasicMaterial({ color: "#4d94ff", transparent: true, opacity: 0.7 }),
    new THREE.MeshBasicMaterial({ color: "#ffa31a", transparent: true, opacity: 0.7 }),
    new THREE.MeshBasicMaterial({ color: "#a855f7", transparent: true, opacity: 0.7 })
  ], []);

  useFrame((state) => {
    frameCount.current++;
    if (frameCount.current % 3 !== 0) return;
    
    orbsRef.current.forEach((orb, i) => {
      if (orb) {
        const pos = positions[i];
        orb.position.y = pos.y + Math.sin(state.clock.elapsedTime * pos.speed + pos.offset) * 0.2;
      }
    });
  });

  return (
    <>
      {positions.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => (orbsRef.current[i] = el)}
          position={[pos.x, pos.y, pos.z]}
          geometry={orbGeometry}
          material={materials[i % 3]}
        />
      ))}
    </>
  );
};

// Optimized Scene Component
const Scene = ({ mousePosition }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[0, 2, 0]} intensity={0.3} color="#ffa31a" />
      
      <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.2}>
        <GraduationCap mousePosition={mousePosition} />
      </Float>
      
      {/* Reduced sparkle count */}
      <Sparkles count={40} scale={4} size={1.5} speed={0.3} opacity={0.5} color="#ffa31a" />
      
      <KnowledgeOrbs />
    </>
  );
};

// Main Export Component with throttled mouse
const GraduationScene3D = ({ className = '' }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const lastUpdate = useRef(0);

  const handleMouseMove = useCallback((event) => {
    const now = Date.now();
    if (now - lastUpdate.current < 50) return; // Throttle to 20fps max
    lastUpdate.current = now;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    setMousePosition({ x, y });
  }, []);

  return (
    <div 
      className={`absolute inset-0 ${className}`}
      onMouseMove={handleMouseMove}
      style={{ pointerEvents: 'auto' }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ 
          antialias: false, // Disable for performance
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        dpr={[0.75, 1]} // Lower resolution for performance
        frameloop="demand" // Only render when needed
        style={{ background: 'transparent' }}
      >
        <React.Suspense fallback={null}>
          <Scene mousePosition={mousePosition} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default GraduationScene3D;
