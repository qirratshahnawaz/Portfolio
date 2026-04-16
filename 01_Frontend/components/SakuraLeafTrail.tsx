"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Realistic 3D Sakura (Cherry Blossom) Petal Trail
 * 
 * RESTORED ORIGINAL: 
 * - SAKURA GEOMETRY: Heart-shaped notch (double-lobe) at the top of the petal.
 * - GRADIENT: Soft pink-to-white translucence.
 */

const LEAF_COUNT = 150;
const SPAWN_THRESHOLD = 0.12; 

export default function SakuraLeafTrail() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isWide = window.matchMedia("(min-width: 768px)").matches;
    if (!isTouch && isWide) setShow(true);
  }, []);

  if (!show) return null;

  return <SakuraPetals />;
}

function SakuraPetals() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // 1. GENERATE PROCEDURAL TEXTURE (Original Sakura)
  const petalTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const d = 256; 
    ctx.translate(d, d);
    ctx.rotate(-Math.PI / 2); 
    
    // THE HEART-SHAPED PETAL PATH
    ctx.beginPath();
    ctx.moveTo(-20, -180);
    ctx.bezierCurveTo(-150, -100, -150, 80, -20, 180);
    ctx.lineTo(0, 160); 
    ctx.lineTo(20, 180);
    ctx.bezierCurveTo(150, 80, 150, -100, 20, -180);
    ctx.closePath();

    const pinkColors = {
      center: "rgba(255, 245, 248, 1)",
      mid: "rgba(255, 182, 193, 1)",
      edge: "rgba(255, 105, 180, 1)",
      vein: "rgba(255, 20, 147, 0.15)"
    };

    const grad = ctx.createRadialGradient(0, 0, 50, 0, 0, 220);
    grad.addColorStop(0, pinkColors.center); 
    grad.addColorStop(0.6, pinkColors.mid); 
    grad.addColorStop(1, pinkColors.edge);   
    ctx.fillStyle = grad;
    ctx.fill();

    // Subtle veins
    ctx.strokeStyle = pinkColors.vein;
    ctx.lineWidth = 1;
    for (let i = 0; i < 40; i++) {
        const ang = (i / 40 - 0.5) * 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -160);
        ctx.bezierCurveTo(Math.sin(ang) * 100, -50, Math.sin(ang) * 150, 100, Math.sin(ang) * 180, 160);
        ctx.stroke();
    }

    ctx.globalCompositeOperation = "lighter";
    const highlight = ctx.createLinearGradient(0, -200, 0, 200);
    highlight.addColorStop(0, "rgba(255, 255, 255, 0.2)");
    highlight.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = highlight;
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  }, []);

  // 2. GEOMETRY (Restore ShapeGeometry for better silhouette)
  const petalGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.1, -0.6);
    shape.bezierCurveTo(-0.7, -0.3, -0.7, 0.4, -0.1, 0.7);
    shape.lineTo(0, 0.6); 
    shape.lineTo(0.1, 0.7);
    shape.bezierCurveTo(0.7, 0.4, 0.7, -0.3, 0.1, -0.6);
    shape.closePath();

    const geo = new THREE.ShapeGeometry(shape, 12);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        pos.setZ(i, (x * x + y * y) * 0.15);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    geo.scale(0.4, 0.4, 0.4);
    return geo;
  }, []);

  const leaves = useMemo(() => {
    return Array.from({ length: LEAF_COUNT }, () => ({
      active: false,
      pos: new THREE.Vector3(-10000, -10000, 0),
      vel: new THREE.Vector3(0, 0, 0),
      rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      rotVel: new THREE.Euler(Math.random() * 0.04, Math.random() * 0.04, Math.random() * 0.04),
      scale: 0,
      life: 0,
      swayOffset: Math.random() * 100,
    }));
  }, []);

  const dummyMatrix = useMemo(() => new THREE.Matrix4(), []);
  const mousePos = useRef(new THREE.Vector2(-10000, -10000));
  const lastMousePos = useRef(new THREE.Vector2(-10000, -10000));
  const poolIndex = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      const y = "touches" in e ? e.touches[0].clientY : e.clientY;
      mousePos.current.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("touchstart", handleMove, { passive: true });
    window.addEventListener("touchmove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchstart", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, []);

  const timer = useMemo(() => new THREE.Timer(), []);

  useFrame((state, delta) => {
    const { viewport } = state;
    timer.update();
    const time = timer.getElapsed();
    const curX = (mousePos.current.x * viewport.width) / 2;
    const curY = (mousePos.current.y * viewport.height) / 2;

    // Standardize to 60fps for physics scaling
    const frameFactor = Math.min(delta * 60, 2.0); 

    const dist = lastMousePos.current.distanceTo(new THREE.Vector2(curX, curY));
    if (dist > SPAWN_THRESHOLD && mousePos.current.x !== -10000) {
        const leaf = leaves[poolIndex.current];
        leaf.active = true;
        leaf.pos.set(curX, curY, 0);
        leaf.vel.set((curX - lastMousePos.current.x) * 0.03 + (Math.random() - 0.5) * 0.01, -0.003 + (Math.random() - 0.5) * 0.005, (Math.random() - 0.5) * 0.02);
        leaf.life = 1.0;
        leaf.scale = 0.5 + Math.random() * 0.8;
        lastMousePos.current.set(curX, curY);
        poolIndex.current = (poolIndex.current + 1) % LEAF_COUNT;
    } else if (lastMousePos.current.x === -10000 && mousePos.current.x !== -10000) {
        lastMousePos.current.set(curX, curY);
    }

    if (meshRef.current) {
        leaves.forEach((leaf, i) => {
            if (!leaf.active) {
                dummyMatrix.makeScale(0, 0, 0);
                meshRef.current?.setMatrixAt(i, dummyMatrix);
                return;
            }
            
            // Physics scaled by delta
            leaf.vel.y -= 0.00045 * frameFactor; 
            leaf.vel.x *= Math.pow(0.96, frameFactor);   
            leaf.vel.z *= Math.pow(0.96, frameFactor);
            
            const sway = Math.sin(time * 1.2 + leaf.swayOffset) * 0.01;
            leaf.pos.x += (leaf.vel.x + sway) * frameFactor;
            leaf.pos.y += leaf.vel.y * frameFactor;
            leaf.pos.z += leaf.vel.z * frameFactor;
            
            leaf.rot.x += (leaf.rotVel.x + sway * 1.5) * frameFactor;
            leaf.rot.y += leaf.rotVel.y * frameFactor;
            leaf.rot.z += leaf.rotVel.z * frameFactor;
            
            leaf.life -= 0.0025 * frameFactor; 
            if (leaf.life <= 0) leaf.active = false;
            
            const s = leaf.scale * Math.min(1.0, leaf.life * 4.0);
            dummyMatrix.makeRotationFromEuler(leaf.rot);
            dummyMatrix.scale(new THREE.Vector3(s, s, s));
            dummyMatrix.setPosition(leaf.pos);
            meshRef.current?.setMatrixAt(i, dummyMatrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[petalGeometry, undefined, LEAF_COUNT]} frustumCulled={false}>
      <meshStandardMaterial map={petalTexture} transparent alphaTest={0.05} opacity={0.9} roughness={0.4} metalness={0.1} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}
