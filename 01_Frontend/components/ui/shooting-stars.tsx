"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  length: number;
  width: number;
  speed: number;
  opacity: number;
}

export const ShootingStars: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    const starCount = 20;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const createStar = (): Star => {
      const isTop = Math.random() > 0.5;
      return {
        x: isTop ? Math.random() * canvas.width * 1.5 : canvas.width + 50,
        y: isTop ? -100 : Math.random() * canvas.height * 0.5,
        length: Math.random() * 80 + 40,
        width: Math.random() * 3 + 1.5,
        speed: Math.random() * 1 + 0.8,
        opacity: Math.random() * 0.5 + 0.3,
      };
    };

    // Initialize stars
    stars = Array.from({ length: starCount }, createStar);

    const getThemeColors = () => {
      if (typeof window === "undefined") return { primary: "#f5afaf", secondary: "#ffffff" };
      
      const root = document.documentElement;
      const mode = root.getAttribute("data-mode") || "sakura";
      
      // We can also pull directly from computed styles for maximum accuracy
      const style = getComputedStyle(root);
      const primary = style.getPropertyValue("--primary").trim() || (mode === "sakura" ? "#f5afaf" : "#fff2cc");
      
      return { primary };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const { primary } = getThemeColors();

      stars.forEach((star, index) => {
        // Diagonal constants
        const angle = Math.PI / 4; // 45 degrees
        const dx = Math.cos(angle + Math.PI / 2) * star.length; // Moving left
        const dy = Math.sin(angle + Math.PI / 2) * star.length; // Moving down
        
        // Draw the star trail
        const gradient = ctx.createLinearGradient(
          star.x,
          star.y,
          star.x + dx,
          star.y + dy
        );
        
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(1, primary);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = star.width;
        ctx.lineCap = "round";
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x + dx, star.y + dy);
        ctx.stroke();

        // Add a small glow at the tip
        ctx.beginPath();
        ctx.fillStyle = primary;
        ctx.arc(star.x + dx, star.y + dy, star.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Update position (diagonal movement)
        // Adjust these multipliers to change the "steepness"
        star.x -= star.speed * 1.5; 
        star.y += star.speed;

        // Reset star if it goes off screen (bottom or left)
        if (star.y > canvas.height + 100 || star.x < -100) {
          stars[index] = createStar();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};
