import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AppState, PALETTE, randomPointInSphere, getTreePosition } from '../types';

interface FoliageProps {
  appState: AppState;
}

const vertexShader = `
  uniform float uProgress;
  uniform float uTime;
  attribute vec3 aTarget;
  attribute vec3 aChaos;
  attribute float aSize;
  attribute float aSpeed;
  attribute vec3 aColor; 
  
  varying vec3 vColor;
  varying float vAlpha;
  
  float ease(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    float t = ease(uProgress);
    
    vec3 pos = mix(aChaos, aTarget, t);
    
    // Breathing effect
    pos.x += sin(uTime * aSpeed + pos.y) * 0.05 * (1.0 - t); 
    pos.y += cos(uTime * aSpeed + pos.x) * 0.05 * (1.0 - t);
    
    // Gentle wind in formed state
    if (t > 0.8) {
       float wind = sin(uTime * 0.8 + pos.y * 1.5) * 0.06;
       pos.x += wind;
       pos.z += wind * 0.3;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    gl_PointSize = aSize * (550.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    vColor = aColor;
    
    // Fake lighting
    vec3 normal = normalize(pos);
    float light = dot(normal, normalize(vec3(0.5, 1.0, 0.8)));
    vColor += vec3(0.1) * max(0.0, light);

    vAlpha = 0.85 + 0.15 * t;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    
    // Elongated Needle shape
    // x is stretched slightly
    float r = dot(cxy * vec2(1.0, 0.5), cxy * vec2(1.0, 0.5));
    
    if (r > 1.0) discard;

    float alpha = 1.0 - smoothstep(0.4, 1.0, r);
    
    gl_FragColor = vec4(vColor, alpha * vAlpha);
  }
`;

const COUNT = 64000;

export const Foliage: React.FC<FoliageProps> = ({ appState }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positionsChaos, positionsTarget, sizes, speeds, colors } = useMemo(() => {
    const pChaos = new Float32Array(COUNT * 3);
    const pTarget = new Float32Array(COUNT * 3);
    const s = new Float32Array(COUNT);
    const sp = new Float32Array(COUNT);
    const c = new Float32Array(COUNT * 3);

    const cWood = new THREE.Color(PALETTE.DARK_WOOD);
    const cDeep = new THREE.Color(PALETTE.DEEP_GREEN);
    const cForest = new THREE.Color(PALETTE.FOREST_GREEN);
    const cPine = new THREE.Color(PALETTE.PINE_GREEN);
    const cEmerald = new THREE.Color(PALETTE.EMERALD);
    const cLime = new THREE.Color(PALETTE.LIME_ACCENT);
    const cFrost = new THREE.Color(PALETTE.FROST);

    for (let i = 0; i < COUNT; i++) {
      const target = getTreePosition(10, 4.5, 14); 
      pTarget[i * 3] = target.x;
      pTarget[i * 3 + 1] = target.y;
      pTarget[i * 3 + 2] = target.z;

      const chaos = randomPointInSphere(15);
      pChaos[i * 3] = chaos.x;
      pChaos[i * 3 + 1] = chaos.y;
      pChaos[i * 3 + 2] = chaos.z;

      s[i] = Math.random() * 0.14 + 0.05;
      sp[i] = Math.random() * 0.5 + 0.5;

      // Color Grading with Volume Shadow
      const radius = Math.sqrt(target.x*target.x + target.z*target.z);
      const yNorm = (target.y + 5) / 10;
      const maxR = (1 - yNorm) * 4.5;
      const ratio = radius / (maxR + 0.001); 

      const mixedColor = cDeep.clone();
      
      // Much darker core for "ambient occlusion" feel
      if (ratio < 0.25) {
          mixedColor.lerp(cWood, 0.8);
          // Darken it further
          mixedColor.multiplyScalar(0.6);
      } else if (ratio < 0.55) {
          mixedColor.lerp(cPine, 0.8);
      } else if (ratio < 0.85) {
          mixedColor.lerp(cForest, 0.9);
      } else {
          // Tips
          mixedColor.lerp(cEmerald, 1.0);
          
          const tipRandom = Math.random();
          if (tipRandom > 0.8) {
             mixedColor.lerp(cLime, 0.5); 
             s[i] *= 1.2; 
          }
          if (tipRandom > 0.95) {
             mixedColor.lerp(cFrost, 0.8); 
             // s[i] *= 1.5; 
          }
      }

      c[i * 3] = mixedColor.r;
      c[i * 3 + 1] = mixedColor.g;
      c[i * 3 + 2] = mixedColor.b;
    }

    return {
      positionsChaos: pChaos,
      positionsTarget: pTarget,
      sizes: s,
      speeds: sp,
      colors: c
    };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      const targetProgress = appState === AppState.FORMED ? 1.0 : 0.0;
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        targetProgress,
        0.02
      );
    }
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 }
  }), []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positionsTarget.length / 3} array={positionsTarget} itemSize={3} />
        <bufferAttribute attach="attributes-aTarget" count={positionsTarget.length / 3} array={positionsTarget} itemSize={3} />
        <bufferAttribute attach="attributes-aChaos" count={positionsChaos.length / 3} array={positionsChaos} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={sizes.length} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed" count={speeds.length} array={speeds} itemSize={1} />
        <bufferAttribute attach="attributes-aColor" count={colors.length} array={colors} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending} 
      />
    </points>
  );
};