import { useEffect, useState } from "react";

const Hero = () => {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    const updateScroll = () => {
      const scrollY = window.scrollY;
      const max = window.innerHeight * 0.75;
      setScrollProgress(Math.min(Math.max(scrollY, 0), max) / max);
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  const translateY = scrollProgress * -28;
  const baseScale = 1 - scrollProgress * 0.04;
  const headingScale = hovered ? baseScale * 1.04 : baseScale;
  const opacity = 1 - scrollProgress * 0.4;
  const blur = scrollProgress * 0.9;
  const glow = hovered ? 1 : 0.35;

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Content */}
      <div className="relative z-10 w-full text-center max-w-4xl mx-auto px-3 sm:px-6 overflow-visible pointer-events-auto">
        <h1
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`font-euronism inline-block max-w-full whitespace-nowrap text-[11.12vw] sm:text-[12.8vw] md:text-8xl lg:text-9xl text-foreground mb-8 leading-[0.98] tracking-[0.14em] md:tracking-[0.12em] transition-all duration-700 ease-out ${mounted ? "opacity-100" : "opacity-0"}`}
          style={{
            transform: `translateY(${translateY}px) scale(${headingScale})`,
            opacity,
            filter: `blur(${blur}px)`,
            textShadow: hovered
              ? "0 0 28px rgba(167,139,250,0.45), 0 0 60px rgba(255,255,255,0.06)"
              : `0 0 ${8 + scrollProgress * 20}px rgba(167,139,250,${0.12 + glow * 0.25})`,
            letterSpacing: mounted ? "0.14em" : "0.3em",
          }}
        >
          AGENTIKA
        </h1>
        <p className="font-montserrat-alt text-base leading-8 text-muted-foreground tracking-wide max-w-2xl mx-auto reveal-delayed transition-opacity duration-700 ease-out" style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(18px)" }}>
          Software Factory
        </p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 reveal-delayed pointer-events-none">
        <div className="w-px h-16 bg-foreground/40 mx-auto" />
        <div className="text-minimal text-foreground/60 mt-4 rotate-90 origin-center">
          SCROLL
        </div>
      </div>
    </section>
  );
};

export default Hero;
