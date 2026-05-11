import { useEffect, useRef } from "react";

/**
 * Fixed full-site galaxy background.
 * - Soft random drift (perlin-like via summed sines)
 * - Parallax response to scroll
 * - Hover interaction (cursor pushes/illuminates nearby stars)
 * - DPR-aware, pauses when tab hidden
 */
const GalaxyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const scrollRef = useRef({ y: 0, target: 0 });
  const isDarkRef = useRef<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const updateTheme = () => {
      isDarkRef.current = document.documentElement.classList.contains("dark");
    };
    updateTheme();
    const themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Star = {
      x: number;
      y: number;
      z: number; // depth 0..1
      r: number;
      baseAlpha: number;
      twinkle: number;
      twinkleSpeed: number;
      hue: number;
      // random drift seeds
      sx: number;
      sy: number;
      fx: number;
      fy: number;
    };

    type Nebula = {
      x: number;
      y: number;
      r: number;
      hue: number;
      sx: number;
      sy: number;
    };

    let stars: Star[] = [];
    let nebulae: Nebula[] = [];

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density tuned for performance on mobile
      const isMobile = width < 768;
      const divisor = isMobile ? 3800 : 2000;
      const count = Math.min(560, Math.floor((width * height) / divisor));

      stars = new Array(count).fill(0).map(() => {
        const z = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          z,
          r: 0.35 + z * 2.1,
          baseAlpha: 0.35 + Math.random() * 0.65,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.006 + Math.random() * 0.022,
          hue: 190 + Math.random() * 120,
          sx: rand(0.0004, 0.0015),
          sy: rand(0.0004, 0.0015),
          fx: Math.random() * Math.PI * 2,
          fy: Math.random() * Math.PI * 2,
        };
      });

      nebulae = new Array(isMobile ? 3 : 5).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.max(width, height) * (0.22 + Math.random() * 0.28),
        hue: [220, 250, 280, 200, 300][Math.floor(Math.random() * 5)],
        sx: rand(0.00015, 0.0004),
        sy: rand(0.00015, 0.0004),
      }));
    };

    build();

    const onResize = () => build();
    window.addEventListener("resize", onResize);

    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const onLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", (e) => {
      if (!e.relatedTarget) onLeave();
    });

    const onScroll = () => {
      scrollRef.current.target = window.scrollY || 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    let t = 0;
    let last = performance.now();
    let running = true;

    const render = (now: number) => {
      if (!running) return;
      const dt = Math.min(50, now - last);
      last = now;
      t += dt;

      // Smooth scroll easing for parallax
      scrollRef.current.y += (scrollRef.current.target - scrollRef.current.y) * 0.08;
      const scrollY = scrollRef.current.y;

      // Transparent clear so page sections show through
      ctx.clearRect(0, 0, width, height);

      const dark = isDarkRef.current;
      // In light mode: dark particles on light bg → invert lightness & alphas
      const starLightness = dark ? 96 : 40;
      const starAlphaMul = dark ? 1.2 : 1.5;
      const nebulaAlphaMul = dark ? 1.2 : 0.9;
      const nebulaLightness = dark ? 60 : 38;
      const auraColor = dark
        ? "hsla(260, 100%, 70%, 0.12)"
        : "hsla(260, 80%, 30%, 0.10)";

      // Nebulae with slow random drift + scroll parallax
      for (let i = 0; i < nebulae.length; i++) {
        const n = nebulae[i];
        const dx = Math.sin(t * n.sx + i) * 40;
        const dy = Math.cos(t * n.sy + i * 1.7) * 40;
        const py = n.y + dy - scrollY * 0.04;
        const px = n.x + dx;
        const grd = ctx.createRadialGradient(px, py, 0, px, py, n.r);
        grd.addColorStop(0, `hsla(${n.hue}, 80%, ${nebulaLightness}%, ${0.16 * nebulaAlphaMul})`);
        grd.addColorStop(0.5, `hsla(${n.hue}, 80%, ${nebulaLightness - 15}%, ${0.05 * nebulaAlphaMul})`);
        grd.addColorStop(1, `hsla(${n.hue}, 80%, ${nebulaLightness - 25}%, 0)`);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const active = mouseRef.current.active;
      const influence = 160;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.twinkle += s.twinkleSpeed;
        const twinkleA = 0.55 + Math.sin(s.twinkle) * 0.45;

        // Smooth random drift via summed sines (cheap pseudo-noise)
        const driftX =
          Math.sin(t * s.sx + s.fx) * 24 +
          Math.cos(t * s.sx * 0.6 + s.fy) * 14;
        const driftY =
          Math.cos(t * s.sy + s.fy) * 24 +
          Math.sin(t * s.sy * 0.7 + s.fx) * 14;

        // Parallax: deeper stars move less, foreground moves more
        const parallax = -scrollY * (0.05 + s.z * 0.35);

        const baseX = s.x + driftX * (0.4 + s.z * 0.6);
        const baseY = s.y + driftY * (0.4 + s.z * 0.6) + parallax;

        // Wrap vertically across the viewport so the cluster fills the page
        let py = ((baseY % height) + height) % height;
        let px = ((baseX % width) + width) % width;

        let glow = 0;
        let ox = 0;
        let oy = 0;

        if (active) {
          const ddx = px - mx;
          const ddy = py - my;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < influence) {
            const force = (1 - dist / influence) * (0.5 + s.z);
            ox = (ddx / (dist || 1)) * force * 16;
            oy = (ddy / (dist || 1)) * force * 16;
            glow = force;
          }
        }

        const fx = px + ox;
        const fy = py + oy;
        const alpha = Math.min(1, (s.baseAlpha * twinkleA + glow * 0.8) * starAlphaMul);
        const radius = s.r + glow * 2.2;

        if (glow > 0.08) {
          const halo = ctx.createRadialGradient(fx, fy, 0, fx, fy, radius * 6);
          const haloLight = dark ? 80 : 30;
          halo.addColorStop(0, `hsla(${s.hue}, 100%, ${haloLight}%, ${glow * 0.5})`);
          halo.addColorStop(1, `hsla(${s.hue}, 100%, ${haloLight}%, 0)`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(fx, fy, radius * 6, 0, Math.PI * 2);
          ctx.fill();
        }

        const lightness = dark ? starLightness + glow * 15 : starLightness - glow * 15;
        ctx.fillStyle = `hsla(${s.hue}, ${dark ? 100 : 70}%, ${lightness}%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(fx, fy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (active) {
        const aura = ctx.createRadialGradient(mx, my, 0, mx, my, influence);
        aura.addColorStop(0, auraColor);
        aura.addColorStop(1, "hsla(260, 100%, 70%, 0)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(mx, my, influence, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    const onVis = () => {
      if (document.visibilityState === "visible") {
        last = performance.now();
        if (running) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(render);
        }
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen pointer-events-none -z-10"
    />
  );
};

export default GalaxyBackground;
