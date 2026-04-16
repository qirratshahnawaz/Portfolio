"use client";

import { useState, useEffect } from "react";
import { Preloader } from "./Preloader";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PreloaderWrapper: Optimized Entry State Manager
 * 
 * - ARCHITECTURE: Defer rendering of the entire portfolio until the preloader finishes.
 * - PERFORMANCE: Frees up 100% of browser resources for the entry animation.
 */

export function PreloaderWrapper({ children, name }: { children: React.ReactNode, name?: string }) {
  const [loading, setLoading] = useState(true);
  const [shouldRenderPortfolio, setShouldRenderPortfolio] = useState(false);

  // Handle detection finish
  const handleComplete = () => {
    setLoading(false);
    // Grant the browser a moment to breathe before mounting the heavy portfolio
    setTimeout(() => {
      setShouldRenderPortfolio(true);
    }, 200);
  };

  return (
    <div className="relative min-h-screen">
      <AnimatePresence mode="wait">
        {loading && <Preloader name={name} onComplete={handleComplete} key="preloader" />}
      </AnimatePresence>

      {/* 
        CRITICAL OPTIMIZATION: 
        We only mount 'children' after loading is done. 
        This prevents heavy "Hydration" work from lagging the animation.
      */}
      {shouldRenderPortfolio && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
