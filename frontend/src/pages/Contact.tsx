import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";

const contactSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  company: z.string().trim().max(100).optional(),
  budget: z.string().min(1, "Selecciona un presupuesto"),
  service: z.string().min(1, "Selecciona un servicio"),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mín. 10 caracteres)").max(1000),
});

type ContactForm = z.infer<typeof contactSchema>;

const initialForm: ContactForm = {
  name: "",
  email: "",
  company: "",
  budget: "",
  service: "",
  message: "",
};

const Contact = () => {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof ContactForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactForm, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ContactForm;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Revisá los campos del formulario");
      return;
    }

    setSubmitting(true);
    try {
      // Simulación de envío. Conectar a un backend cuando esté disponible.
      await new Promise((r) => setTimeout(r, 700));
      toast.success("¡Gracias! Te contactamos en menos de 24h.");
      setForm(initialForm);
    } catch {
      toast.error("Hubo un problema. Intentá nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-b border-border focus:border-foreground outline-none py-3 text-base transition-colors duration-300";

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="pt-32 pb-32 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-20">
              {/* Columna izquierda - info */}
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

                <div className="pt-12 mt-12 border-t border-border space-y-4">
                  <p className="text-muted-foreground">
                    Cada proyecto comienza con una conversación honesta. Escuchamos tu visión,
                    entendemos el problema en profundidad, y construimos soluciones que no solo
                    resuelven — sino que sorprenden.
                  </p>
                </div>
              </div>

              {/* Columna derecha - formulario */}
              <div>
                <h3 className="text-minimal text-muted-foreground mb-8">CONTANOS DE TU PROYECTO</h3>
                <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                  <div>
                    <label htmlFor="name" className="text-minimal text-muted-foreground block mb-2">
                      NOMBRE *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange("name")}
                      maxLength={100}
                      className={inputClass}
                      placeholder="Tu nombre"
                    />
                    {errors.name && <p className="text-destructive text-sm mt-2">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="text-minimal text-muted-foreground block mb-2">
                      EMAIL *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      maxLength={255}
                      className={inputClass}
                      placeholder="tu@empresa.com"
                    />
                    {errors.email && <p className="text-destructive text-sm mt-2">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="company" className="text-minimal text-muted-foreground block mb-2">
                      EMPRESA
                    </label>
                    <input
                      id="company"
                      type="text"
                      value={form.company}
                      onChange={handleChange("company")}
                      maxLength={100}
                      className={inputClass}
                      placeholder="Nombre de tu empresa"
                    />
                  </div>

                  <div>
                    <label htmlFor="service" className="text-minimal text-muted-foreground block mb-2">
                      SERVICIO DE INTERÉS *
                    </label>
                    <select
                      id="service"
                      value={form.service}
                      onChange={handleChange("service")}
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      <option value="">Seleccioná un servicio</option>
                      <option value="plataformas">Plataformas a medida</option>
                      <option value="ia-data">IA &amp; Data</option>
                      <option value="empresarial">Software empresarial</option>
                      <option value="productos-digitales">Productos digitales</option>
                      <option value="otro">Otro</option>
                    </select>
                    {errors.service && <p className="text-destructive text-sm mt-2">{errors.service}</p>}
                  </div>

                  <div>
                    <label htmlFor="budget" className="text-minimal text-muted-foreground block mb-2">
                      PRESUPUESTO ESTIMADO *
                    </label>
                    <select
                      id="budget"
                      value={form.budget}
                      onChange={handleChange("budget")}
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      <option value="">Seleccioná un rango</option>
                      <option value="<10k">Menos de USD 10k</option>
                      <option value="10-30k">USD 10k – 30k</option>
                      <option value="30-80k">USD 30k – 80k</option>
                      <option value=">80k">Más de USD 80k</option>
                    </select>
                    {errors.budget && <p className="text-destructive text-sm mt-2">{errors.budget}</p>}
                  </div>

                  <div>
                    <label htmlFor="message" className="text-minimal text-muted-foreground block mb-2">
                      MENSAJE *
                    </label>
                    <textarea
                      id="message"
                      value={form.message}
                      onChange={handleChange("message")}
                      maxLength={1000}
                      rows={4}
                      className={`${inputClass} resize-none`}
                      placeholder="Contanos sobre tu proyecto, objetivos y plazos..."
                    />
                    <div className="flex justify-between mt-2">
                      {errors.message ? (
                        <p className="text-destructive text-sm">{errors.message}</p>
                      ) : <span />}
                      <p className="text-muted-foreground text-xs">{form.message.length}/1000</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full md:w-auto px-10 py-4 bg-foreground text-background text-minimal hover:bg-muted-foreground transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "ENVIANDO..." : "ENVIAR MENSAJE"}
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
