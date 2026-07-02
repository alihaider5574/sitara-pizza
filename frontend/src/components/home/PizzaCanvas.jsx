import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Torus, Sphere, Box, MeshDistortMaterial, Float, Stars } from '@react-three/drei'
import * as THREE from 'three'

/** 
 * Abstract 3D pizza/food-like object built from Three.js primitives.
 * A full GLTF pizza model can be swapped in here once you have the asset.
 */
function PizzaModel() {
  const groupRef = useRef()
  const torusRef = useRef()
  const coreRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.3
      groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.08
    }
    if (torusRef.current) {
      torusRef.current.rotation.z = t * 0.5
    }
    if (coreRef.current) {
      coreRef.current.rotation.z = -t * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      {/* Pizza base — flat torus (the dough ring) */}
      <Torus ref={torusRef} args={[1.6, 0.35, 24, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#FF4D2E"
          emissive="#CC2200"
          emissiveIntensity={0.4}
          roughness={0.5}
          metalness={0.1}
        />
      </Torus>

      {/* Pizza center (cheese-like disc) */}
      <mesh ref={coreRef} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.62, 1.62, 0.12, 32]} />
        <MeshDistortMaterial
          color="#FFC042"
          emissive="#AA7000"
          emissiveIntensity={0.2}
          roughness={0.7}
          distort={0.08}
          speed={1}
        />
      </mesh>

      {/* Floating topping spheres (pepperoni-like) */}
      {[
        [0.6, 0.2, 0.9],
        [-0.7, 0.2, 0.8],
        [0.2, 0.2, -1.0],
        [-0.5, 0.2, -0.7],
        [1.0, 0.2, -0.3],
        [-1.1, 0.2, 0.1],
        [0.4, 0.2, 0.2],
      ].map(([x, y, z], i) => (
        <Float key={i} speed={2 + i * 0.3} rotationIntensity={0.5} floatIntensity={0.3}>
          <Sphere args={[0.15, 12, 12]} position={[x, y, z]}>
            <meshStandardMaterial
              color={i % 2 === 0 ? '#7B2FFF' : '#FF4D2E'}
              emissive={i % 2 === 0 ? '#5510CC' : '#CC2200'}
              emissiveIntensity={0.5}
              roughness={0.3}
              metalness={0.4}
            />
          </Sphere>
        </Float>
      ))}

      {/* Neon orbit ring */}
      <Torus args={[2.4, 0.025, 8, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#00E5FF"
          emissive="#00E5FF"
          emissiveIntensity={2}
          transparent
          opacity={0.6}
        />
      </Torus>

      {/* Second orbit ring */}
      <Torus args={[2.0, 0.018, 8, 64]} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <meshStandardMaterial
          color="#7B2FFF"
          emissive="#7B2FFF"
          emissiveIntensity={2}
          transparent
          opacity={0.4}
        />
      </Torus>
    </group>
  )
}

function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[4, 4, 4]} intensity={2} color="#FF4D2E" />
      <pointLight position={[-4, -2, -4]} intensity={1.5} color="#7B2FFF" />
      <pointLight position={[0, 5, 0]} intensity={1} color="#00E5FF" />

      {/* Stars bg */}
      <Stars radius={80} depth={50} count={800} factor={3} saturation={0} fade speed={0.5} />

      {/* Main pizza model */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <PizzaModel />
      </Float>
    </>
  )
}

/**
 * PizzaCanvas — the Three.js canvas container for the hero.
 * Wrapped in Suspense so the rest of the page loads while the 3D scene initialises.
 */
export default function PizzaCanvas() {
  return (
    <div className="hero-canvas w-full h-full absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 2, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={Math.min(window.devicePixelRatio, 2)}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
