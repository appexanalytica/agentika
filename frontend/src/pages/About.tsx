import Navigation from "@/components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="pt-32 pb-32 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-20 items-center">
              <div>
                <h1 className="text-minimal text-muted-foreground mb-4">NOSOTROS</h1>
                <h2 className="text-4xl md:text-6xl font-light text-architectural mb-12">
                  Filosofía de Diseño
                </h2>
                
                <div className="space-y-8">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Creemos que el software debería potenciar la experiencia humana sin sacrificar
                    la claridad del pensamiento. Nuestra práctica se centra en construir sistemas
                    funcionales y expresivos — donde la lógica de la máquina y la intuición de las
                    personas se encuentran y se amplifican mutuamente.
                  </p>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Fundados en 2019, hemos desarrollado más de 200 productos en los sectores
                    empresarial, cultural y de inteligencia artificial aplicada. Cada proyecto
                    comienza con escucha profunda y termina con ejecución cuidadosa.
                  </p>
                </div>
              </div>
              
              <div className="space-y-12">
                <div>
                  <h3 className="text-minimal text-muted-foreground mb-6">APPROACH</h3>
                  <div className="space-y-6">
                    <div className="border-l-2 border-architectural pl-6">
                      <h4 className="text-lg font-medium mb-2">Entendimiento</h4>
                      <p className="text-muted-foreground">Antes de escribir una línea, entendemos el problema: el negocio, las personas, el contexto.</p>
                    </div>
                    <div className="border-l-2 border-architectural pl-6">
                      <h4 className="text-lg font-medium mb-2">Colaboración</h4>
                      <p className="text-muted-foreground">Trabajamos cerca de nuestros clientes, sus equipos y sus datos — construimos juntos, no para.</p>
                    </div>
                    <div className="border-l-2 border-architectural pl-6">
                      <h4 className="text-lg font-medium mb-2">Inteligencia Aumentada</h4>
                      <p className="text-muted-foreground">Diseñamos agentes e sistemas que amplifican el juicio humano: no reemplazan a las personas, las llevan más lejos.</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-8 border-t border-border">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-minimal text-muted-foreground mb-2">FUNDADOS</h3>
                      <p className="text-xl">2019</p>
                    </div>
                    <div>
                      <h3 className="text-minimal text-muted-foreground mb-2">PROYECTOS</h3>
                      <p className="text-xl">200+</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
