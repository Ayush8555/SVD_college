import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Stars } from '@react-three/drei';

/**
 * Custom moving particles in a ring pattern
 */
const CustomParticles = (props) => {
    const ref = useRef();
    
    // Generate particles in a ring-like pattern
    const positions = useMemo(() => {
        const count = 800;
        const temp = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 3 + Math.random() * 7;
            
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
            ref.current.rotation.y += delta / 15; // Rotation speed
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 8]}>
            <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    vertexColors={false}
                    color="#fbbf24"
                    size={0.02}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.7}
                />
            </Points>
        </group>
    );
};

/**
 * Background with moving stars and custom particles
 */
const Background3D = React.memo(() => {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-[#0f172a] overflow-hidden">
      <Canvas 
        dpr={[1, 1]} 
        camera={{ position: [0, 0, 5], fov: 60 }} 
        gl={{ powerPreference: "high-performance", antialias: false, stencil: false, depth: false }}
      >
        <Stars 
          radius={100} 
          depth={50} 
          count={3000}
          factor={4} 
          saturation={0} 
          fade 
          speed={2}
        />
        <CustomParticles />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-[#0f172a] opacity-50 pointer-events-none"></div>
    </div>
  );
});

export default Background3D;
