"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * High-Fidelity 3D Momiji (Maple) Leaf Trail
 *
 * - SILHOUETTE: 5-lobed jagged maple shape.
 * - TEXTURE: Yellow-to-red gradient with organic mottling and veins.
 * - SIZE: Reduced scale (0.4) for a more elegant and natural look.
 */

const LEAF_COUNT = 150;
const SPAWN_THRESHOLD = 0.12;

export default function MomijiLeafTrail() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isWide = window.matchMedia("(min-width: 768px)").matches;
    if (!isTouch && isWide) setShow(true);
  }, []);

  if (!show) return null;

  return <MomijiLeaves />;
}

function MomijiLeaves() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // 1. GENERATE PROCEDURAL TEXTURE (High-Fidelity Maple)
  const leafTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const d = 256;
    ctx.translate(d, d);
    ctx.rotate(-Math.PI / 2);

    // COLOR PALETTE FROM IMAGE - BRIGHTER & VIBRANT
    const colors = {
      center: "rgba(255, 240, 100, 1)", // Brighter Golden Yellow
      mid: "rgba(255, 160, 50, 1)", // More Vibrant Orange
      edge: "rgba(200, 50, 20, 1)", // Vibrant Autumn Red
      speckle: "rgba(150, 40, 20, 0.3)", // Softer mottling
      vein: "rgba(255, 255, 240, 0.5)", // Brighter veins
      stem: "rgba(230, 180, 170, 1)", // Lighter tan-pink stem
    };

    /**
     * DRAW INDIVIDUALIZED MAPLE LOBES
     * Each lobe has custom jagged points to match the reference image's anatomy.
     */
    const drawLobe = (
      angle: number,
      length: number,
      width: number,
      points: number,
    ) => {
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);

      const step = length / points;
      // Left side jagged
      for (let i = 1; i <= points; i++) {
        const y = -step * i;
        const x = -width * (i / points) * (Math.random() * 0.3 + 0.7);
        ctx.lineTo(x, y + step * 0.4);
        ctx.lineTo(x * 1.5, y + step * 0.2);
      }

      ctx.lineTo(0, -length); // The Tip

      // Right side jagged
      for (let i = points; i >= 1; i--) {
        const y = -step * i;
        const x = width * (i / points) * (Math.random() * 0.3 + 0.7);
        ctx.lineTo(x * 1.5, y + step * 0.2);
        ctx.lineTo(x, y + step * 0.4);
      }

      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const grad = ctx.createRadialGradient(0, 60, 10, 0, 0, 240);
    grad.addColorStop(0, colors.center);
    grad.addColorStop(0.5, colors.mid);
    grad.addColorStop(1.0, colors.edge);
    ctx.fillStyle = grad;

    // 1. TOP CENTRAL LOBE (Largest, 5 points)
    drawLobe(0, 240, 45, 5);

    // 2. UPPER-SIDE LOBES (Medium, 4 points)
    drawLobe(Math.PI / 4.5, 200, 40, 4);
    drawLobe(-Math.PI / 4.5, 200, 40, 4);

    // 3. LOWER-SIDE LOBES (Smallest, 3 points)
    drawLobe(Math.PI / 1.7, 130, 30, 3);
    drawLobe(-Math.PI / 1.7, 130, 30, 3);

    // 4. Mottling (Speckles)
    ctx.fillStyle = colors.speckle;
    for (let i = 0; i < 200; i++) {
      const r = Math.random() * 210;
      const a = Math.random() * Math.PI * 2;
      const size = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r, Math.sin(a) * r, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3 BOLD VEINS / 2 SMALL VEINS Structure
    const drawVein = (angle: number, length: number, isBold: boolean) => {
      ctx.save();
      ctx.rotate(angle);
      ctx.strokeStyle = colors.vein;
      ctx.lineWidth = isBold ? 4 : 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -length * 0.95);
      ctx.stroke();

      ctx.lineWidth = isBold ? 1.5 : 0.6;
      ctx.beginPath();
      for (let j = 1; j < 6; j++) {
        const y = -length * 0.15 * j;
        const subLen = isBold ? 25 : 12;
        ctx.moveTo(0, y);
        ctx.lineTo(subLen, y - 20);
        ctx.moveTo(0, y);
        ctx.lineTo(-subLen, y - 20);
      }
      ctx.stroke();
      ctx.restore();
    };

    drawVein(0, 240, true);
    drawVein(Math.PI / 4.5, 200, true);
    drawVein(-Math.PI / 4.5, 200, true);
    drawVein(Math.PI / 1.7, 130, false);
    drawVein(-Math.PI / 1.7, 130, false);

    // Stem
    ctx.strokeStyle = colors.stem;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 80);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  }, []);

  // 2. GEOMETRY (Fixed to a plane for alpha texture)
  const leafGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1, 12, 12);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, (x * x + y * y) * 0.25);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    // SIZE FIX: Reduced scale from 0.4 to 0.3 for a more elegant look
    geo.scale(0.3, 0.3, 0.3);
    return geo;
  }, []);

  const leaves = useMemo(() => {
    return Array.from({ length: LEAF_COUNT }, () => ({
      active: false,
      pos: new THREE.Vector3(-10000, -10000, 0),
      vel: new THREE.Vector3(0, 0, 0),
      rot: new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ),
      rotVel: new THREE.Euler(
        Math.random() * 0.04,
        Math.random() * 0.04,
        Math.random() * 0.04,
      ),
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
      mousePos.current.set(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1,
      );
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
      leaf.vel.set(
        (curX - lastMousePos.current.x) * 0.03 + (Math.random() - 0.5) * 0.01,
        -0.003 + (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.02,
      );
      leaf.life = 1.0;
      leaf.scale = 0.5 + Math.random() * 0.8;
      lastMousePos.current.set(curX, curY);
      poolIndex.current = (poolIndex.current + 1) % LEAF_COUNT;
    } else if (
      lastMousePos.current.x === -10000 &&
      mousePos.current.x !== -10000
    ) {
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
    <instancedMesh
      ref={meshRef}
      args={[leafGeometry, undefined, LEAF_COUNT]}
      frustumCulled={false}
    >
      <meshStandardMaterial
        map={leafTexture}
        transparent
        alphaTest={0.05}
        opacity={0.9}
        roughness={0.4}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}
