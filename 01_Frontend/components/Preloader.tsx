"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

/**
 * Preloader: Advanced 3D Zen-Tech Experience (Fixed Symmetry Edition)
 * 
 * - REVERTED: Back to the balanced version with 2D HTML Text and 3D Particles.
 * - SYMMETRY: High-fidelity shapes matching the cursor trail.
 */

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [mode, setMode] = useState<"sakura" | "momiji">("sakura");
  const [isExiting, setIsExiting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentMode = document.documentElement.getAttribute("data-mode") as "sakura" | "momiji";
    if (currentMode) setMode(currentMode);

    const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 1200);
    }, 3800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!mounted) return null;

  const themes = {
    sakura: {
      bg: "bg-white dark:bg-[#050507]",
      particle: "#fecaca",
      glow: "#fda4af",
      accent: "from-pink-50 via-white to-pink-50 dark:from-[#0a0a10] dark:via-black dark:to-[#0a0a10]"
    },
    momiji: {
      bg: "bg-[#fffcf0] dark:bg-[#070504]",
      particle: "#fb923c",
      glow: "#f97316",
      accent: "from-orange-50 via-[#fffcf0] to-orange-50 dark:from-[#100a0a] dark:via-black dark:to-[#100a0a]"
    }
  };

  const currentTheme = themes[mode];

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.8 }}
           className={`fixed inset-0 z-9999 h-screen w-screen overflow-hidden ${currentTheme.bg}`}
        >
          <div className={`absolute inset-0 bg-linear-to-b ${currentTheme.accent}`} />

          <Canvas 
            camera={{ position: [0, 0, 15], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            className="absolute inset-0 z-0"
          >
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color={currentTheme.glow} />
            
            <SceneContent 
              mode={mode} 
              isExiting={isExiting} 
              particleColor={currentTheme.particle} 
            />
          </Canvas>

          {/* 2D Text Overlay (REVERTED FOR CLARITY) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-6 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="flex flex-col items-center w-full"
              >
                  <h1 className={`text-2xl min-[400px]:text-3xl sm:text-4xl md:text-7xl font-bold tracking-[0.15em] md:tracking-[0.3em] mb-4 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] ${mode === "sakura" ? "text-pink-600 dark:text-pink-300" : "text-orange-700 dark:text-orange-400"}`}>
                    MUHAMMAD HAMZA
                  </h1>
                  <div className="flex items-center gap-2 md:gap-4 opacity-60 w-full justify-center">
                     <span className="w-8 md:w-12 h-px bg-current shrink-0" />
                     <p className="text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.6em] font-medium text-muted-foreground whitespace-nowrap">
                        Agentic Intelligence
                     </p>
                     <span className="w-8 md:w-12 h-px bg-current shrink-0" />
                  </div>
              </motion.div>
          </div>

          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-px bg-muted/20 overflow-hidden">
             <motion.div 
               initial={{ x: "-100%" }}
               animate={{ x: "100%" }}
               transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
               className={`h-full w-full ${mode === "sakura" ? "bg-pink-400" : "bg-orange-400"}`}
             />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SceneContent({ mode, isExiting, particleColor }: any) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 100;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const asset = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { geo: new THREE.BoxGeometry(), tex: new THREE.Texture() };
    const d = 256; ctx.translate(d, d); ctx.rotate(-Math.PI / 2);

    if (mode === "sakura") {
        ctx.beginPath(); ctx.moveTo(-20, -180); ctx.bezierCurveTo(-150, -100, -150, 80, -20, 180);
        ctx.lineTo(0, 160); ctx.lineTo(20, 180); ctx.bezierCurveTo(150, 80, 150, -100, 20, -180); ctx.closePath();
        const grad = ctx.createRadialGradient(0, 0, 50, 0, 0, 220);
        grad.addColorStop(0, "rgba(255, 245, 248, 1)"); grad.addColorStop(0.6, "rgba(255, 182, 193, 1)"); grad.addColorStop(1, "rgba(255, 105, 180, 1)");   
        ctx.fillStyle = grad; ctx.fill();
        const shape = new THREE.Shape();
        shape.moveTo(-0.1, -0.6); shape.bezierCurveTo(-0.7, -0.3, -0.7, 0.4, -0.1, 0.7);
        shape.lineTo(0, 0.6); shape.lineTo(0.1, 0.7); shape.bezierCurveTo(0.7, 0.4, 0.7, -0.3, 0.1, -0.6); shape.closePath();
        const geo = new THREE.ShapeGeometry(shape, 12); geo.scale(1.2, 1.2, 1.2);
        return { geo, tex: new THREE.CanvasTexture(canvas) };
    } else {
        ctx.fillStyle = "rgba(255, 160, 50, 1)";
        const drawLobe = (angle: number, length: number, width: number, points: number) => {
          ctx.save(); ctx.rotate(angle); ctx.beginPath(); ctx.moveTo(0, 0); const step = length / points;
          for (let i = 1; i <= points; i++) { const y = -step * i; const x = -width * (i / points); ctx.lineTo(x, y + step * 0.4); ctx.lineTo(x * 1.5, y + step * 0.2); }
          ctx.lineTo(0, -length);
          for (let i = points; i >= 1; i--) { const y = -step * i; const x = width * (i / points); ctx.lineTo(x * 1.5, y + step * 0.2); ctx.lineTo(x, y + step * 0.4); }
          ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); ctx.restore();
        };
        const grad = ctx.createRadialGradient(0, .1, .1, 0, 0, .5);
        grad.addColorStop(0, "rgba(255, 240, 100, 1)"); grad.addColorStop(1, "rgba(200, 50, 20, 1)"); ctx.fillStyle = grad;
        drawLobe(0, 240, 45, 5); drawLobe(Math.PI / 4.5, 200, 40, 4); drawLobe(-Math.PI / 4.5, 200, 40, 4);
        drawLobe(Math.PI / 1.7, 130, 30, 3); drawLobe(-Math.PI / 1.7, 130, 30, 3);
        const geo = new THREE.PlaneGeometry(1, 1); geo.scale(1.5, 1.5, 1.5);
        return { geo, tex: new THREE.CanvasTexture(canvas) };
    }
  }, [mode]);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [ (Math.random()-0.5)*40, (Math.random()-0.5)*40, (Math.random()-0.5)*40 ],
      rotation: [ Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI ],
      speed: Math.random() * 0.012 + 0.005,
      id: Math.random()
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    if (isExiting) {
        state.camera.position.z -= 0.7;
        if (state.camera instanceof THREE.PerspectiveCamera) {
          state.camera.fov += 0.8;
          state.camera.updateProjectionMatrix();
        }
    } else {
        state.camera.position.x = Math.sin(time * 0.15) * 3;
        state.camera.position.y = Math.cos(time * 0.15) * 2;
    }

    particles.forEach((p, i) => {
      dummy.position.set(p.position[0], p.position[1], p.position[2] + (time * 1.5 % 50) - 25);
      dummy.rotation.set(p.rotation[0] + time * p.speed, p.rotation[1] + time * p.speed, p.rotation[2] + Math.sin(time * p.speed)*0.5);
      dummy.scale.setScalar(0.4 + Math.sin(time + p.id) * 0.1);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[asset.geo, undefined, count]} frustumCulled={false}>
        <meshStandardMaterial 
          map={asset.tex} 
          transparent alphaTest={0.05} opacity={0.85} roughness={0.4} metalness={0.1} side={THREE.DoubleSide} 
        />
      </instancedMesh>
      <mesh position={[0,0,0]}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial color={particleColor} transparent opacity={0.04} />
      </mesh>
    </>
  );
}
