import { useState } from "react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/hooks/useAPI";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiClient.post('/leads', {
        ...formData,
        source: 'web'
      });
      
      toast({
        title: "Mensaje enviado",
        description: "Te contactaremos pronto.",
      });
      
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="pt-32 pb-32 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-20">
              <div>
                <h1 className="text-minimal text-muted-foreground mb-4">CONTACTANOS</h1>
                <h2 className="text-4xl md:text-6xl font-light text-architectural mb-12">
                  Construyamos Algo
                  <br />
                  Grandioso
                </h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-minimal text-muted-foreground mb-2">EMAIL</h3>
                    <a href="mailto:hola@agentika.com.ar" className="text-xl hover:text-muted-foreground transition-colors duration-300">
                      hola@agentika.com.ar
                    </a>
                  </div>
                  
                  <div>
                    <h3 className="text-minimal text-muted-foreground mb-2">TELÉFONO</h3>
                    <a href="tel:+541124569524" className="text-xl hover:text-muted-foreground transition-colors duration-300">
                      +54 (11) 2456-9524
                    </a>
                  </div>
                  
                  <div>
                    <h3 className="text-minimal text-muted-foreground mb-2">ESTUDIO</h3>
                    <address className="text-xl not-italic">
                      Saavedra 817
                      <br />
                      CABA, Argentina
                    </address>
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-minimal text-muted-foreground mb-2 block">NOMBRE</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Tu nombre"
                    />
                  </div>
                  
                  <div>
                    <label className="text-minimal text-muted-foreground mb-2 block">EMAIL</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="tu@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="text-minimal text-muted-foreground mb-2 block">TELÉFONO (OPCIONAL)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="+54 11 1234-5678"
                    />
                  </div>
                  
                  <div>
                    <label className="text-minimal text-muted-foreground mb-2 block">EMPRESA (OPCIONAL)</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                  
                  <div>
                    <label className="text-minimal text-muted-foreground mb-2 block">MENSAJE</label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                      placeholder="Cuéntanos sobre tu proyecto..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary-glow transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
