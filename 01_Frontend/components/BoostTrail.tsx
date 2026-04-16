"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * BoostTrail & Smooth Cursor Engine
 * 
 * Generates a buttery smooth, native-looking arrow cursor that floats via 
 * physics springs, rather than raw jittery hardware updates.
 * The SVG pointer strictly adheres to the exact same rendering coordinates 
 * as the Canvas trace, ensuring they are perfectly and physically welded together.
 */

type Point = {
  x: number;
  y: number;
  timestamp: number;
};

export default function BoostTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const animationFrameRef = useRef<number>(0);
  
  // Directly bind internal Framer Motion springs for perfectly synced drag physics.
  // We hide the real jittery hardware cursor via CSS and render a fake one on these springs!
  const rawMouseX = useMotionValue(-1000); // Start off-screen
  const rawMouseY = useMotionValue(-1000);
  
  // Damping configures the friction. Higher = less bounce, stiffer. Lower = very loose.
  const springX = useSpring(rawMouseX, { damping: 25, stiffness: 250, mass: 0.4 });
  const springY = useSpring(rawMouseY, { damping: 25, stiffness: 250, mass: 0.4 });
  
  const [isDesktop, setIsDesktop] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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

  useEffect(() => {
    if (!isDesktop) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const handleMouseMove = (e: MouseEvent) => {
      rawMouseX.set(e.clientX);
      rawMouseY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { capture: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    const TRAIL_LIFESPAN = 300; 
    let globalFade = 1;

    const renderLoop = () => {
      if (!ctx || !canvas) return;

      const now = Date.now();
      
      // Pull heavily smoothed coordinates straight out of the Framer Motion physics engine
      const sx = springX.get();
      const sy = springY.get();
      
      const lastP = pointsRef.current[pointsRef.current.length - 1];
      let shouldPush = true;
      if (lastP) {
        const dist = Math.hypot(lastP.x - sx, lastP.y - sy);
        // Teleport safety
        if (dist > 300) { pointsRef.current = []; }
        // Memory optimization: stop pushing points if spring has completely settled
        if (dist < 0.5) shouldPush = false; 
      }

      if (shouldPush) {
        pointsRef.current.push({ x: sx, y: sy, timestamp: now });
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pointsRef.current = pointsRef.current.filter((p) => now - p.timestamp < TRAIL_LIFESPAN);
      const points = pointsRef.current;

      if (points.length < 5) {
        globalFade = Math.max(0, globalFade - 0.1); 
      } else {
        globalFade = Math.min(1, globalFade + 0.1);
      }

      if (points.length > 1 && globalFade > 0) {
        ctx.globalAlpha = globalFade;
        
        ctx.lineCap = "square";
        ctx.lineJoin = "round"; 

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        
        ctx.strokeStyle = "rgba(255, 182, 193, 0.8)"; 
        ctx.lineWidth = 28; 
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#FFB6C1";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.strokeStyle = "rgba(255, 255, 255, 1)"; 
        ctx.lineWidth = 12; 
        ctx.shadowBlur = 0;
        ctx.stroke();

        ctx.globalAlpha = 1; 
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove, { capture: true });
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isDesktop, springX, springY]);

  if (!isDesktop) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ display: "block" }} 
    />
  );
}
