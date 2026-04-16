"use client";

import React from "react";
import useCanvasCursor from "@/hooks/use-canvas-cursor";

export default function CanvasCursor() {
  useCanvasCursor();

  return (
    <canvas
      id="canvas"
      className="pointer-events-none fixed inset-0 z-[9999] h-screen w-screen"
    />
  );
}
