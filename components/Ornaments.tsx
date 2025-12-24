import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AppState, randomPointInSphere, randomRange, PALETTE } from '../types';

interface OrnamentsProps {
  appState: AppState;
  type: 'sphere' | 'box' | 'diamond' | 'cone' | 'ring' | 'crystal' | 'candy' | 'knot' | 'pinecone' | 'snowflake';
  count: number;
  colorPalette: string[];
  scaleRange: [number, number];
  mode?: 'scatter' | 'spiral' | 'floor'; 
  roughness?: number;
  metalness?: number;
  emissiveIntensity?: number;
  drapeAmount?: number; 
  drapeFrequency?: number;
  minY?: number; 
  maxY?: number; 
}

export const Ornaments: React.FC<OrnamentsProps> = ({
  appState,
  type,
  count,
  colorPalette,
  scaleRange,
  mode = 'scatter',
  roughness = 0.2,
  metalness = 0.8,
  emissiveIntensity = 0,
  drapeAmount = 0,
  drapeFrequency = 8,
  minY = -5,
  maxY = 3.5
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const detailMeshRef = useRef<THREE.InstancedMesh>(null); // Layer 2: Caps, Ribbons
  const tertiaryMeshRef = useRef<THREE.InstancedMesh>(null); // Layer 3: Hooks, Bows, Tips
  
  // Detect if this type uses transmission (glass-like)
  const isGlass = type === 'diamond' || type === 'crystal' || type === 'snowflake';
  const isOrganic = type === 'pinecone' || type === 'cone';

  const data = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const scale = randomRange(scaleRange[0], scaleRange[1]);
      let targetPos: THREE.Vector3;
      let targetRot = new THREE.Euler(0, 0, 0);

      const baseRadius = 4.5;

      if (mode === 'spiral') {
        const progress = i / count;
        let y = minY + progress * (maxY - minY);
        const yNorm = (y + 5) / 10;
        const baseR = baseRadius * (1 - yNorm); 
        const turns = 10; 
        const angle = progress * Math.PI * 2 * turns;
        
        if (drapeAmount > 0) {
            const sag = Math.abs(Math.sin(angle * (drapeFrequency / 2))); 
            y -= sag * drapeAmount;
        }

        const noise = Math.sin(progress * 50) * 0.1;
        targetPos = new THREE.Vector3(
           Math.cos(angle) * (baseR + noise),
           y + noise,
           Math.sin(angle) * (baseR + noise)
        );

        if (type === 'ring') {
            targetRot = new THREE.Euler(Math.PI / 2, angle, 0);
        }
      
      } else if (mode === 'floor') {
        const angle = Math.random() * Math.PI * 2;
        const r = randomRange(3.5, 7.5); 
        const y = -5.8 + randomRange(0, 0.6); 
        
        targetPos = new THREE.Vector3(
            Math.cos(angle) * r,
            y,
            Math.sin(angle) * r
        );
        targetRot = new THREE.Euler(0, Math.random() * Math.PI * 2, 0); 

      } else {
        // SCATTER MODE
        const y = randomRange(minY, maxY);
        const yNorm = (y + 5) / 10; 
        const maxR = baseRadius * (1 - yNorm);
        const theta = Math.random() * 2 * Math.PI;
        
        // Refined positioning to sit better on branches
        const r = maxR * (0.65 + 0.45 * Math.random());
        
        const rawPos = new THREE.Vector3(
            r * Math.cos(theta),
            y,
            r * Math.sin(theta)
        );

        const dir = new THREE.Vector3(rawPos.x, 0, rawPos.z).normalize();
        
        if (type === 'sphere' || type === 'box') {
             targetPos = rawPos.add(dir.multiplyScalar(0.25));
        } else {
             targetPos = rawPos;
        }
        
        targetRot = new THREE.Euler(
            Math.random() * Math.PI, 
            Math.random() * Math.PI * 2, 
            Math.random() * Math.PI
         );
         
         if (type === 'cone' || type === 'candy' || type === 'pinecone') {
             targetRot = new THREE.Euler(
                 (Math.random() - 0.5) * 0.3, 
                 Math.random() * Math.PI * 2, 
                 (Math.random() - 0.5) * 0.3
             );
         }

         if (type === 'snowflake') {
             const angle = Math.atan2(targetPos.x, targetPos.z);
             targetRot = new THREE.Euler(0, angle, Math.PI / 2); 
         }
         
         if (type === 'knot') {
             const angleToCenter = Math.atan2(targetPos.x, targetPos.z);
             targetRot = new THREE.Euler(Math.random() * 0.5, angleToCenter, 0);
         }
      }

      const chaosPos = randomPointInSphere(13);
      const color = new THREE.Color(colorPalette[Math.floor(Math.random() * colorPalette.length)]);
      
      const chaosRot = new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      return {
        targetPos,
        chaosPos,
        scale,
        color,
        chaosRot,
        targetRot,
        lerpSpeed: randomRange(0.015, 0.035)
      };
    });
  }, [count, scaleRange, colorPalette, mode, type, drapeAmount, drapeFrequency, minY, maxY]);

  useEffect(() => {
    if (meshRef.current) {
        data.forEach((d, i) => meshRef.current!.setColorAt(i, d.color));
        meshRef.current.instanceColor!.needsUpdate = true;
    }
    const gold = new THREE.Color(PALETTE.GOLD);

    if (detailMeshRef.current) {
        for(let i=0; i<count; i++) detailMeshRef.current.setColorAt(i, gold);
        detailMeshRef.current.instanceColor!.needsUpdate = true;
    }
    if (tertiaryMeshRef.current) {
        for(let i=0; i<count; i++) tertiaryMeshRef.current.setColorAt(i, gold);
        tertiaryMeshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [data, type, count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    const dummyDetail = new THREE.Object3D();
    const dummyTertiary = new THREE.Object3D();
    const isFormed = appState === AppState.FORMED;
    
    const currentVector = new THREE.Vector3();
    const currentQuaternion = new THREE.Quaternion();
    const currentScale = new THREE.Vector3();
    const targetQuaternion = new THREE.Quaternion();

    for (let i = 0; i < count; i++) {
      const d = data[i];
      
      meshRef.current.getMatrixAt(i, dummy.matrix);
      dummy.matrix.decompose(currentVector, currentQuaternion, currentScale);

      const destPos = isFormed ? d.targetPos : d.chaosPos;
      const destRotEuler = isFormed ? d.targetRot : d.chaosRot;
      targetQuaternion.setFromEuler(destRotEuler);

      if (isFormed) {
          if (type === 'diamond' || type === 'crystal' || type === 'ring' || type === 'snowflake') {
             targetQuaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), state.clock.elapsedTime * 0.2 + i * 0.1));
          }
      }

      currentVector.lerp(destPos, d.lerpSpeed * (delta * 60));
      currentQuaternion.slerp(targetQuaternion, d.lerpSpeed * (delta * 60));
      
      dummy.position.copy(currentVector);
      dummy.quaternion.copy(currentQuaternion);
      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // --- LAYER 2: DETAIL (Caps, Ribbons) ---
      if (detailMeshRef.current) {
          dummyDetail.position.copy(currentVector);
          dummyDetail.quaternion.copy(currentQuaternion);
          dummyDetail.scale.setScalar(d.scale);

          if (type === 'sphere') {
              dummyDetail.translateY(0.95);
          }
          if (type === 'box') {
              dummyDetail.scale.setScalar(d.scale * 1.01);
          }
          
          dummyDetail.updateMatrix();
          detailMeshRef.current.setMatrixAt(i, dummyDetail.matrix);
      }

      // --- LAYER 3: TERTIARY (Hooks, Bows) ---
      if (tertiaryMeshRef.current) {
          dummyTertiary.position.copy(currentVector);
          dummyTertiary.quaternion.copy(currentQuaternion);
          dummyTertiary.scale.setScalar(d.scale);

          if (type === 'sphere') {
              dummyTertiary.translateY(1.15); 
              dummyTertiary.rotateY(Math.PI/2);
          }
          if (type === 'box') {
              dummyTertiary.translateY(0.51); 
              dummyTertiary.rotateX(Math.PI/2);
          }
          
          dummyTertiary.updateMatrix();
          tertiaryMeshRef.current.setMatrixAt(i, dummyTertiary.matrix);
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (detailMeshRef.current) detailMeshRef.current.instanceMatrix.needsUpdate = true;
    if (tertiaryMeshRef.current) tertiaryMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  // --- PROCEDURAL GEOMETRIES ---

  const mainGeometry = useMemo(() => {
      switch(type) {
          case 'box': return <boxGeometry args={[1, 1, 1]} />;
          case 'diamond': return <octahedronGeometry args={[1, 0]} />; 
          case 'crystal': return <dodecahedronGeometry args={[0.7, 0]} />; 
          case 'ring': return <torusGeometry args={[0.6, 0.1, 8, 32]} />;
          case 'knot': return <torusKnotGeometry args={[0.4, 0.2, 100, 16, 2, 3]} />;
          case 'cone': return <coneGeometry args={[0.3, 2.5, 8]} />; 
          
          case 'snowflake': {
            // Custom Star/Snowflake Shape
            const shape = new THREE.Shape();
            const arms = 6;
            const outerRadius = 1.0;
            const innerRadius = 0.4;
            
            for (let i = 0; i < arms * 2; i++) {
                const angle = (i / (arms * 2)) * Math.PI * 2;
                const r = i % 2 === 0 ? outerRadius : innerRadius;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                if (i === 0) shape.moveTo(x, y);
                else shape.lineTo(x, y);
            }
            shape.closePath();
            
            const geom = new THREE.ExtrudeGeometry(shape, {
                depth: 0.1,
                bevelEnabled: true,
                bevelThickness: 0.05,
                bevelSize: 0.05,
                bevelSegments: 2
            });
            geom.center();
            // Scale geometry to fit approx unit sphere size
            geom.scale(0.8, 0.8, 0.8);
            
            // Wrap in primitive for React usage
            return <primitive object={geom} attach="geometry" />;
          }
          
          case 'pinecone': {
             // More organic Lathe profile
             const points = [];
             for (let i = 0; i < 20; i++) {
                const t = i / 19;
                // Egg shape envelope
                const envelope = Math.sin(t * Math.PI) * 0.5; 
                // Scales
                const scaleOut = 1.0 + (i % 3 === 0 ? 0.3 : 0.0);
                
                points.push(new THREE.Vector2(envelope * scaleOut, (t - 0.5) * 2.0));
             }
             return <latheGeometry args={[points, 10]} />;
          }

          case 'candy': 
             const path = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, -1.2, 0),
                new THREE.Vector3(0, 0.8, 0),
                new THREE.Vector3(0.3, 1.2, 0),
                new THREE.Vector3(0.8, 1.0, 0)
             ]);
             return <tubeGeometry args={[path, 32, 0.12, 16, false]} />;

          case 'sphere': default: return <sphereGeometry args={[1, 32, 32]} />;
      }
  }, [type]);

  const detailGeometry = useMemo(() => {
      if (type === 'sphere') {
          return <cylinderGeometry args={[0.2, 0.25, 0.35, 16, 1, true]} />;
      }
      if (type === 'box') {
          return <boxGeometry args={[1.05, 1.05, 0.2]} />;
      }
      return null;
  }, [type]);

  const tertiaryGeometry = useMemo(() => {
      if (type === 'sphere') {
          return <torusGeometry args={[0.1, 0.03, 8, 16]} />;
      }
      if (type === 'box') {
          // A Double loop bow using Torus
          // We can merge geometries or just use a complex knot shape that resembles a bow
          return <torusKnotGeometry args={[0.25, 0.08, 64, 8, 2, 3]} />; 
      }
      return null;
  }, [type]);

  return (
    <group>
        {/* Layer 1: Main Body */}
        <instancedMesh
            ref={meshRef}
            args={[undefined, undefined, count]}
            castShadow
            receiveShadow
        >
            {mainGeometry}
            <meshPhysicalMaterial
                roughness={isGlass ? 0.05 : (isOrganic ? 0.7 : roughness)}
                metalness={isGlass ? 0.1 : (isOrganic ? 0.1 : metalness)}
                
                // Glass properties
                transmission={isGlass ? 1.0 : 0.0}
                thickness={isGlass ? 1.5 : 0.0}
                ior={isGlass ? 1.5 : 1.5}
                
                // Clearcoat for baubles
                clearcoat={type === 'sphere' ? 1.0 : 0.0}
                clearcoatRoughness={0.1}
                
                envMapIntensity={isGlass ? 3.0 : 2.0}
                emissive={emissiveIntensity > 0 ? new THREE.Color(colorPalette[0]) : undefined}
                emissiveIntensity={emissiveIntensity}
                toneMapped={false}
                flatShading={type === 'pinecone'}
            />
        </instancedMesh>

        {/* Layer 2: Details */}
        {detailGeometry && (
            <instancedMesh
                ref={detailMeshRef}
                args={[undefined, undefined, count]}
                castShadow
            >
                {detailGeometry}
                <meshStandardMaterial
                    color={PALETTE.GOLD}
                    roughness={0.2}
                    metalness={1.0}
                    envMapIntensity={3.0}
                />
            </instancedMesh>
        )}

        {/* Layer 3: Tertiary */}
        {tertiaryGeometry && (
            <instancedMesh
                ref={tertiaryMeshRef}
                args={[undefined, undefined, count]}
                castShadow
            >
                {tertiaryGeometry}
                <meshStandardMaterial
                    color={PALETTE.RICH_GOLD}
                    roughness={0.1}
                    metalness={1.0}
                    envMapIntensity={3.0}
                />
            </instancedMesh>
        )}
    </group>
  );
};