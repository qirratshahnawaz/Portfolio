"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Ring diameter in pixels (outer edge-to-edge)
const RING_SIZE = 36;

/**
 * CursorRing — a glowing ring that trails the native cursor with a springy lag.
 *
 * The native system cursor stays fully visible. The ring floats behind it
 * as a decorative, non-interactive overlay.
 *
 * Architecture notes:
 *  - `useMotionValue` stores raw mouse coords (zero re-renders).
 *  - `useSpring` adds a smooth trailing lag so the ring "catches up".
 *  - `pointer-events: none` ensures clicks/selections pass straight through.
 *  - The ring starts off-screen (-100, -100) and only becomes visible
 *    after the first mousemove to avoid a flash at (0, 0) on load.
 */
export default function CursorRing() {
  // Whether we're on a desktop device (no touch, wide viewport)
  const [isDesktop, setIsDesktop] = useState(false);
  // Whether the mouse is currently inside the browser viewport
  const [isVisible, setIsVisible] = useState(false);

  // --- Raw mouse coordinates (not reactive — no re-renders) ---
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // --- Spring-smoothed values for the trailing effect ---
  // Lower stiffness + higher damping = more visible "floaty" lag
  const springX = useSpring(mouseX, { damping: 20, stiffness: 150, mass: 0.6 });
  const springY = useSpring(mouseY, { damping: 20, stiffness: 150, mass: 0.6 });

  useEffect(() => {
    // SSR guard — never touch `window` at the module level
    if (typeof window === "undefined") return;

    // Bail on touch-primary devices (phones, tablets)
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isWideEnough = window.matchMedia("(min-width: 768px)").matches;

    if (isTouchDevice || !isWideEnough) {
      setIsDesktop(false);
      return; // no listeners needed on mobile
    }

    setIsDesktop(true);

    // ── Event handlers ──────────────────────────────────────────

    /** Feed every mouse position into the raw motion values */
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true); // first move reveals the ring
    };

    /** Fade out when the cursor leaves the browser chrome */
    const handleMouseLeave = () => setIsVisible(false);

    /** Fade back in when the cursor returns */
    const handleMouseEnter = () => setIsVisible(true);

    /** Adapt if the viewport crosses the 768px breakpoint */
    const handleResize = () => {
      const stillWide = window.matchMedia("(min-width: 768px)").matches;
      setIsDesktop(stillWide);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("resize", handleResize);
    };
  }, [mouseX, mouseY]);

  // Render nothing on mobile / touch devices
  if (!isDesktop) return null;

  return (
    <motion.div
      aria-hidden="true" // purely decorative — invisible to assistive tech
      style={{
        // Spring-smoothed position
        x: springX,
        y: springY,
        // Center the ring on the cursor point
        translateX: "-50%",
        translateY: "-50%",
        // Fixed size
        width: RING_SIZE,
        height: RING_SIZE,
      }}
      className={`
        fixed top-0 left-0 z-9999
        pointer-events-none
        rounded-full
        border-[1.5px]
        border-[#2A1B1B]/30 dark:border-[#F5AFAF]/40
      `}
      // Animate opacity + a soft glow together
      animate={{
        opacity: isVisible ? 1 : 0,
        // Pulsing box-shadow creates the "glow" effect
        boxShadow: isVisible
          ? [
              // Two-keyframe pulse: subtle → brighter → subtle
              "0 0 8px 2px rgba(245,175,175,0.15), inset 0 0 6px 1px rgba(245,175,175,0.08)",
              "0 0 14px 4px rgba(245,175,175,0.28), inset 0 0 8px 2px rgba(245,175,175,0.14)",
              "0 0 8px 2px rgba(245,175,175,0.15), inset 0 0 6px 1px rgba(245,175,175,0.08)",
            ]
          : "0 0 0px 0px rgba(245,175,175,0)",
      }}
      transition={{
        opacity: { duration: 0.2 },
        boxShadow: {
          duration: 2.4,   // one full pulse cycle
          repeat: Infinity, // loop the glow forever
          ease: "easeInOut",
        },
      }}
    />
  );
}
