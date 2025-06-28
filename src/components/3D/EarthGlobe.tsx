
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, useTexture } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import { Mesh } from 'three';

function Globe() {
  const meshRef = useRef<Mesh>(null);
  
  // Auto-rotate the globe
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2; // Slow rotation
    }
  });

  return (
    <Sphere ref={meshRef} args={[2, 64, 64]}>
      <meshStandardMaterial
        color="#4a90e2"
        metalness={0.4}
        roughness={0.7}
      />
    </Sphere>
  );
}

function LoadingFallback() {
  return (
    <Sphere args={[2, 32, 32]}>
      <meshStandardMaterial color="#374151" wireframe />
    </Sphere>
  );
}

export function EarthGlobe() {
  return (
    <div className="w-full h-96 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#06b6d4" />
        
        {/* Globe */}
        <Suspense fallback={<LoadingFallback />}>
          <Globe />
        </Suspense>
        
        {/* Stars background */}
        <mesh>
          <sphereGeometry args={[50, 32, 32]} />
          <meshBasicMaterial color="#000011" side={2} />
        </mesh>
        
        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxDistance={15}
          minDistance={5}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
