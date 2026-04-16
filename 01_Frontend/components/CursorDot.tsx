"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * CursorDot — a soft trailing dot that follows the mouse with a springy lag.
 *
 * - Uses `useMotionValue` for raw mouse coords (no re-renders).
 * - Feeds those into `useSpring` for a buttery-smooth trailing effect.
 * - Hides on touch/mobile devices and when the mouse leaves the viewport.
 * - `pointer-events: none` ensures it never blocks clicks or text selection.
 * - Initial position is off-screen so there's no flicker before the first move.
 */
export default function CursorDot() {
  // Track whether the component should render at all (desktop + mouse present)
  const [isDesktop, setIsDesktop] = useState(false);
  // Track whether the mouse is inside the browser window
  const [isVisible, setIsVisible] = useState(false);

  // Raw mouse coordinates — updated on every mousemove without causing re-renders
  const mouseX = useMotionValue(-100); // start off-screen to prevent initial flicker
  const mouseY = useMotionValue(-100);

  // Spring-smoothed values that trail behind the raw coords
  const springX = useSpring(mouseX, { damping: 25, stiffness: 200, mass: 0.5 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 200, mass: 0.5 });

  useEffect(() => {
    // SSR guard — `window` only exists in the browser
    if (typeof window === "undefined") return;

    // Detect touch-primary devices — skip the custom cursor entirely
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Also respect a narrow viewport as a proxy for mobile
    const isWideEnough = window.matchMedia("(min-width: 768px)").matches;

    if (isTouchDevice || !isWideEnough) {
      setIsDesktop(false);
      return; // bail — no listeners needed on mobile
    }

    setIsDesktop(true);

    // --- Event handlers ---

    /** Update raw motion values on every mouse move */
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);
    };

    /** Hide the dot when the cursor leaves the viewport */
    const handleMouseLeave = () => setIsVisible(false);

    /** Show the dot again when the cursor re-enters */
    const handleMouseEnter = () => setIsVisible(true);

    /** Re-evaluate on window resize (e.g. rotating a tablet) */
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

  // Don't render anything on mobile / touch devices
  if (!isDesktop) return null;

  return (
    <motion.div
      aria-hidden="true" // purely decorative — screen readers should ignore it
      style={{
        // Position with spring-smoothed values (translated so the dot is centered)
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      className={`
        fixed top-0 left-0 z-9999
        pointer-events-none
        w-3 h-3 rounded-full
        bg-[#2A1B1B] dark:bg-[#F5AFAF]
        shadow-[0_0_6px_rgba(42,27,27,0.15)]
        dark:shadow-[0_0_8px_rgba(245,175,175,0.25)]
        transition-opacity duration-200
      `}
      // Fade in/out when the mouse enters/leaves the viewport
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.15 }}
    />
  );
}
