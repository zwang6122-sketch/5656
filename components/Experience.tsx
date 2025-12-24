import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { AppState, PALETTE } from '../types';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import * as THREE from 'three';

interface ExperienceProps {
  appState: AppState;
}

const Rig = ({ appState }: { appState: AppState }) => {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const isFormed = appState === AppState.FORMED;
    const rotationSpeed = isFormed ? 0.05 : 0.08;
    
    state.camera.position.x += Math.sin(t * rotationSpeed) * 0.01;
    state.camera.position.z += Math.cos(t * rotationSpeed) * 0.01;
    state.camera.lookAt(0, 0, 0); 
  });
  return null;
}

// REDESIGNED: The "Royal Finial" Star Topper (Clean Version)
const StarTopper = ({ appState }: { appState: AppState }) => {
  const ref = useRef<THREE.Group>(null);
  const satellitesRef = useRef<THREE.Group>(null);
  const isFormed = appState === AppState.FORMED;

  useFrame((state, delta) => {
    if(!ref.current) return;
    
    // Position logic
    const targetY = isFormed ? 6.0 : 12; 
    const targetScale = isFormed ? 1 : 0.1;
    
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, delta * 2);
    
    const t = state.clock.elapsedTime;
    if (isFormed) {
        // Slow sway/rotation for the main structure
        ref.current.rotation.y = Math.sin(t * 0.3) * 0.05; 
        
        // Rotate the satellites
        if (satellitesRef.current) {
            satellitesRef.current.rotation.y -= delta * 0.5;
        }
    } else {
        ref.current.rotation.x += delta;
        ref.current.rotation.z += delta;
    }
    
    const currentScale = ref.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 2);
    ref.current.scale.setScalar(nextScale);
  });

  const { starMaterial, goldMaterial, rubyMaterial } = useMemo(() => {
    const star = new THREE.MeshStandardMaterial({
        color: PALETTE.GOLD,
        emissive: PALETTE.AMBER,
        emissiveIntensity: 3.0,
        toneMapped: false,
        roughness: 0.1,
        metalness: 1
    });

    const gold = new THREE.MeshStandardMaterial({
        color: PALETTE.GOLD,
        roughness: 0.15,
        metalness: 1.0,
        envMapIntensity: 2
    });

    const ruby = new THREE.MeshPhysicalMaterial({
        color: PALETTE.RUBY,
        emissive: '#4a0404',
        emissiveIntensity: 0.5,
        roughness: 0.0,
        metalness: 0.1,
        transmission: 0.6, 
        thickness: 1.0,
        ior: 1.5,
        clearcoat: 1
    });

    return { starMaterial: star, goldMaterial: gold, rubyMaterial: ruby };
  }, []);

  return (
    <group ref={ref} position={[0, 10, 0]}>
       
       {/* --- TOP SECTION: THE STAR --- */}
       <group position={[0, 0.4, 0]}>
            {/* Main Vertical Ray */}
            <mesh scale={[0.15, 2.8, 0.15]}>
                <octahedronGeometry args={[0.5, 0]} />
                <primitive object={starMaterial} />
            </mesh>
            {/* Horizontal Ray */}
            <mesh scale={[2.0, 0.15, 0.15]}>
                <octahedronGeometry args={[0.5, 0]} />
                <primitive object={starMaterial} />
            </mesh>
            {/* Diagonal Rays */}
            <mesh rotation={[0, 0, Math.PI/4]} scale={[1.2, 0.1, 0.1]}>
                <octahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial color={PALETTE.RICH_GOLD} metalness={1} roughness={0.1} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI/4]} scale={[1.2, 0.1, 0.1]}>
                <octahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial color={PALETTE.RICH_GOLD} metalness={1} roughness={0.1} />
            </mesh>
            {/* Center Light */}
            <pointLight intensity={3} distance={5} color={PALETTE.AMBER} decay={2} />
       </group>

       {/* --- MIDDLE SECTION: THE ORNATE NECK --- */}
       
       {/* 1. The Chalice */}
       <mesh position={[0, -0.1, 0]}>
           <cylinderGeometry args={[0.08, 0.25, 0.4, 8, 1, true]} />
           <primitive object={goldMaterial} side={THREE.DoubleSide} />
       </mesh>

       {/* 2. The Ruby Core */}
       <mesh position={[0, -0.5, 0]}>
           <octahedronGeometry args={[0.22, 0]} />
           <primitive object={rubyMaterial} />
       </mesh>
       <pointLight position={[0, -0.5, 0]} intensity={1} distance={2} color={PALETTE.RUBY} />

       {/* 3. The Golden Cage */}
       <group position={[0, -0.5, 0]}>
            <mesh rotation={[0, 0, 0]}>
                <torusGeometry args={[0.35, 0.015, 8, 32]} />
                <primitive object={goldMaterial} />
            </mesh>
            <mesh rotation={[0, Math.PI/2, 0]}>
                <torusGeometry args={[0.35, 0.015, 8, 32]} />
                <primitive object={goldMaterial} />
            </mesh>
             <mesh rotation={[Math.PI/2, 0, 0]}>
                <torusGeometry args={[0.35, 0.015, 8, 32]} />
                <primitive object={goldMaterial} />
            </mesh>
       </group>

       {/* 4. The Satellites */}
       <group ref={satellitesRef} position={[0, -0.5, 0]}>
           {[0, 1, 2, 3].map(i => (
               <mesh key={i} position={[Math.cos(i * Math.PI/2) * 0.65, 0, Math.sin(i * Math.PI/2) * 0.65]}>
                   <octahedronGeometry args={[0.06]} />
                   <meshStandardMaterial color={PALETTE.FROST} emissive="#FFF" emissiveIntensity={1} />
               </mesh>
           ))}
       </group>

       {/* --- BOTTOM SECTION: THE BASE --- */}

       {/* 1. Connector Node */}
       <mesh position={[0, -0.9, 0]}>
           <sphereGeometry args={[0.15, 16, 16]} />
           <primitive object={goldMaterial} />
       </mesh>

       {/* 2. Fluted Stem */}
       <mesh position={[0, -1.3, 0]}>
            <cylinderGeometry args={[0.08, 0.05, 0.6, 8]} />
            <primitive object={goldMaterial} />
       </mesh>

       {/* 3. Base Skirt */}
       <mesh position={[0, -1.7, 0]}>
            <cylinderGeometry args={[0.06, 0.4, 0.4, 16, 1, true]} />
            <primitive object={goldMaterial} side={THREE.DoubleSide} />
       </mesh>

    </group>
  );
};

export const Experience: React.FC<ExperienceProps> = ({ appState }) => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
    >
      <PerspectiveCamera makeDefault position={[0, 1, 13]} fov={50} />
      
      {/* --- LIGHTING --- */}
      <ambientLight intensity={0.4} color={PALETTE.DEEP_GREEN} />
      
      <spotLight
        position={[8, 12, 8]}
        angle={0.3}
        penumbra={1}
        intensity={2.8}
        color={PALETTE.CHAMPAGNE}
        castShadow
        shadow-bias={-0.0001}
      />
      
      <spotLight position={[-5, 5, -8]} intensity={3} color="#1a2b5e" angle={0.6} />
      <pointLight position={[0, -5, 2]} intensity={1} distance={10} color={PALETTE.AMBER} />
      <pointLight position={[0, 1, 0]} intensity={1.2} distance={7} color={PALETTE.LIME_ACCENT} />
      
      <Environment preset="city" blur={1} />
      
      <color attach="background" args={['#000000']} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Sparkles 
         count={400} 
         scale={[12, 12, 12]} 
         size={1} 
         speed={0.3} 
         opacity={0.4} 
         color={PALETTE.FROST}
      />

      <group position={[0, -2, 0]}>
        
        <StarTopper appState={appState} />
        <Foliage appState={appState} />

        {/* --- ZONE 1: TOP TIER (Small, Light, Sparkling) --- */}
        {/* Y: 3.5 to 5.5 */}
        
        {/* Crown Jewels (Reduced Count) */}
        <Ornaments
          appState={appState}
          type="sphere"
          count={24} 
          minY={3.5}
          maxY={5.2}
          colorPalette={[PALETTE.GOLD, PALETTE.CHAMPAGNE]}
          scaleRange={[0.08, 0.12]}
          metalness={1.0}
          roughness={0.05}
        />
        
        {/* Diamond Snowflakes (Reduced Count, better geometry) */}
        <Ornaments
            appState={appState}
            type="snowflake"
            count={16}
            minY={3.0}
            maxY={4.8}
            colorPalette={[PALETTE.FROST, '#FFFFFF']}
            scaleRange={[0.15, 0.2]} 
            metalness={0.9}
            roughness={0.0} 
            emissiveIntensity={0.2}
        />

        {/* --- ZONE 2: MIDDLE TIER (Balanced Density) --- */}
        {/* Y: 0.0 to 3.5 */}

        {/* Royal Ribbons/Knots */}
        <Ornaments
          appState={appState}
          type="knot"
          count={32}
          minY={0.0}
          maxY={4.0}
          colorPalette={[PALETTE.GOLD, PALETTE.RED_RIBBON]}
          scaleRange={[0.2, 0.3]}
          metalness={0.8}
          roughness={0.2}
        />

        {/* Gilded Pinecones */}
        <Ornaments
          appState={appState}
          type="pinecone"
          count={40}
          minY={-1.0}
          maxY={3.5}
          colorPalette={[PALETTE.DARK_WOOD, PALETTE.RICH_GOLD]}
          scaleRange={[0.15, 0.22]}
          metalness={0.4}
          roughness={0.7}
        />

        {/* Classic Baubles (Reduced) */}
        <Ornaments
          appState={appState}
          type="sphere"
          count={65}
          minY={-1.0}
          maxY={3.5}
          colorPalette={[PALETTE.RED_RIBBON, PALETTE.VELVET_RED, PALETTE.GOLD]}
          scaleRange={[0.15, 0.22]} 
          metalness={0.7}
          roughness={0.3} 
        />
        
        {/* Candy Canes */}
        <Ornaments
            appState={appState}
            type="candy"
            count={32}
            minY={-1.5}
            maxY={3.0}
            colorPalette={[PALETTE.CANDY_RED, PALETTE.CANDY_WHITE]}
            scaleRange={[0.08, 0.12]} 
            metalness={0.2} 
            roughness={0.4} 
        />

        {/* --- ZONE 3: LOWER TIER (Solid Base) --- */}
        {/* Y: -4.5 to 0.0 */}

        {/* Large Grand Baubles (Halved count for impact) */}
        <Ornaments
          appState={appState}
          type="sphere"
          count={75} 
          minY={-4.5}
          maxY={0.0}
          colorPalette={[PALETTE.MIDNIGHT_BLUE, PALETTE.DEEP_GREEN, PALETTE.VELVET_RED, PALETTE.GOLD]}
          scaleRange={[0.22, 0.35]} 
          metalness={0.6}
          roughness={0.25} 
        />

        {/* Heavy Golden Rings */}
        <Ornaments
            appState={appState}
            type="ring"
            count={45}
            minY={-4.5}
            maxY={1.0}
            colorPalette={[PALETTE.GOLD, PALETTE.RICH_GOLD]}
            scaleRange={[0.2, 0.3]} 
            metalness={1.0}
            roughness={0.1}
        />

        {/* Lower Hanging Gifts */}
        <Ornaments
          appState={appState}
          type="box"
          count={24}
          minY={-4.0}
          maxY={-1.0}
          colorPalette={[PALETTE.GOLD, PALETTE.RED_RIBBON]}
          scaleRange={[0.15, 0.2]}
          metalness={0.5}
          roughness={0.4}
        />

        {/* Icicles */}
        <Ornaments
          appState={appState}
          type="cone"
          count={40}
          minY={-4.0}
          maxY={3.0}
          colorPalette={[PALETTE.FROST]}
          scaleRange={[0.1, 0.2]}
          metalness={0.7}
          roughness={0.1}
        />

        {/* --- GLOBAL: SPIRAL GARLANDS --- */}
        
        {/* Fairy Lights (Reduced to avoid clutter) */}
        <Ornaments
            appState={appState}
            type="sphere"
            mode="spiral"
            count={600}
            minY={-4.5}
            maxY={5.0}
            colorPalette={[PALETTE.AMBER, PALETTE.GOLD]}
            scaleRange={[0.025, 0.035]} 
            metalness={0}
            roughness={1}
            emissiveIntensity={4.0} 
            drapeAmount={0.0} 
        />

        {/* Pearl Garlands */}
        <Ornaments
            appState={appState}
            type="sphere"
            mode="spiral"
            count={400}
            minY={-4.5}
            maxY={4.0}
            colorPalette={[PALETTE.PEARL]}
            scaleRange={[0.06, 0.08]} 
            metalness={0.6} 
            roughness={0.2}
            drapeAmount={0.5} 
            drapeFrequency={6}
        />

        {/* --- ZONE 4: THE FLOOR (Curated Gifts) --- */}

        <Ornaments
          appState={appState}
          type="box"
          mode="floor"
          count={24} 
          colorPalette={[PALETTE.VELVET_RED, PALETTE.DEEP_GREEN, PALETTE.GOLD, PALETTE.MIDNIGHT_BLUE, PALETTE.CHAMPAGNE]}
          scaleRange={[0.4, 0.8]} 
          metalness={0.3} 
          roughness={0.6}
        />

      </group>
      
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 1.5}
        minDistance={8}
        maxDistance={25}
        target={[0, 0, 0]} 
        autoRotate
        autoRotateSpeed={0.5}
      />

      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.95} mipmapBlur intensity={1.8} radius={0.5} />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
        <Noise opacity={0.02} />
      </EffectComposer>
      
      <Rig appState={appState} />
    </Canvas>
  );
};