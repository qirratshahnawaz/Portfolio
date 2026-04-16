import { useEffect, useRef } from "react";

interface RenderContext extends CanvasRenderingContext2D {
  running?: boolean;
  frame?: number;
}

interface PhaseWaveConfig {
  phase?: number;
  offset?: number;
  frequency?: number;
  amplitude?: number;
}

const useCanvasCursor = () => {
  const ctxRef = useRef<RenderContext | null>(null);
  const fRef = useRef<any>(null);
  const linesRef = useRef<any[]>([]);
  const posRef = useRef({
    x: 0,
    y: 0,
  });
  const animationFrameId = useRef<number | null>(null);

  const E = {
    friction: 0.5,
    trails: 20,
    size: 50,
    dampening: 0.25,
    tension: 0.98,
  };

  function PhaseWave({
    phase = 0,
    offset = 0,
    frequency = 0.001,
    amplitude = 1,
  }: PhaseWaveConfig) {
    let _phase = phase;
    return {
      update() {
        _phase += frequency;
        return offset + Math.sin(_phase) * amplitude;
      },
    };
  }

  class Node {
    x: number;
    y: number;
    vx: number;
    vy: number;

    constructor(x: number, y: number) {
      this.x = x || 0;
      this.y = y || 0;
      this.vx = 0;
      this.vy = 0;
    }
  }

  class Line {
    spring: number;
    friction: number;
    nodes: Node[];

    constructor(spring: number) {
      this.spring = spring + 0.1 * Math.random() - 0.02;
      this.friction = E.friction + 0.01 * Math.random() - 0.002;
      this.nodes = [];
      for (let i = 0; i < E.size; i++) {
        this.nodes.push(new Node(posRef.current.x, posRef.current.y));
      }
    }

    update() {
      let spring = this.spring;
      let t = this.nodes[0];
      t.vx += (posRef.current.x - t.x) * spring;
      t.vy += (posRef.current.y - t.y) * spring;

      for (let i = 0; i < this.nodes.length; i++) {
        t = this.nodes[i];
        if (i > 0) {
          const prev = this.nodes[i - 1];
          t.vx += (prev.x - t.x) * spring;
          t.vy += (prev.y - t.y) * spring;
          t.vx += prev.vx * E.dampening;
          t.vy += prev.vy * E.dampening;
        }
        t.vx *= this.friction;
        t.vy *= this.friction;
        t.x += t.vx;
        t.y += t.vy;
        spring *= E.tension;
      }
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.moveTo(this.nodes[0].x, this.nodes[0].y);

      for (let i = 1; i < this.nodes.length - 2; i++) {
        const c = this.nodes[i];
        const d = this.nodes[i + 1];
        const xc = (c.x + d.x) / 2;
        const yc = (c.y + d.y) / 2;
        ctx.quadraticCurveTo(c.x, c.y, xc, yc);
      }
      // curve through the last two points
      const secondLast = this.nodes[this.nodes.length - 2];
      const last = this.nodes[this.nodes.length - 1];
      ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
      ctx.stroke();
      ctx.closePath();
    }
  }

  const onMouseMove = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e) {
      posRef.current.x = e.touches[0].pageX;
      posRef.current.y = e.touches[0].pageY;
    } else {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
    }
  };

  const resizeCanvas = () => {
    if (!ctxRef.current) return;
    const canvas = ctxRef.current.canvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const render = () => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;

    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.globalCompositeOperation = "lighter";
    
    // Custom Color Mapping Logic (Strictly skipping Blue/Green)
    const t = fRef.current.update(); // 0 to 1
    
    let hue = 280; 
    let sat = 60;
    let light = 50;

    if (t < 0.33) {
      // Transition: Violet (260) -> Purple (280) -> Pink (330)
      const localT = t / 0.33;
      if (localT < 0.5) {
        hue = 260 + (localT * 2.0) * 20; // 260 to 280 (Violet to Purple)
      } else {
        hue = 280 + ((localT - 0.5) * 2.0) * 50; // 280 to 330 (Purple to Pink)
      }
    } else if (t < 0.66) {
      // Transition: Pink (330) -> Brown (30)
      // Note: We go through 360 (Red/Pink) to 30 (Orange/Brown) to avoid Blue/Green
      const localT = (t - 0.33) / 0.33;
      hue = 330 + localT * 60; // 330 to 390 (which is 30 in HSL)
      if (hue > 360) hue -= 360; 
      
      // Gradually darken and desaturate for the Brown phase
      sat = 60 - localT * 15;
      light = 50 - localT * 20;
    } else {
      // Transition: Brown (30) back to Violet (260)
      // Note: We "Jump" or sweep back through Red/Pink to avoid Blue/Green
      const localT = (t - 0.66) / 0.34;
      hue = 30 - localT * 130; // 30 down to -100 (which is 260 in HSL)
      if (hue < 0) hue += 360;
      
      sat = 45 + localT * 15;
      light = 30 + localT * 20;
    }

    ctx.strokeStyle = `hsla(${Math.round(hue)}, ${sat}%, ${light}%, 0.2)`;
    ctx.lineWidth = 1;

    for (let i = 0; i < E.trails; i++) {
      const line = linesRef.current[i];
      line.update();
      line.draw(ctx);
    }
    if (ctx.frame !== undefined) ctx.frame++;
    animationFrameId.current = window.requestAnimationFrame(render);
  };

  useEffect(() => {
    // Initial position to center
    posRef.current.x = window.innerWidth / 2;
    posRef.current.y = window.innerHeight / 2;

    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!canvas) return;

    ctxRef.current = canvas.getContext("2d") as RenderContext;
    if (!ctxRef.current) return;
    
    ctxRef.current.running = true;
    ctxRef.current.frame = 1;

    fRef.current = PhaseWave({
      phase: Math.random() * 2 * Math.PI,
      amplitude: 0.5,
      frequency: 0.003,
      offset: 0.5,
    });

    linesRef.current = [];
    for (let i = 0; i < E.trails; i++) {
      linesRef.current.push(new Line(0.4 + (i / E.trails) * 0.025));
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchstart", onMouseMove);
    window.addEventListener("touchmove", onMouseMove);
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("orientationchange", resizeCanvas);

    resizeCanvas();
    animationFrameId.current = window.requestAnimationFrame(render);

    return () => {
      if (ctxRef.current) ctxRef.current.running = false;
      if (animationFrameId.current) window.cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onMouseMove);
      window.removeEventListener("touchmove", onMouseMove);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("orientationchange", resizeCanvas);
    };
  }, []);
};

export default useCanvasCursor;
