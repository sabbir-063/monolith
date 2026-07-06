import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, ContactShadows, OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'

/* ------------------------------------------------------------------
   Procedural textures — no image assets, everything drawn on canvas
   ------------------------------------------------------------------ */

function makeGlowTexture(size = 256) {
  const cv = document.createElement('canvas')
  cv.width = cv.height = size
  const ctx = cv.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255, 195, 145, 1)')
  g.addColorStop(0.35, 'rgba(255, 130, 66, 0.4)')
  g.addColorStop(1, 'rgba(255, 110, 50, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function makeCircuitTexture(w = 512, h = 192, traces = 16) {
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const ctx = cv.getContext('2d')
  ctx.strokeStyle = 'rgba(255, 179, 71, 0.9)'
  ctx.fillStyle = 'rgba(255, 179, 71, 0.9)'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  // right-angled traces ending in a solder pad, like a PCB pressed into clay
  for (let i = 0; i < traces; i++) {
    let x = Math.random() * w
    let y = Math.random() * h
    ctx.beginPath()
    ctx.moveTo(x, y)
    const segs = 2 + Math.floor(Math.random() * 3)
    for (let s = 0; s < segs; s++) {
      const len = 20 + Math.random() * 70
      if (s % 2 === 0) x += (Math.random() > 0.5 ? 1 : -1) * len
      else y += (Math.random() > 0.5 ? 1 : -1) * len
      ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x, y, 4.5, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = 0; i < 10; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 6, 6)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/* ------------------------------------------------------------------
   Scene — dormant brick, chip fly-in, lid opening, power-on, super idle
   ------------------------------------------------------------------ */

const POWER_COLOR = new THREE.Color('#b23222')
const HUD_POS = [
  [1.6, 0.95, 0.3],
  [-1.8, 0.4, -0.2],
  [1.1, -0.75, 0.5],
]

function SmartBrickScene({ reduced, labels }) {
  const { camera } = useThree()
  const [done, setDone] = useState(false)
  const doneRef = useRef(false)
  const tlRef = useRef(null)

  const groupRef = useRef()
  const chipRef = useRef()
  const lHingeRef = useRef()
  const rHingeRef = useRef()
  const coreLightRef = useRef()
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const sparksRef = useRef()

  const tex = useMemo(
    () => ({
      glow: makeGlowTexture(),
      circuit: makeCircuitTexture(512, 192, 16),
      chipTop: makeCircuitTexture(128, 128, 9),
    }),
    [],
  )

  const mats = useMemo(
    () => ({
      brick: new THREE.MeshStandardMaterial({
        color: '#7a2318', roughness: 0.62, metalness: 0.04,
        emissive: '#e2562a', emissiveIntensity: 0,
      }),
      frog: new THREE.MeshStandardMaterial({
        color: '#7c2418', roughness: 0.75,
        emissive: '#e2562a', emissiveIntensity: 0,
      }),
      cavity: new THREE.MeshStandardMaterial({
        color: '#1d0d08', roughness: 0.9,
        emissive: '#ff6a2a', emissiveIntensity: 0.15,
      }),
      chipBase: new THREE.MeshStandardMaterial({ color: '#17110c', roughness: 0.35, metalness: 0.5 }),
      chipTop: new THREE.MeshStandardMaterial({
        color: '#241505', roughness: 0.4, metalness: 0.2,
        emissive: '#ffb347', emissiveIntensity: 1.4, emissiveMap: tex.chipTop,
      }),
      pin: new THREE.MeshStandardMaterial({ color: '#d8a44a', roughness: 0.3, metalness: 0.9 }),
      seam: new THREE.MeshBasicMaterial({ color: '#ff8a3c', transparent: true, opacity: 0 }),
      circuit: new THREE.MeshBasicMaterial({
        map: tex.circuit, transparent: true, opacity: 0,
        depthWrite: false, blending: THREE.AdditiveBlending,
      }),
      halo: new THREE.SpriteMaterial({ map: tex.glow, color: '#e2562a', transparent: true, opacity: 0, depthWrite: false }),
      chipGlow: new THREE.SpriteMaterial({ map: tex.glow, color: '#ffb347', transparent: true, opacity: 0.55, depthWrite: false }),
      ring1: new THREE.MeshBasicMaterial({ color: '#ffb680', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
      ring2: new THREE.MeshBasicMaterial({ color: '#ffb680', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
      spark: new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0 }),
    }),
    [tex],
  )

  const sparkPositions = useMemo(() => {
    const pts = []
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      const r = 1.75 + Math.random() * 0.45
      pts.push([Math.cos(a) * r, (Math.random() - 0.5) * 1.15, Math.sin(a) * r])
    }
    return pts
  }, [])

  useEffect(() => {
    const chip = chipRef.current
    const lHinge = lHingeRef.current
    const rHinge = rHingeRef.current
    const coreLight = coreLightRef.current
    const lookAt = () => camera.lookAt(0, 0.1, 0)
    lookAt()

    const tl = gsap.timeline({
      delay: 0.5,
      onComplete: () => {
        doneRef.current = true
        setDone(true)
      },
    })

    // 1 — the chip arcs in from off-screen and hovers over the brick
    tl.to(chip.position, { x: 0, y: 1.7, z: 0.1, duration: 1.0, ease: 'power2.out' })
      .to(chip.rotation, { x: 0.1, y: Math.PI * 2.5, z: 0, duration: 1.0, ease: 'power1.out' }, '<')
      .to(chip.position, { y: 1.5, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut' })
      // 2 — the lids hinge open from the top-middle seam, cavity glows
      .to(lHinge.rotation, { z: 1.1, duration: 0.7, ease: 'power3.inOut' }, '-=0.25')
      .to(rHinge.rotation, { z: -1.1, duration: 0.7, ease: 'power3.inOut' }, '<')
      .to(mats.cavity, { emissiveIntensity: 2.2, duration: 0.5 }, '<+0.2')
      .to(coreLight, { intensity: 10, duration: 0.5 }, '<')
      // 3 — chip aligns and descends into the socket
      .to(chip.rotation, { x: 0, y: Math.PI * 3, z: 0, duration: 0.4, ease: 'power1.inOut' }, '-=0.1')
      .to(chip.position, { y: 0.14, duration: 0.55, ease: 'power2.in' }, '<')
      .to(chip.scale, { x: 0.9, y: 0.9, z: 0.9, duration: 0.55 }, '<')
      // seat flare + shockwave ring
      .to(mats.cavity, { emissiveIntensity: 5, duration: 0.12, ease: 'power1.in' })
      .to(coreLight, { intensity: 26, duration: 0.12 }, '<')
      .fromTo(ring1Ref.current.scale, { x: 0.4, y: 0.4 }, { x: 3.2, y: 3.2, duration: 0.8, ease: 'power2.out' }, '<')
      .fromTo(mats.ring1, { opacity: 0.75 }, { opacity: 0, duration: 0.8 }, '<')
      // 4 — lids close over the chip, glow simmers down
      .to(lHinge.rotation, { z: 0, duration: 0.55, ease: 'power3.inOut' }, '-=0.55')
      .to(rHinge.rotation, { z: 0, duration: 0.55, ease: 'power3.inOut' }, '<')
      .to(coreLight, { intensity: 4, duration: 0.4 }, '<')
      .to(mats.cavity, { emissiveIntensity: 1.2, duration: 0.4 }, '<')
      // 5 — power-on: the brick ignites into its super state
      .add('power', '+=0.1')
      .to(mats.brick.color, { r: POWER_COLOR.r, g: POWER_COLOR.g, b: POWER_COLOR.b, duration: 0.9 }, 'power')
      .to(mats.brick, { emissiveIntensity: 0.35, roughness: 0.45, duration: 0.9 }, 'power')
      .to(mats.frog, { emissiveIntensity: 0.15, duration: 0.9 }, 'power')
      .to(mats.circuit, { opacity: 0.9, duration: 0.9, ease: 'power2.out' }, 'power+=0.1')
      .to(mats.seam, { opacity: 0.8, duration: 0.35 }, 'power')
      .to(mats.halo, { opacity: 0.5, duration: 1.1 }, 'power')
      .to(mats.spark, { opacity: 0.9, duration: 1.0 }, 'power+=0.3')
      .fromTo(ring2Ref.current.scale, { x: 0.5, y: 0.5 }, { x: 4.2, y: 4.2, duration: 1.0, ease: 'power2.out' }, 'power')
      .fromTo(mats.ring2, { opacity: 0.7 }, { opacity: 0, duration: 1.0 }, 'power')
      .to(camera.position, { x: 3.2, y: 1.8, z: 4.2, duration: 1.2, ease: 'power2.inOut', onUpdate: lookAt }, 'power')

    // phones get a tighter cut of the same film
    if (window.innerWidth < 880) tl.timeScale(1.3)
    // reduced motion skips the cinematic entirely — straight to the super brick
    if (reduced) tl.progress(1)

    tlRef.current = tl
    return () => tl.kill()
  }, [reduced, camera, mats])

  // tap the brick mid-cinematic to jump straight to the super state
  const skip = () => {
    if (!doneRef.current && tlRef.current) tlRef.current.progress(1)
  }

  // super-brick idle: breathing glow, gentle float, orbiting sparks
  useFrame((state, dt) => {
    if (!doneRef.current || reduced) return
    const t = state.clock.elapsedTime
    groupRef.current.position.y = Math.sin(t * 1.3) * 0.05
    mats.brick.emissiveIntensity = 0.3 + Math.sin(t * 2.1) * 0.1
    mats.halo.opacity = 0.48 + Math.sin(t * 2.1) * 0.07
    mats.seam.opacity = 0.55 + Math.sin(t * 2.6) * 0.25
    sparksRef.current.rotation.y += dt * 0.45
  })

  return (
    <>
      <group ref={groupRef} rotation={[0, -0.5, 0]} onPointerDown={skip}>
        {/* bottom body */}
        <RoundedBox args={[2.3, 0.5, 1.08]} radius={0.05} smoothness={4} position={[0, -0.14, 0]} material={mats.brick} />

        {/* glowing inner cavity, revealed when the lids open */}
        <mesh position={[0, 0.08, 0]} material={mats.cavity}>
          <boxGeometry args={[1.95, 0.18, 0.88]} />
        </mesh>
        <pointLight ref={coreLightRef} position={[0, 0.55, 0]} intensity={0} color="#ff7a3c" distance={6} />

        {/* top lids — hinged at the outer edges so they open from the middle */}
        <group ref={lHingeRef} position={[-1.15, 0.11, 0]}>
          <RoundedBox args={[1.15, 0.28, 1.08]} radius={0.04} smoothness={4} position={[0.575, 0.14, 0]} material={mats.brick} />
          <mesh position={[0.725, 0.29, 0]} material={mats.frog}>
            <boxGeometry args={[0.85, 0.05, 0.66]} />
          </mesh>
        </group>
        <group ref={rHingeRef} position={[1.15, 0.11, 0]}>
          <RoundedBox args={[1.15, 0.28, 1.08]} radius={0.04} smoothness={4} position={[-0.575, 0.14, 0]} material={mats.brick} />
          <mesh position={[-0.725, 0.29, 0]} material={mats.frog}>
            <boxGeometry args={[0.85, 0.05, 0.66]} />
          </mesh>
        </group>

        {/* molten seam line along the top, lit after power-on */}
        <mesh position={[0, 0.4, 0]} material={mats.seam}>
          <boxGeometry args={[0.02, 0.05, 1.06]} />
        </mesh>

        {/* circuit traces hovering just off the faces */}
        <mesh position={[0, 0, 0.548]} material={mats.circuit}>
          <planeGeometry args={[2.14, 0.62]} />
        </mesh>
        <mesh position={[0, 0, -0.548]} rotation={[0, Math.PI, 0]} material={mats.circuit}>
          <planeGeometry args={[2.14, 0.62]} />
        </mesh>
        <mesh position={[1.158, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={mats.circuit}>
          <planeGeometry args={[1.0, 0.62]} />
        </mesh>
        <mesh position={[-1.158, 0, 0]} rotation={[0, -Math.PI / 2, 0]} material={mats.circuit}>
          <planeGeometry args={[1.0, 0.62]} />
        </mesh>

        {/* the chip — starts off-screen, flies in, seats into the cavity */}
        <group ref={chipRef} position={[4.5, 3.4, 1.6]} rotation={[0.35, 0.6, -0.3]}>
          <mesh material={mats.chipBase}>
            <boxGeometry args={[0.5, 0.09, 0.5]} />
          </mesh>
          <mesh position={[0, 0.055, 0]} material={mats.chipTop}>
            <boxGeometry args={[0.36, 0.02, 0.36]} />
          </mesh>
          {[-0.14, 0, 0.14].map((z) => (
            <group key={z}>
              <mesh position={[0.27, -0.01, z]} material={mats.pin}>
                <boxGeometry args={[0.06, 0.03, 0.05]} />
              </mesh>
              <mesh position={[-0.27, -0.01, z]} material={mats.pin}>
                <boxGeometry args={[0.06, 0.03, 0.05]} />
              </mesh>
            </group>
          ))}
          <sprite scale={[0.9, 0.9, 1]} material={mats.chipGlow} />
        </group>

        {/* shockwave rings */}
        <mesh ref={ring1Ref} position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.ring1}>
          <ringGeometry args={[0.55, 0.6, 48]} />
        </mesh>
        <mesh ref={ring2Ref} position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.ring2}>
          <ringGeometry args={[0.55, 0.6, 48]} />
        </mesh>
      </group>

      {/* halo behind the brick */}
      <sprite scale={[6.5, 6.5, 1]} position={[0, 0.1, -0.6]} material={mats.halo} />

      {/* orbiting sparks */}
      <group ref={sparksRef}>
        {sparkPositions.map((p, i) => (
          <mesh key={i} position={p} material={mats.spark}>
            <sphereGeometry args={[0.022, 8, 8]} />
          </mesh>
        ))}
      </group>

      {/* smart-stats HUD — fades in once the brick powers on */}
      {labels.map((label, i) => (
        <Html key={i} position={HUD_POS[i]} center distanceFactor={9} zIndexRange={[40, 0]} wrapperClass="brick-hud-wrap">
          <div className={`brick-hud ${done ? 'is-on' : ''}`} style={{ transitionDelay: `${0.25 + i * 0.2}s` }}>
            {label}
          </div>
        </Html>
      ))}

      <OrbitControls
        enabled={done}
        enableZoom={false}
        enablePan={false}
        autoRotate={done && !reduced}
        autoRotateSpeed={0.9}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  )
}

export default function Brick3D({ reduced = false, labels = [] }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [3.75, 2.15, 4.95], fov: 32 }}
    >
      <ambientLight intensity={0.7} />
      {/* key + fill directional lights are not distance-attenuated, so they read predictably */}
      <directionalLight position={[5, 8, 5]} intensity={3} color="#fff3e6" />
      <directionalLight position={[-5, 3, 2]} intensity={1.1} />
      {/* warm rim from the kiln side */}
      <pointLight position={[-3, 1.5, -3]} intensity={45} color="#e2562a" />

      <SmartBrickScene reduced={reduced} labels={labels} />

      <ContactShadows position={[0, -0.62, 0]} opacity={0.5} scale={9} blur={2.6} far={3.5} color="#000000" />
    </Canvas>
  )
}
