import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, PerspectiveCamera, Stars } from '@react-three/drei';

const StarField = () => {
  return (
    <Stars 
      radius={100} 
      depth={50} 
      count={2000} // Reduced for performance
      factor={4} 
      saturation={0} 
      fade 
      speed={1} 
    />
  );
};

const CustomParticles = (props) => {
    const ref = useRef();
    
    // Generate particles in a galaxy-like spiral
    const positions = useMemo(() => {
        const count = 1000; // Reduced for performance
        const temp = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 3 + Math.random() * 7; // Ring-like structure
            
            const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.5;
            const y = (Math.random() - 0.5) * 1.5;
            const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.5;

            temp[i * 3] = x;
            temp[i * 3 + 1] = y;
            temp[i * 3 + 2] = z;
        }
        return temp;
    }, []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta / 25; // Slow rotation
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 8]}>
            <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    vertexColors={false}
                    color="#fbbf24" // Amber/Gold color
                    size={0.015}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    );
};

const ElegantShapes = () => {
    return (
        <Float speed={2} rotationIntensity={0.8} floatIntensity={1}>
             {/* Center-ish shape */}
             <mesh position={[2, 0, -5]} scale={0.8}>
                <torusKnotGeometry args={[1, 0.3, 64, 8]} /> {/* Lower polygon count */}
                <meshStandardMaterial 
                    color="#4338ca" // Indigo
                    emissive="#4338ca"
                    emissiveIntensity={0.5}
                    roughness={0.1} 
                    metalness={0.8} 
                    transparent 
                    opacity={0.8} 
                    wireframe={true}
                />
            </mesh>
            
            {/* Left shape */}
            <mesh position={[-3, 2, -6]} scale={0.6}>
                <icosahedronGeometry args={[1, 0]} /> {/* Lowest detail */}
                <meshStandardMaterial 
                    color="#f59e0b" // Amber
                    roughness={0} 
                    metalness={1}
                />
            </mesh>
            
            {/* Right shape */}
            <mesh position={[3, -2, -4]} scale={0.5}>
                <octahedronGeometry />
                <meshStandardMaterial 
                    color="#d946ef" // Fuchsia
                    roughness={0} 
                    metalness={0.5} 
                    transparent 
                    opacity={0.6}
                />
            </mesh>
        </Float>
    )
}

const Background3D = React.memo(() => {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-[#0f172a] overflow-hidden">
      <Canvas dpr={[1, 1]} camera={{ position: [0, 0, 5], fov: 60 }} gl={{ powerPreference: "high-performance", antialias: false, stencil: false, depth: false }}>
        <fog attach="fog" args={['#0f172a', 5, 20]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#fbbf24" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#4338ca" />
        
        <StarField />
        <CustomParticles />
        <ElegantShapes />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-[#0f172a] opacity-80 pointer-events-none"></div>
    </div>
  );
});

export default Background3D;
