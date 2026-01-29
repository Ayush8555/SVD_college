import React, { useRef, useMemo, useCallback, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Lightweight Particle System
const ParticleField = ({ mousePosition }) => {
  const meshRef = useRef();
  const count = 500; // Reduced from 2000
  const frameCount = useRef(0);
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const colorPalette = [
      new THREE.Color('#4d94ff'),
      new THREE.Color('#ffa31a'),
      new THREE.Color('#a855f7'),
    ];
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2 + Math.random() * 3;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = (Math.random() - 0.5) * 4 - 1;
      
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    
    return [positions, colors];
  }, []);

  const originalPositions = useMemo(() => new Float32Array(positions), [positions]);

  useFrame((state) => {
    frameCount.current++;
    if (frameCount.current % 4 !== 0) return; // Update every 4th frame only
    
    if (!meshRef.current) return;
    
    const positionAttribute = meshRef.current.geometry.attributes.position;
    const posArray = positionAttribute.array;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const origY = originalPositions[i3 + 1];
      const wave = Math.sin(time * 0.3 + i * 0.02) * 0.15;
      posArray[i3 + 1] = origY + wave;
    }
    
    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Scene
const Scene = ({ mousePosition }) => {
  return <ParticleField mousePosition={mousePosition} />;
};

// Main Export - Lightweight
const ParticleUniverse = ({ className = '' }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const lastUpdate = useRef(0);

  const handleMouseMove = useCallback((event) => {
    const now = Date.now();
    if (now - lastUpdate.current < 100) return; // Throttle heavily
    lastUpdate.current = now;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    setMousePosition({ x, y });
  }, []);

  return (
    <div className={`absolute inset-0 ${className}`} onMouseMove={handleMouseMove}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 60 }}
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
          <Scene mousePosition={mousePosition} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default ParticleUniverse;
