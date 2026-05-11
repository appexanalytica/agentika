import teamSenior from "@/assets/team-senior.jpg";
import infraestructuraPropia from "@/assets/infraestructura-propia.jpg";
import agentesIa from "@/assets/agentes-ia.jpg";

const Portfolio = () => {
  const pillars = [
    {
      number: "01",
      title: "INFRAESTRUCTURA PROPIA",
      description:
        "Nuestros sistemas corren en servidores propios, no en infraestructura de terceros. Eso significa control total sobre los datos, latencia optimizada para cada proyecto y una independencia que las plataformas cloud no pueden garantizar. Para startups que crecen rápido, esa base marca la diferencia entre escalar con orden o apagar incendios.",
      image: infraestructuraPropia as string | null,
    },
    {
      number: "02",
      title: "AGENTES DE IA ENTRENADOS IN HOUSE",
      description:
        "No integramos herramientas genéricas ni revendemos APIs. Construimos agentes de inteligencia artificial propios, entrenados y ajustados para cada contexto de negocio. El resultado son sistemas que entienden la lógica particular de cada cliente — y que con el tiempo se vuelven más precisos, más útiles, más parte del equipo.",
      image: agentesIa as string | null,
    },
    {
      number: "03",
      title: "EQUIPO SENIOR, CERO INTERMEDIARIOS",
      description:
        "Cada proyecto es ejecutado por profesionales con años de experiencia en desarrollo de alta complejidad. Sin juniors encubiertos, sin subcontrataciones. El equipo que presenta la propuesta es el equipo que construye el producto — con todo lo que eso implica en términos de criterio, velocidad y responsabilidad.",
      image: teamSenior,
    },
  ];

  return (
    <section id="work" className="py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <span className="text-xs uppercase tracking-[0.18em] text-[#b4a0ff]/80">ETHOS</span>
            <h3 className="text-5xl md:text-6xl font-semibold leading-tight text-white mt-4">
              Nuestros Pilares
            </h3>
          </div>

          <div className="space-y-20">
            {pillars.map((pillar, index) => (
              <div
                key={index}
                className="pb-20 border-b border-border last:border-b-0 last:pb-0"
              >
                <div className="mb-6">
                  <span className="text-minimal text-muted-foreground">
                    {pillar.number}
                  </span>
                </div>
                <div>
                  <h4 className="text-2xl md:text-3xl font-semibold text-white mb-6">
                    {pillar.title}
                  </h4>
                  {pillar.image && (
                    <div className="mb-8 overflow-hidden rounded-sm">
                      <img
                        src={pillar.image}
                        alt={pillar.title}
                        loading="lazy"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  <p className="text-base leading-8 text-[#dccdffcc]">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
