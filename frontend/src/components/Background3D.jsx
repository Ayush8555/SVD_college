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
    const count = props.count || 1000;
    
    // Generate particles in a random distribution
    const positions = useMemo(() => {
        const temp = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20; // Spread out randomly
            const y = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 20;

            temp[i * 3] = x;
            temp[i * 3 + 1] = y;
            temp[i * 3 + 2] = z;
        }
        return temp;
    }, [count]);

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



const Background3D = React.memo(() => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Performance optimization: fewer particles on mobile
  const particleCount = isMobile ? 400 : 2000; // Balanced for desktop
  const starCount = isMobile ? 1000 : 2000;    // As requested

  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-[#0f172a] overflow-hidden">
      <Canvas dpr={[1, 1]} camera={{ position: [0, 0, 5], fov: 60 }} gl={{ powerPreference: "high-performance", antialias: false, stencil: false, depth: false }}>
        <fog attach="fog" args={['#0f172a', 5, 20]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#fbbf24" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#4338ca" />
        
        <Stars 
          radius={100} 
          depth={50} 
          count={starCount} 
          factor={4} 
          saturation={0} 
          fade 
          speed={3} // Faster twinkling 
        />
        <CustomParticles count={particleCount} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-[#0f172a] opacity-80 pointer-events-none"></div>
    </div>
  );
});

export default Background3D;
