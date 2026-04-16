"use client";

import { useMemo, useRef, useState, useEffect, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * TechBonsai: Final High-Fidelity Zen-Tech Edition
 * 
 * - TRUNK: Weathered Spline with organic jitter and tapering.
 * - BARK: High-quality Fractal Noise CanvasTexture (No external images).
 * - FLOWERS: Dense InstancedMesh Sakura Clusters (High-density cloud).
 * - PERFORMANCE: Instanced rendering for 5000+ blossoms.
 */

export function TechBonsai() {
  const groupRef = useRef<THREE.Group>(null);
  const [mode, setMode] = useState<"sakura" | "momiji">("sakura");
  
  useEffect(() => {
    const currentMode = document.documentElement.getAttribute("data-mode") as "sakura" | "momiji";
    if (currentMode) setMode(currentMode);

    const observer = new MutationObserver(() => {
      const newMode = document.documentElement.getAttribute("data-mode") as "sakura" | "momiji";
      if (newMode) setMode(newMode);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mode"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <Suspense fallback={null}>
      <BonsaiScene mode={mode} groupRef={groupRef} />
    </Suspense>
  );
}

function BonsaiScene({ mode, groupRef }: { mode: "sakura" | "momiji"; groupRef: any }) {
  // 1. HIGH-FIDELITY FRACTAL BARK GENERATOR
  const barkTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Base color (Gnarled Bark Charcoal/Gray-Brown)
    ctx.fillStyle = "#2a221b"; 
    ctx.fillRect(0, 0, 1024, 1024);

    // Layer 1: Grain (Many small random streaks)
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const w = 1 + Math.random() * 2;
        const h = 50 + Math.random() * 200;
        ctx.fillStyle = `rgba(50, 40, 30, ${0.3 + Math.random() * 0.3})`;
        ctx.fillRect(x, y, w, h);
    }

    // Layer 2: Deep Fissures (Darker, thicker vertical cracks)
    for (let i = 0; i < 60; i++) {
        const x = Math.random() * 1024;
        const w = 4 + Math.random() * 8;
        ctx.fillStyle = "rgba(10, 8, 5, 0.7)";
        // Draw a rugged crack
        ctx.beginPath();
        ctx.moveTo(x, 0);
        let curX = x;
        for (let y = 0; y < 1024; y += 40) {
            curX += (Math.random() - 0.5) * 20;
            ctx.lineTo(curX, y);
        }
        ctx.lineWidth = w;
        ctx.stroke();
    }

    // Layer 3: Weathering Highlights (Lighter stone-gray highlights)
    for (let i = 0; i < 400; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        ctx.fillStyle = `rgba(140, 130, 120, ${Math.random() * 0.15})`;
        ctx.fillRect(x, y, 2 + Math.random() * 3, 20 + Math.random() * 50);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4); // Stretch along the trunk length
    return tex;
  }, []);

  const timer = useMemo(() => new THREE.Timer(), []);

  // 2. WEATHERED GNARLED TRUNK GEOMETRY logic
  const treeData = useMemo(() => {
    // Main heavy gnarled trunk with organic jitter
    const curvePoints = [
      new THREE.Vector3(0, -4.0, 0),
      new THREE.Vector3(0.8, -2.8, 0.3),
      new THREE.Vector3(-0.4, -1.2, 0.5),
      new THREE.Vector3(0.2, 0, 0.2),
    ];
    
    // Add jitter to make it "weathered" (per reference image)
    const jitteredPoints = curvePoints.map(p => p.clone().add(new THREE.Vector3((Math.random()-0.5)*0.2, 0, (Math.random()-0.5)*0.2)));
    const mainCurve = new THREE.CatmullRomCurve3(jitteredPoints);
    
    const branches: { curve: THREE.CatmullRomCurve3; radius: number; tip: THREE.Vector3 }[] = [];
    
    const addGnarledBranch = (start: THREE.Vector3, dir: THREE.Vector3, len: number, thick: number) => {
        const bp = [
            start.clone(),
            start.clone().add(dir.clone().multiplyScalar(len * 0.4)).add(new THREE.Vector3(Math.random()-0.5, 0.6, Math.random()-0.5)),
            start.clone().add(dir.clone().multiplyScalar(len)).add(new THREE.Vector3(Math.random()-0.5, 0.2, Math.random()-0.5))
        ];
        const bc = new THREE.CatmullRomCurve3(bp);
        branches.push({ curve: bc, radius: thick, tip: bp[2] });
    };

    // Splitting logic to match the broad tree in the image
    addGnarledBranch(jitteredPoints[3], new THREE.Vector3(1.5, 0.4, 0.8), 3.0, 0.18);
    addGnarledBranch(jitteredPoints[3], new THREE.Vector3(-1.8, 0.6, -0.4), 2.5, 0.16);
    addGnarledBranch(jitteredPoints[3], new THREE.Vector3(0.3, 1.2, -1.2), 2.8, 0.14);
    addGnarledBranch(jitteredPoints[2], new THREE.Vector3(-2.2, 0.3, 1.2), 2.2, 0.22);
    addGnarledBranch(jitteredPoints[2], new THREE.Vector3(1.2, 0.1, -1.5), 2.0, 0.18);

    return { mainCurve, branches };
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    timer.update();
    const time = timer.getElapsed();
    // Heavy sway (organic breathing)
    groupRef.current.position.y = -0.5 + Math.sin(time * 0.7) * 0.12;
    groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.04;
  });

  const bloomColor = mode === "sakura" ? "#fecaca" : "#fbbf24";
  const trunkBaseColor = mode === "sakura" ? "#4a3c31" : "#2a1b15";

  return (
    <group ref={groupRef}>
      {/* 3. GNARLED TRUNK RENDER */}
      <mesh castShadow receiveShadow>
        <tubeGeometry args={[treeData.mainCurve, 40, 0.55, 16, false]} />
        <meshStandardMaterial 
          map={barkTexture} 
          color={trunkBaseColor} 
          roughness={1} 
          metalness={0} 
        />
      </mesh>

      {/* 4. GNARLED BRANCHES RENDER */}
      {treeData.branches.map((b, i) => (
        <mesh key={`b-${i}`} castShadow>
          <tubeGeometry args={[b.curve, 24, b.radius, 10, false]} />
          <meshStandardMaterial map={barkTexture} color={trunkBaseColor} roughness={1} />
        </mesh>
      ))}

      {/* 5. DENSE SAKURA CLOUD (Instanced Rendering) */}
      {treeData.branches.map((b, i) => (
        <SakuraCloud key={`cloud-${i}`} position={b.tip} color={bloomColor} timer={timer} />
      ))}
    </group>
  );
}

const BLOSSOM_COUNT = 600; // x5 clusters = 3000 blossoms

function SakuraCloud({ position, color, timer }: { position: THREE.Vector3; color: string; timer: THREE.Timer }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummyMatrix = useMemo(() => new THREE.Matrix4(), []);
  const blossomData = useMemo(() => {
    return Array.from({ length: BLOSSOM_COUNT }, () => ({
      pos: new THREE.Vector3(
          (Math.random()-0.5) * 1.8, 
          (Math.random()-0.5) * 1.4, 
          (Math.random()-0.5) * 1.8
      ),
      scale: Math.random() * 0.12 + 0.04,
      rotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0)
    }));
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    const time = timer.getElapsed();

    blossomData.forEach((d, i) => {
        // Individual blossom jitter
        const sway = Math.sin(time + i) * 0.05;
        dummyMatrix.makeRotationFromEuler(d.rotation);
        dummyMatrix.scale(new THREE.Vector3(d.scale, d.scale, d.scale));
        dummyMatrix.setPosition(d.pos.x + sway, d.pos.y + sway, d.pos.z);
        meshRef.current?.setMatrixAt(i, dummyMatrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Pulsing emissive intensity
    if (meshRef.current.material) {
        (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.0 + Math.sin(time * 2) * 0.5;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BLOSSOM_COUNT]} position={position} frustumCulled={false}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={1} 
        roughness={0.8}
      />
    </instancedMesh>
  );
}
