const Contact = () => {
  return (
    <section id="contact" className="py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20">
            <div>
              <h2 className="text-minimal text-muted-foreground mb-4">CONTACTANOS</h2>
              <h3 className="text-4xl md:text-6xl font-light text-architectural mb-12">
                Construyamos Algo
                <br />
                Grandioso
              </h3>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-minimal text-muted-foreground mb-2">EMAIL</h4>
                  <a href="mailto:hola@agentika.com.ar" className="text-xl hover:text-muted-foreground transition-colors duration-300">
                    hola@agentika.com.ar
                  </a>
                </div>
                
                <div>
                  <h4 className="text-minimal text-muted-foreground mb-2">TELÉFONO</h4>
                  <a href="tel:+541124569524" className="text-xl hover:text-muted-foreground transition-colors duration-300">
                    +54 (11) 2456-9524
                  </a>
                </div>
                
                <div>
                  <h4 className="text-minimal text-muted-foreground mb-2">ESTUDIO</h4>
                  <address className="text-xl not-italic">
                    Saavedra 817
                    <br />
                    CABA, Argentina
                  </address>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <h4 className="text-minimal text-muted-foreground mb-6">SEGUINOS</h4>
                <div className="space-y-4">
                  <a href="#" className="block text-xl hover:text-muted-foreground transition-colors duration-300">
                    Instagram
                  </a>
                  <a href="#" className="block text-xl hover:text-muted-foreground transition-colors duration-300">
                    LinkedIn
                  </a>
                  <a href="#" className="block text-xl hover:text-muted-foreground transition-colors duration-300">
                    Behance
                  </a>
                </div>
              </div>
              
              <div className="pt-12 border-t border-border space-y-4">
                <p className="text-muted-foreground">
                  Cada proyecto comienza con una conversación honesta. Escuchamos tu visión,
                  entendemos el problema en profundidad, y construimos soluciones que no solo
                  resuelven — sino que sorprenden.
                </p>
                <p className="text-muted-foreground">
                  Si tenés un desafío que la tecnología convencional no ha podido resolver,
                  es probable que sea exactamente el tipo de problema que nos interesa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
