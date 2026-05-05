const Services = () => {
  const services = [
    {
      number: "01",
      title: "PRODUCTOS DIGITALES",
      description: "Construimos software a medida que resuelve problemas reales — aplicaciones, plataformas y sistemas diseñados para durar y crecer con tu negocio."
    },
    {
      number: "02",
      title: "AGENTES DE INTELIGENCIA ARTIFICIAL",
      description: "Diseñamos agentes autónomos que trabajan junto a tu equipo: aprenden, deciden y actúan — para que las personas se enfoquen en lo que solo ellas pueden hacer."
    },
    {
      number: "03",
      title: "INTEGRACIÓN & AUTOMATIZACIÓN",
      description: "Conectamos tus sistemas existentes con inteligencia artificial aplicada, transformando flujos de trabajo manuales en procesos que se mueven solos."
    },
    {
      number: "04",
      title: "CONSULTORÍA ESTRATÉGICA",
      description: "Acompañamos a organizaciones que quieren incorporar IA con claridad: sin promesas vacías, con un camino concreto y criterio humano en cada paso."
    }
  ];

  return (
    <section id="services" className="py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-minimal text-muted-foreground mb-4">SERVICIOS</h2>
            <h3 className="text-4xl md:text-6xl font-light text-architectural">
              Lo Que Hacemos
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-x-20 gap-y-16">
            {services.map((service, index) => (
              <div key={index} className="group">
                <div className="flex items-start space-x-6">
                  <span className="text-minimal text-muted-foreground font-medium">
                    {service.number}
                  </span>
                  <div>
                    <h4 className="text-2xl font-light mb-4 text-architectural group-hover:text-muted-foreground transition-colors duration-500">
                      {service.title}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;