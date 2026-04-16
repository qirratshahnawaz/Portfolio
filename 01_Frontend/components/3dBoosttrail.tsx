"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * ThreeDBoostTrail (Cinematic Solid Jet Edition)
 * 
 * Re-creates the Rocket League supersonic exhaust as a SINGLE SOLID MESH.
 * 0 PARTICLES USED.
 * 
 * This uses a custom ShaderMaterial to animate "Speed Streaks" along the length 
 * of a tapered geometric ribbon. This perfectly replicates the sharp, solid cyan 
 * beam seen in high-end game engines while being performant and non-blinding.
 */

// Custom GLSL Shader for that "Rocket League" streaky look
const RocketJetShader = {
  uniforms: {
    uColor: { value: new THREE.Color("#00FFFF") },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      // 1) Rocket Streaks Math: 
      // We animate a noise-like sine wave scrolling backwards (-uTime * 15.0) 
      // to create the "Speed Lines" seen in the reference image.
      float streaks = step(0.15, fract(vUv.x * 20.0 - uTime * 20.0)) * 0.4;
      float core = step(0.35, fract(vUv.x * 5.0 - uTime * 10.0)) * 0.3;
      
      // 2) Jet Tapering Gradient: 
      // Fades out the opacity aggressively toward the end of the tail (vUv.x)
      float alpha = (1.0 - vUv.x) * 0.9;
      
      // 3) Final Color Composition: 
      // Combines the solid cyan with the white-hot streaks
      vec3 finalColor = uColor + (streaks + core);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

function SolidRocketJet() {
  const meshRef = useRef<THREE.Mesh>(null);
  const count = 60; // Accuracy of the solid mesh
  
  // High-performance history buffer for the jet path
  const history = useRef<THREE.Vector3[]>(
    Array.from({ length: 30 }, () => new THREE.Vector3(-10000, -10000, 0))
  );

  const smoothX = useRef(-10000);
  const smoothY = useRef(-10000);
  const isFirstMove = useRef(true);

  // Buffer Geometry initialization
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1, 1, count - 1);
    return geo;
  }, []);

  const timer = useMemo(() => new THREE.Timer(), []);

  useFrame((state) => {
    const { pointer, viewport } = state;
    timer.update();
    const targetX = (pointer.x * viewport.width) / 2;
    const targetY = (pointer.y * viewport.height) / 2;

    // Teleport on the first movement
    if (isFirstMove.current && (pointer.x !== 0 || pointer.y !== 0)) {
       smoothX.current = targetX;
       smoothY.current = targetY;
       for (let i = 0; i < history.current.length; i++) {
           history.current[i].set(targetX, targetY, 0);
       }
       isFirstMove.current = false;
    }

    // Buttery physics lag
    smoothX.current += (targetX - smoothX.current) * 0.25;
    smoothY.current += (targetY - smoothY.current) * 0.25;

    history.current.unshift(new THREE.Vector3(smoothX.current, smoothY.current, 0));
    history.current.pop();

    const curve = new THREE.CatmullRomCurve3(history.current, false, "centripetal", 0.5);
    const points = curve.getPoints(count - 1);

    // Update the geometry to build a solid "Tapered Ribbon"
    if (meshRef.current) {
        const positions = (meshRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
        
        // Reusable vectors for cross-product math
        const tangent = new THREE.Vector3();
        const normal = new THREE.Vector3();

        for (let i = 0; i < count; i++) {
            const t = i / (count - 1); // 0 at head, 1 at tail
            
            // Jet Tapering Formula: Thick at cursor (0), sharp point at tail (1)
            const width = Math.pow(1.0 - t, 1.5) * 0.35; 
            
            const p = points[i];
            
            /**
             * FIXING THE ORIENTATION BUG:
             * Previously, we hardcoded width to (+/- Y). This failed when moving Up/Down.
             * Now, we calculate the TANGENT of the curve at each point, then rotate it 
             * 90 degrees to get the NORMAL. This forces the ribbon to always face 
             * sideways relative to its movement.
             */
            curve.getTangentAt(t, tangent); // Get direction of path
            
            // Safety: If tangent is zero (mouse didn't move), use a default up vector to prevent NaN crash
            if (tangent.lengthSq() < 0.00001) {
                normal.set(0, 1, 0).multiplyScalar(width);
            } else {
                normal.set(-tangent.y, tangent.x, 0).normalize().multiplyScalar(width);
            }
            
            // Top vertex of the ribbon (Point + normal)
            positions[i * 6 + 0] = p.x + normal.x;
            positions[i * 6 + 1] = p.y + normal.y;
            positions[i * 6 + 2] = 0;
            
            // Bottom vertex of the ribbon (Point - normal)
            positions[i * 6 + 3] = p.x - normal.x;
            positions[i * 6 + 4] = p.y - normal.y;
            positions[i * 6 + 5] = 0;
        }
        meshRef.current.geometry.attributes.position.needsUpdate = true;
        
        // Update the shader uniforms directly
        const material = meshRef.current.material as THREE.ShaderMaterial;
        if (material.uniforms) {
            material.uniforms.uTime.value = timer.getElapsed();
        }
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial 
        attach="material" 
        args={[RocketJetShader]} 
        transparent 
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function ThreeDBoostTrail() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isWide = window.matchMedia("(min-width: 768px)").matches;
    if (isTouch || !isWide) {
      setIsDesktop(false);
      return;
    }
    setIsDesktop(true);
  }, []);

  if (!isDesktop) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[8000]"
      style={{ display: "block" }} 
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <SolidRocketJet />

        {/* 
            ULTRA CLEAN BLOOM: 
            Dramatically lower intensity (0.1) just to give the Cyan a "Cinematic aura" 
            without whitening out the screen.
        */}
        <EffectComposer enableNormalPass={false}>
          <Bloom
            luminanceThreshold={1.0}
            mipmapBlur 
            intensity={0.15} 
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
