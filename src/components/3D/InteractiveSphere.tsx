
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useRef } from 'react';
import { Mesh } from 'three';

function AnimatedSphere() {
  const meshRef = useRef<Mesh>(null);

  return (
    <Sphere ref={meshRef} args={[1, 100, 200]} scale={2}>
      <MeshDistortMaterial
        color="#7c3aed"
        attach="material"
        distort={0.3}
        speed={1.5}
        roughness={0.4}
      />
    </Sphere>
  );
}

export function InteractiveSphere() {
  return (
    <div className="w-full h-64 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 2, 2]} intensity={1} />
        <pointLight position={[-2, -2, -2]} intensity={0.5} color="#06b6d4" />
        
        <AnimatedSphere />
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxDistance={8}
          minDistance={2}
        />
      </Canvas>
    </div>
  );
}
