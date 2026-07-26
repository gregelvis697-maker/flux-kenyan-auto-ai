import { useEffect, useRef } from "react";

/**
 * Lightweight canvas "network" visualisation used as the hero backdrop.
 * - Node count scales down on small screens
 * - Pauses when off-screen / tab hidden
 * - Respects prefers-reduced-motion (renders one static frame)
 */
export const HeroNetwork = ({ parallax = 0 }: { parallax?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parallaxRef = useRef(parallax);
  parallaxRef.current = parallax;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = true;
    let width = 0;
    let height = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile ? 26 : 60;
    const LINK_DIST = isMobile ? 110 : 150;

    const nodes = Array.from({ length: COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
      r: Math.random() * 1.6 + 0.6,
    }));

    const brand = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--brand").trim() ||
      "190 100% 50%";

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const b = brand();
      ctx.clearRect(0, 0, width, height);
      const offset = parallaxRef.current;

      for (const n of nodes) {
        if (!reduced) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > 1) n.vx *= -1;
          if (n.y < 0 || n.y > 1) n.vy *= -1;
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const ax = a.x * width;
        const ay = a.y * height + offset;
        for (let j = i + 1; j < nodes.length; j++) {
          const b2 = nodes[j];
          const bx = b2.x * width;
          const by = b2.y * height + offset;
          const d = Math.hypot(ax - bx, ay - by);
          if (d < LINK_DIST) {
            ctx.strokeStyle = `hsl(${b} / ${(1 - d / LINK_DIST) * 0.18})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
        ctx.fillStyle = `hsl(${b} / 0.55)`;
        ctx.beginPath();
        ctx.arc(ax, ay, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      if (!running) return;
      draw();
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduced) {
      draw();
    } else {
      loop();
    }

    const onResize = () => {
      resize();
      draw();
    };
    window.addEventListener("resize", onResize);

    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting && !reduced;
        if (running) loop();
        else cancelAnimationFrame(raf);
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        running = true;
        loop();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
};
