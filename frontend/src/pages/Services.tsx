import Navigation from "@/components/Navigation";

const Services = () => {
  const services = [
    {
      number: "01",
      title: "RESIDENTIAL",
      description: "Crafting homes that reflect individual lifestyles while maintaining architectural integrity"
    },
    {
      number: "02", 
      title: "COMMERCIAL",
      description: "Designing functional spaces that enhance business environments and user experiences"
    },
    {
      number: "03",
      title: "RENOVATION",
      description: "Transforming existing structures with contemporary sensibilities and sustainable practices"
    },
    {
      number: "04",
      title: "CONSULTATION",
      description: "Providing expert guidance on design direction, planning, and architectural solutions"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="pt-32 pb-32 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <span className="text-xs uppercase tracking-[0.18em] text-[#b4a0ff]/80">SERVICES</span>
              <h2 className="text-5xl md:text-6xl font-semibold leading-tight text-white mt-4">
                What We Do
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-20 gap-y-16">
              {services.map((service, index) => (
                <div key={index} className="group">
                  <div className="flex items-start space-x-6">
                      <span className="text-xs uppercase tracking-[0.18em] text-[#b4a0ff]/80 font-medium">
                      {service.number}
                    </span>
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-4 transition-colors duration-500">
                        {service.title}
                      </h3>
                      <p className="text-base leading-8 text-[#dccdffcc]">
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
    </div>
  );
};

export default Services;