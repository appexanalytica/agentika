const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Content */}
      <div className="relative z-10 w-full text-center max-w-4xl mx-auto px-3 sm:px-6 pointer-events-none overflow-visible">
        <h1 className="font-euronism inline-block max-w-full whitespace-nowrap text-[11.12vw] sm:text-[12.8vw] md:text-8xl lg:text-9xl text-foreground mb-8 reveal leading-[0.98] tracking-[0.01em] md:tracking-[-0.02em]">
          AGENTIKA
        </h1>
        <p className="font-montserrat-alt text-xl md:text-2xl text-foreground/70 tracking-wide max-w-2xl mx-auto reveal-delayed">
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
