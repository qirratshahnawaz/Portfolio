"use client";

import { useState, useEffect } from "react";

let cachedResult: boolean | null = null;
let isChecking = false;

/**
 * Hook to detect WebGL support to prevent crashes on systems
 * where hardware acceleration is disabled.
 * 
 * SINGLETON PATTERN: Prevents context exhaustion by ensuring 
 * we only test for WebGL once per application lifecycle.
 */
export function useWebGLCheck() {
  const [isWebGLAvailable, setIsWebGLAvailable] = useState<boolean | null>(
    cachedResult,
  );

  useEffect(() => {
    if (cachedResult !== null || isChecking) return;
    
    isChecking = true;
    try {
      const canvas = document.createElement("canvas");
      // Use resilient settings for the test context
      const gl =
        canvas.getContext("webgl2", { 
          powerPreference: "low-power",
          failIfMajorPerformanceCaveat: false 
        }) ||
        canvas.getContext("webgl", { 
          powerPreference: "low-power" 
        }) ||
        canvas.getContext("experimental-webgl", { 
          powerPreference: "low-power" 
        });
      
      cachedResult = !!gl;
      setIsWebGLAvailable(cachedResult);
    } catch (e) {
      cachedResult = false;
      setIsWebGLAvailable(false);
    } finally {
      isChecking = false;
    }
  }, []);

  return isWebGLAvailable;
}
