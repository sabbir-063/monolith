import { Canvas } from '@react-three/fiber'
import { RoundedBox, ContactShadows, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'

function Brick() {
  // Standard brick proportions ~ 2.15 : 1.0 : 0.65 (L : W : H)
  return (
    <group rotation={[0, -0.5, 0]}>
      <RoundedBox args={[2.3, 0.78, 1.08]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#9b2d20" roughness={0.62} metalness={0.04} />
      </RoundedBox>
      {/* the "frog" — the maker's mark pressed into the top face */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.7, 0.05, 0.66]} />
        <meshStandardMaterial color="#7c2418" roughness={0.75} />
      </mesh>
    </group>
  )
}

export default function Brick3D({ reduced = false }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [3.2, 1.8, 4.2], fov: 32 }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.7} />
        {/* key + fill directional lights are not distance-attenuated, so they read predictably */}
        <directionalLight position={[5, 8, 5]} intensity={3} color="#fff3e6" />
        <directionalLight position={[-5, 3, 2]} intensity={1.1} />
        {/* warm rim from the kiln side */}
        <pointLight position={[-3, 1.5, -3]} intensity={45} color="#e2562a" />

        <Brick />

        <ContactShadows position={[0, -0.62, 0]} opacity={0.5} scale={9} blur={2.6} far={3.5} color="#000000" />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!reduced}
          autoRotateSpeed={0.9}
          minPolarAngle={Math.PI / 3.4}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Suspense>
    </Canvas>
  )
}
