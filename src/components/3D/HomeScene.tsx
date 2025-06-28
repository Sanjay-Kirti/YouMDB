
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Text, Center } from '@react-three/drei';
import { useRef } from 'react';
import { Mesh } from 'three';

function AnimatedBox({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null);

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#7c3aed" />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#06b6d4" />

      {/* Main Text - Using regular Text component as fallback */}
      <Center>
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.3}>
          <Text
            fontSize={1.2}
            color="#06b6d4"
            anchorX="center"
            anchorY="middle"
            position={[0, 0.5, 0]}
            font="/fonts/Inter-Bold.woff"
          >
            YouMDB
          </Text>
        </Float>
      </Center>

      {/* Subtitle */}
      <Center>
        <Float speed={0.8} rotationIntensity={0.3} floatIntensity={0.2}>
          <Text
            fontSize={0.3}
            color="#a855f7"
            anchorX="center"
            anchorY="middle"
            position={[0, -0.5, 0]}
            font="/fonts/Inter-Regular.woff"
          >
            Discover Amazing Creators
          </Text>
        </Float>
      </Center>

      {/* Animated Boxes */}
      <AnimatedBox position={[-3, 2, -2]} />
      <AnimatedBox position={[3, 1, -1]} />
      <AnimatedBox position={[-2, -1, 1]} />
      <AnimatedBox position={[2, -2, 2]} />

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export function HomeScene() {
  return (
    <div className="w-full h-96 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
