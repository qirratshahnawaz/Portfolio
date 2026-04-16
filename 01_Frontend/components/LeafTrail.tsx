"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import heavy Three.js components - this removes ~500k of Three.js
// from the initial compilation graph, preventing the compilation hang on slow drives.
const SakuraLeafTrail = dynamic(() => import("./SakuraLeafTrail"), {
  ssr: false,
});
const MomijiLeafTrail = dynamic(() => import("./MomijiLeafTrail"), {
  ssr: false,
});
import { Canvas } from "@react-three/fiber";
import { useWebGLCheck } from "@/hooks/use-webgl-check";

/**
 * LeafTrail Dispatcher (Single-Context Architecture)
 *
 * Hosts a single, persistent WebGL context and switches between
 * Sakura and Momiji particle systems to prevent context exhaustion.
 */

export default function LeafTrail() {
  const [mode, setMode] = useState<"sakura" | "momiji">("sakura");
  const isWebGLAvailable = useWebGLCheck();

  useEffect(() => {
    // Initial mode check
    const currentMode = document.documentElement.getAttribute("data-mode") as
      | "sakura"
      | "momiji";
    if (currentMode) setMode(currentMode);

    // Watch for mode changes
    const observer = new MutationObserver(() => {
      const newMode = document.documentElement.getAttribute("data-mode") as
        | "sakura"
        | "momiji";
      if (newMode && newMode !== mode) setMode(newMode);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mode"],
    });
    return () => observer.disconnect();
  }, [mode]);

  // Handle detection state
  if (isWebGLAvailable === null) return null; 

  // Even if WebGL reports 'not supported', we attempt a force-render
  // with highly compatible settings to bypass environment restrictions.
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-8000 pointer-events-none"
      style={{ pointerEvents: 'none' }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 40 }}
        gl={{ 
          alpha: true, 
          antialias: false, 
          stencil: false,
          powerPreference: "low-power",
          precision: "lowp",
          failIfMajorPerformanceCaveat: false
        }}
        dpr={1}
        style={{ pointerEvents: 'none' }}
        eventSource={typeof document !== 'undefined' ? document.body : undefined}
        onCreated={({ gl }) => {
          // EXPLICIT CLEANUP: Ensures the browser releases the context immediately on unmount.
          // This prevents the "BindToCurrentSequence" error during development refreshes.
          const renderer = gl;
          return () => {
            const extension = renderer.getContext().getExtension('WEBGL_lose_context');
            if (extension) extension.loseContext();
            renderer.dispose();
          };
        }}
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1.0} />
        {mode === "sakura" ? <SakuraLeafTrail /> : <MomijiLeafTrail />}
      </Canvas>
    </div>
  );
}
