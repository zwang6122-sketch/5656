import * as THREE from 'three';
import React from 'react';

export enum AppState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED',
}

export interface ParticleData {
  chaosPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  speed: number;
  color: THREE.Color;
}

export const PALETTE = {
  EMERALD: '#005C29',
  DEEP_GREEN: '#002813', 
  FOREST_GREEN: '#1a472a', 
  PINE_GREEN: '#2d5a27', 
  DARK_WOOD: '#3d2817', 
  LIME_ACCENT: '#6a7f10', 
  
  // Luxury Metals
  GOLD: '#FFD700',
  RICH_GOLD: '#DAA520', 
  AMBER: '#FFB300', 
  SILVER: '#E0E0E0',
  CHAMPAGNE: '#F7E7CE',
  
  // Gemstones
  RED_RIBBON: '#8B0000',
  VELVET_RED: '#4a0404', 
  RUBY: '#E0115F',
  SAPPHIRE: '#0F52BA',
  MIDNIGHT_BLUE: '#191970', 
  
  // Organic / Sweets
  PEARL: '#FDFCF0', 
  FROST: '#F0F8FF',
  CANDY_RED: '#D90429',
  CANDY_WHITE: '#FFFDD0', // Cream
};

// Math helpers
export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

export const randomPointInSphere = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

// Advanced Tree Generator with Tiered Branches (Fir Tree Style)
export const getTreePosition = (height: number, baseRadius: number, layers: number = 14): THREE.Vector3 => {
  const yRatio = Math.random(); 
  const y = yRatio * height;
  
  // Base Cone Envelope
  const maxR = (1 - yRatio) * baseRadius;
  
  // Layer Logic: Use cosine wave to create branch tiers
  // Tiers are denser at the bottom, slightly more spread at top
  const layerPhase = yRatio * layers * Math.PI * 2;
  const branchWave = Math.cos(layerPhase); // -1 to 1
  
  // Normalize to 0..1, where 1 is "branch tip" and 0 is "gap"
  const layerFactor = (branchWave + 1) * 0.5;
  
  // Apply a curve so gaps are wider/distinct
  const branchShape = Math.pow(layerFactor, 0.6); 
  
  const theta = Math.random() * 2 * Math.PI;
  
  // Core vs Outer Needle distribution
  const isCore = Math.random() < 0.35; // 35% inner filler
  
  let r;
  if (isCore) {
      r = Math.random() * maxR * 0.45; // Inner core density
  } else {
      // Outer branches
      // Variance allows needles to exist along the branch length, not just at tips
      // We bias towards the tip for a lush look
      const variance = Math.pow(Math.random(), 0.3); // Bias towards 1
      // Combine envelope (maxR), layer shape (branchShape), and random variance
      r = maxR * (0.2 + 0.8 * branchShape * variance);
  }

  // Droop effect: Branches sag under gravity
  // Droop increases with distance from trunk (r) and is heavier at bottom (1-yRatio)
  const droopStrength = 0.8;
  const droop = (r / baseRadius) * droopStrength * (1.0 - yRatio * 0.3); 
  
  // Center the tree vertically around 0
  const finalY = y - height / 2 - droop;

  return new THREE.Vector3(
    r * Math.cos(theta),
    finalY,
    r * Math.sin(theta)
  );
};

export const randomPointOnCone = (height: number, baseRadius: number): THREE.Vector3 => {
    return getTreePosition(height, baseRadius, 0); 
};

// Augment JSX.IntrinsicElements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      group: any;
      points: any;
      bufferGeometry: any;
      bufferAttribute: any;
      shaderMaterial: any;
      instancedMesh: any;
      sphereGeometry: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      mesh: any;
      color: any;
      cylinderGeometry: any;
      dodecahedronGeometry: any;
      primitive: any;
      octahedronGeometry: any;
      coneGeometry: any;
      torusGeometry: any;
      icosahedronGeometry: any;
      tubeGeometry: any;
      torusKnotGeometry: any;
      tetrahedronGeometry: any;
      latheGeometry: any;
      meshPhysicalMaterial: any;
      extrudeGeometry: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      group: any;
      points: any;
      bufferGeometry: any;
      bufferAttribute: any;
      shaderMaterial: any;
      instancedMesh: any;
      sphereGeometry: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      mesh: any;
      color: any;
      cylinderGeometry: any;
      dodecahedronGeometry: any;
      primitive: any;
      octahedronGeometry: any;
      coneGeometry: any;
      torusGeometry: any;
      icosahedronGeometry: any;
      tubeGeometry: any;
      torusKnotGeometry: any;
      tetrahedronGeometry: any;
      latheGeometry: any;
      meshPhysicalMaterial: any;
      extrudeGeometry: any;
    }
  }
}