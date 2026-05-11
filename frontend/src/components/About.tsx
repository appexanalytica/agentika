import { useEffect, useMemo, useRef, useState } from "react";

type CardItem = {
  title: string;
  body: string;
  statLabel: string;
  statValue: string;
  hue: number;
};

const cards: CardItem[] = [
  {
    title: "Claridad",
    body: "Diseñamos interfaces que se entienden al primer vistazo, con jerarquías limpias y caminos de acción claros para todo usuario y equipo.",
    statLabel: "Impacto",
    statValue: "95%",
    hue: 250,
  },
  {
    title: "Ritmo",
    body: "Iteramos rápido sobre prototipos reales, aprendiendo cada semana para asegurar que la solución avance con enfoque y sin desperdicio.",
    statLabel: "Adopción",
    statValue: "84%",
    hue: 190,
  },
  {
    title: "Sostenibilidad",
    body: "Construimos sistemas que pueden crecer: tecnologías maduras, documentación accesible y decisiones de diseño pensadas para la continuidad.",
    statLabel: "Longevidad",
    statValue: "12 años",
    hue: 40,
  },
];

const About = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayValue, setDisplayValue] = useState("0%");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const targetHueRef = useRef(cards[0].hue);

  useEffect(() => {
    targetHueRef.current = cards[activeIndex].hue;
    const target = cards[activeIndex].statValue;
    let frame = 0;

    if (target.endsWith("%")) {
      const numericTarget = Number(target.replace("%", ""));
      let current = 0;

      const animate = () => {
        current = Math.min(current + 1, numericTarget);
        setDisplayValue(`${current}%`);
        if (current < numericTarget) {
          frame = requestAnimationFrame(animate);
        }
      };

      setDisplayValue("0%");
      frame = requestAnimationFrame(animate);
    } else {
      setDisplayValue(target);
    }

    return () => cancelAnimationFrame(frame);
  }, [activeIndex]);

  const pointerRef = useRef({ x: 0, y: 0, active: false });

  const stars = useMemo(
    () =>
      Array.from({ length: 120 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.2 + 0.2,
        alpha: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.3 + 0.05,
        phase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.0006,
        vy: (Math.random() - 0.5) * 0.0006,
      })),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
      const width = section.offsetWidth;
      const height = section.offsetHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handlePointerMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      pointerRef.current.x = (event.clientX - rect.left) / rect.width;
      pointerRef.current.y = (event.clientY - rect.top) / rect.height;
      pointerRef.current.active = true;
    };

    const handlePointerEnter = () => {
      pointerRef.current.active = true;
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    const handleTouchStart = (event: TouchEvent) => {
      const rect = section.getBoundingClientRect();
      const touch = event.touches[0];
      if (!touch) return;
      pointerRef.current.x = (touch.clientX - rect.left) / rect.width;
      pointerRef.current.y = (touch.clientY - rect.top) / rect.height;
      pointerRef.current.active = true;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const rect = section.getBoundingClientRect();
      const touch = event.touches[0];
      if (!touch) return;
      pointerRef.current.x = (touch.clientX - rect.left) / rect.width;
      pointerRef.current.y = (touch.clientY - rect.top) / rect.height;
      pointerRef.current.active = true;
    };

    const handleTouchEnd = () => {
      pointerRef.current.active = false;
    };

    section.addEventListener("pointermove", handlePointerMove);
    section.addEventListener("pointerenter", handlePointerEnter);
    section.addEventListener("pointerleave", handlePointerLeave);
    section.addEventListener("touchstart", handleTouchStart, { passive: true });
    section.addEventListener("touchmove", handleTouchMove, { passive: true });
    section.addEventListener("touchend", handleTouchEnd);
    section.addEventListener("touchcancel", handleTouchEnd);

    let currentHue = cards[activeIndex].hue;
    let frame = 0;
    let t = 0;

    const drawStars = () => {
      if (!canvasRef.current) return;

      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const px = pointerRef.current.active ? pointerRef.current.x : 0.5;
      const py = pointerRef.current.active ? pointerRef.current.y : 0.5;
      const hasPointer = pointerRef.current.active;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        const dx = px - star.x;
        const dy = py - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.0001;
        const influence = Math.max(0, 1 - dist * 1.6);
        const gravity = hasPointer ? influence * 0.00022 : 0;
        const spin = hasPointer ? influence * 0.00012 : 0;
        const chaos = hasPointer ? 1.1 + influence * 1.8 : 1;

        star.vx += dx * gravity - dy * spin + (Math.random() - 0.5) * 0.00008 * chaos;
        star.vy += dy * gravity + dx * spin + (Math.random() - 0.5) * 0.00008 * chaos;
        star.vx *= hasPointer ? 0.92 : 0.94;
        star.vy *= hasPointer ? 0.92 : 0.94;

        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x += 1;
        if (star.x > 1) star.x -= 1;
        if (star.y < 0) star.y += 1;
        if (star.y > 1) star.y -= 1;

        const x = star.x * width;
        const y = star.y * height;
        const alpha = star.alpha * (0.65 + 0.35 * Math.sin(t * star.speed + star.phase));

        ctx.beginPath();
        ctx.arc(x, y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${currentHue}, 75%, 85%, ${alpha})`;
        ctx.fill();
      });

      t += 0.02;
      currentHue += (targetHueRef.current - currentHue) * 0.02;
      frame = requestAnimationFrame(drawStars);
    };

    drawStars();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      section.removeEventListener("pointermove", handlePointerMove);
      section.removeEventListener("pointerenter", handlePointerEnter);
      section.removeEventListener("pointerleave", handlePointerLeave);
      section.removeEventListener("touchstart", handleTouchStart);
      section.removeEventListener("touchmove", handleTouchMove);
      section.removeEventListener("touchend", handleTouchEnd);
      section.removeEventListener("touchcancel", handleTouchEnd);
      cancelAnimationFrame(frame);
    };
  }, [stars]);

  return (
    <section id="about" className="pt-32 pb-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="relative rounded-[1.5rem] overflow-hidden bg-transparent min-h-[520px]">
          <div ref={sectionRef} className="relative w-full h-full">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden="true"
            />
            <div className="absolute bottom-[-80px] left-[-60px] w-[320px] h-[320px] rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute bottom-[-30px] left-[10px] w-[200px] h-[200px] rounded-full border border-white/5 pointer-events-none" />

            <div className="relative z-10 grid md:grid-cols-2 min-h-[520px]">
              <div className="p-10 md:p-16 border-r border-white/10 flex flex-col gap-6">
                <span className="text-xs uppercase tracking-[0.18em] text-[#b4a0ff]/80">Nuestra Filosofía</span>
                <h2 className="text-5xl md:text-6xl font-semibold leading-tight text-white">
                  Diseño con <span className="italic text-[#c4b5fd]">propósito</span>
                </h2>
                <p className="max-w-xl text-base leading-8 text-[#dccdffcc]">
                  No buscamos adornos por sí mismos. Creamos productos digitales que conectan con las necesidades reales de usuarios, procesos y equipos, sin perder la claridad de cada decisión.
                </p>
                <p className="max-w-xl text-sm text-[#c8bee6bf] leading-7">
                  Cada proyecto nace de un problema concreto y termina con una experiencia simplificada, coherente y escalable.
                </p>
                <div className="mt-auto flex gap-10">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#b4a0ff]/65 mb-2">{cards[activeIndex].statLabel}</p>
                    <p className="text-4xl font-semibold text-[#c4b5fd]">{displayValue}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#b4a0ff]/65 mb-2">Clientes</p>
                    <p className="text-4xl font-semibold text-[#c4b5fd]">120+</p>
                  </div>
                </div>
              </div>

              <div className="p-10 md:p-16 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#b4a0ff]/50 mb-6 inline-block">Principios</span>
                  <div className="space-y-4">
                    {cards.map((card, index) => {
                      const isActive = index === activeIndex;
                      return (
                        <button
                          key={card.title}
                          type="button"
                          onClick={() => setActiveIndex(index)}
                          className={`w-full text-left rounded-xl border px-5 py-4 transition-all duration-300 ${
                            isActive
                              ? "bg-white/5 border-[#c4b5fd]/30 shadow-[0_0_25px_rgba(196,181,253,0.06)]"
                              : "border-white/10 hover:border-[#b4a0ff]/30"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`block h-2.5 w-2.5 rounded-full transition-all ${isActive ? "bg-[#c4b5fd] shadow-[0_0_10px_rgba(196,181,253,0.45)]" : "bg-[#b4a0ff]/30"}`} />
                            <span className={`text-base font-medium transition-colors ${isActive ? "text-white" : "text-[#e6dcffcc]"}`}>
                              {card.title}
                            </span>
                            <span className={`ml-auto text-2xl transition-transform ${isActive ? "text-[#c4b5fd] rotate-90" : "text-[#b4a0ff]/50"}`}>
                              ›
                            </span>
                          </div>
                          <p className={`mt-4 text-sm leading-7 transition-all ${isActive ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`} style={{ color: isActive ? "rgba(200,190,230,0.85)" : "rgba(200,190,230,0)" }}>
                            {card.body}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
